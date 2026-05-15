"use client";

import { useState, useRef } from "react";
import * as XLSX from "xlsx";
import { ImportRegel, parseOpleidingsMatrix } from "@/lib/importExcel";

function downloadSjabloon() {
  // Rijen zijn de categorieën, kolommen zijn de opleidingen
  const rijLabels = [
    "Team / Afdeling",
    "Manager",
    "Naam deelnemer + opleiding",
    "Categorie (vakkennis / gedragscompetenties / coaching)",
    "Prioriteit (noodzakelijk / essentieel / preventief / algemene ontwikkeling)",
    "Niveau (individu / team)",
    "Aantal personen",
    "Kosten (€)",
  ];

  // Twee voorbeeldkolommen
  const voorbeelden = [
    ["ICT", "Marketing"],
    ["Jan de Vries", "Tom Bakker"],
    ["Piet Janssen – Excel training", "Sara Klaas – Leiderschapstraining"],
    ["vakkennis", "gedragscompetenties"],
    ["essentieel", "noodzakelijk"],
    ["individu", "team"],
    [1, 5],
    [450, 3000],
  ];

  const data = rijLabels.map((label, i) => [label, ...voorbeelden[i]]);

  const ws = XLSX.utils.aoa_to_sheet(data);

  // Kolombreedte instellen
  ws["!cols"] = [{ wch: 50 }, { wch: 30 }, { wch: 30 }];

  // Stijl: vette rijlabels (alleen kolom A)
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Opleidingsaanvraag");

  // Instructieblad
  const instructies = [
    ["Instructies voor het invullen"],
    [""],
    ["1. Kolom A bevat de rijlabels — pas deze NIET aan."],
    ["2. Voeg per opleiding een nieuwe kolom toe (B, C, D, ...)."],
    ["3. Vul alle 8 rijen in per kolom."],
    [""],
    ["Rij 4 – Keuze uit:", "vakkennis", "gedragscompetenties", "coaching"],
    ["Rij 5 – Keuze uit:", "noodzakelijk", "essentieel", "preventief", "algemene ontwikkeling"],
    ["Rij 6 – Keuze uit:", "individu", "team"],
    ["Rij 8 – Alleen een getal invullen (geen €-teken)"],
    [""],
    ["Stuur het ingevulde bestand via Teams naar de budgetbeheerder."],
  ];
  const wsInst = XLSX.utils.aoa_to_sheet(instructies);
  wsInst["!cols"] = [{ wch: 40 }, { wch: 25 }, { wch: 25 }, { wch: 25 }, { wch: 25 }];
  XLSX.utils.book_append_sheet(wb, wsInst, "Instructies");

  XLSX.writeFile(wb, "Opleidingsaanvraag_sjabloon.xlsx");
}

interface Props {
  onSuccess: () => void;
  onSluiten: () => void;
}

const BADGE: Record<string, string> = {
  vakkennis: "bg-blue-100 text-blue-700",
  gedragscompetenties: "bg-purple-100 text-purple-700",
  coaching: "bg-teal-100 text-teal-700",
  noodzakelijk: "bg-red-100 text-red-700",
  essentieel: "bg-orange-100 text-orange-700",
  preventief: "bg-yellow-100 text-yellow-700",
  "algemene ontwikkeling": "bg-green-100 text-green-700",
  individu: "bg-gray-100 text-gray-600",
  team: "bg-indigo-100 text-indigo-700",
};

function Badge({ tekst }: { tekst: string }) {
  const kleur = BADGE[tekst?.toLowerCase()] ?? "bg-gray-100 text-gray-500";
  return (
    <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium ${kleur}`}>
      {tekst || "—"}
    </span>
  );
}

export default function ImportModal({ onSuccess, onSluiten }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const vandaag = new Date().toISOString().split("T")[0];

  const [stap, setStap] = useState<"upload" | "preview" | "bezig" | "klaar">("upload");
  const [regels, setRegels] = useState<ImportRegel[]>([]);
  const [geselecteerd, setGeselecteerd] = useState<Set<number>>(new Set());
  const [fout, setFout] = useState("");
  const [resultaat, setResultaat] = useState<{ ingevoerd: number; overgeslagen: number; fouten: string[] } | null>(null);
  const [uitgavenDatum, setUitgavenDatum] = useState(vandaag);
  const [boekingsDatum, setBoekingsDatum] = useState(vandaag);
  const [bestandsnaam, setBestandsnaam] = useState("");
  const [formaatHint, setFormaatHint] = useState("");

  function leesBestand(file: File) {
    setFout("");
    setFormaatHint("");
    setBestandsnaam(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target!.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: "array" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        // Lees als 2D array, ongeacht kolomkopjes
        const matrix: string[][] = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" }) as string[][];

        if (matrix.length < 2) {
          setFout("Bestand bevat te weinig gegevens. Controleer het formaat.");
          return;
        }

        const { regels: gevonden, formaat } = parseOpleidingsMatrix(matrix);

        if (gevonden.length === 0) {
          setFout(
            "Geen geldige opleidingen gevonden. Gebruik het sjabloon: veldlabels in kolom A, elke opleiding in een aparte kolom (B, C, …)."
          );
          return;
        }

        if (formaat === "rijen") {
          setFormaatHint(
            "Dit bestand stond in rijformaat. De gegevens zijn automatisch omgezet naar kolommen voor import."
          );
        }

        setRegels(gevonden);
        setGeselecteerd(new Set(gevonden.map((_, i) => i)));
        setStap("preview");
      } catch {
        setFout("Bestand kon niet worden ingelezen. Gebruik een .xlsx of .xls bestand.");
      }
    };
    reader.readAsArrayBuffer(file);
  }

  function toggleRegel(i: number) {
    setGeselecteerd((prev) => {
      const s = new Set(prev);
      s.has(i) ? s.delete(i) : s.add(i);
      return s;
    });
  }

  function toggleAlles() {
    if (geselecteerd.size === regels.length) {
      setGeselecteerd(new Set());
    } else {
      setGeselecteerd(new Set(regels.map((_, i) => i)));
    }
  }

  async function importeren() {
    setStap("bezig");
    const geselecteerdeRegels = regels.filter((_, i) => geselecteerd.has(i));
    const res = await fetch("/api/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ regels: geselecteerdeRegels, uitgavenDatum, boekingsDatum }),
    });
    const data = await res.json();
    setResultaat(data);
    setStap("klaar");
    if (data.ingevoerd > 0) onSuccess();
  }

  const totalBedrag = regels
    .filter((_, i) => geselecteerd.has(i))
    .reduce((s, r) => s + r.bedrag, 0);

  return (
    <div className="fixed inset-0 bg-black/40 flex items-start justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-5xl my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Bestand importeren</h2>
            {bestandsnaam && <p className="text-xs text-gray-400 mt-0.5">{bestandsnaam}</p>}
          </div>
          <button onClick={onSluiten} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
        </div>

        <div className="p-6 space-y-5">
          {/* STAP: UPLOAD */}
          {stap === "upload" && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 text-sm text-blue-800 space-y-1">
                <p className="font-medium">Verwacht bestandsformaat (.xlsx / .xls)</p>
                <p className="text-blue-700">
                  Veldlabels in <strong>kolom A</strong> (8 rijen). Elke <strong>kolom B, C, D…</strong> is één opleiding.
                </p>
                <div className="grid grid-cols-2 gap-x-6 gap-y-0.5 mt-1 text-blue-700">
                  {[
                    ["Rij 1", "Team / afdeling"],
                    ["Rij 2", "Manager"],
                    ["Rij 3", "Naam deelnemer + opleiding"],
                    ["Rij 4", "Vakkennis / gedragscompetenties / coaching"],
                    ["Rij 5", "Noodzakelijk / essentieel / preventief / algemene ontwikkeling"],
                    ["Rij 6", "Individu / team"],
                    ["Rij 7", "Aantal personen"],
                    ["Rij 8", "Kosten (€)"],
                  ].map(([rij, omschrijving]) => (
                    <div key={rij} className="flex gap-2">
                      <span className="font-mono font-medium w-10 shrink-0">{rij}</span>
                      <span>{omschrijving}</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-blue-600 mt-2">
                  Oude bestanden met labels in de eerste rij worden automatisch omgezet naar kolommen.
                </p>
              </div>

              <div
                onClick={() => inputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) leesBestand(f); }}
                className="border-2 border-dashed border-gray-300 rounded-xl p-10 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
              >
                <p className="text-4xl mb-3">📂</p>
                <p className="font-medium text-gray-700">Sleep een bestand hierheen</p>
                <p className="text-sm text-gray-400 mt-1">of klik om te bladeren</p>
                <p className="text-xs text-gray-300 mt-2">.xlsx, .xls</p>
              </div>
              <input
                ref={inputRef}
                type="file"
                accept=".xlsx,.xls"
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) leesBestand(f); }}
              />
              <div className="flex justify-end">
                <button
                  onClick={downloadSjabloon}
                  className="flex items-center gap-2 text-sm text-green-700 border border-green-300 bg-green-50 hover:bg-green-100 px-4 py-2 rounded-lg transition-colors font-medium"
                >
                  ⬇ Download sjabloon voor collega's
                </button>
              </div>

              {fout && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{fout}</p>}
            </div>
          )}

          {/* STAP: PREVIEW */}
          {stap === "preview" && (
            <div className="space-y-4">
              {formaatHint && (
                <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                  {formaatHint}
                </p>
              )}
              {/* Datums */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Uitgavendatum
                    <span className="ml-1 text-xs text-gray-400 font-normal">wanneer gespendeerd</span>
                  </label>
                  <input type="date" value={uitgavenDatum} onChange={(e) => setUitgavenDatum(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Boekingsdatum
                    <span className="ml-1 text-xs text-gray-400 font-normal">wanneer geregistreerd</span>
                  </label>
                  <input type="date" value={boekingsDatum} onChange={(e) => setBoekingsDatum(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>

              {/* Tabel */}
              <div className="overflow-x-auto rounded-xl border border-gray-200">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                    <tr>
                      <th className="px-3 py-3 text-left">
                        <input type="checkbox" checked={geselecteerd.size === regels.length}
                          onChange={toggleAlles} className="rounded" />
                      </th>
                      <th className="px-3 py-3 text-left">Afdeling</th>
                      <th className="px-3 py-3 text-left">Manager</th>
                      <th className="px-3 py-3 text-left">Deelnemer</th>
                      <th className="px-3 py-3 text-left">Opleiding</th>
                      <th className="px-3 py-3 text-left">Categorie</th>
                      <th className="px-3 py-3 text-left">Prioriteit</th>
                      <th className="px-3 py-3 text-left">Niveau</th>
                      <th className="px-3 py-3 text-center">Personen</th>
                      <th className="px-3 py-3 text-right">Kosten</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {regels.map((r, i) => (
                      <tr key={i} className={geselecteerd.has(i) ? "" : "opacity-40"}>
                        <td className="px-3 py-2">
                          <input type="checkbox" checked={geselecteerd.has(i)}
                            onChange={() => toggleRegel(i)} className="rounded" />
                        </td>
                        <td className="px-3 py-2 font-medium text-gray-900 whitespace-nowrap">{r.afdelingNaam}</td>
                        <td className="px-3 py-2 text-gray-500 whitespace-nowrap">{r.manager}</td>
                        <td className="px-3 py-2 text-gray-700">{r.deelnemerNaam}</td>
                        <td className="px-3 py-2 text-gray-700">{r.opleiding}</td>
                        <td className="px-3 py-2"><Badge tekst={r.categorie} /></td>
                        <td className="px-3 py-2"><Badge tekst={r.prioriteit} /></td>
                        <td className="px-3 py-2"><Badge tekst={r.niveau} /></td>
                        <td className="px-3 py-2 text-center text-gray-600">{r.aantalPersonen}</td>
                        <td className="px-3 py-2 text-right font-medium text-red-600">
                          €{r.bedrag.toLocaleString("nl-NL")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50 border-t border-gray-200">
                    <tr>
                      <td colSpan={8} className="px-3 py-2 text-sm text-gray-500">
                        {geselecteerd.size} van {regels.length} geselecteerd
                      </td>
                      <td className="px-3 py-2 text-right text-sm font-semibold text-gray-900" colSpan={2}>
                        Totaal: €{totalBedrag.toLocaleString("nl-NL")}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              <div className="flex gap-2">
                <button onClick={() => setStap("upload")}
                  className="border border-gray-300 text-gray-600 px-4 py-2 rounded-lg text-sm hover:bg-gray-50 transition-colors">
                  ← Ander bestand
                </button>
                <button onClick={importeren} disabled={geselecteerd.size === 0}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-2 px-4 rounded-lg text-sm transition-colors">
                  {geselecteerd.size} regel{geselecteerd.size !== 1 ? "s" : ""} importeren (€{totalBedrag.toLocaleString("nl-NL")})
                </button>
              </div>
            </div>
          )}

          {/* STAP: BEZIG */}
          {stap === "bezig" && (
            <div className="py-12 text-center text-gray-500">
              <p className="text-4xl mb-3 animate-pulse">⏳</p>
              <p>Importeren…</p>
            </div>
          )}

          {/* STAP: KLAAR */}
          {stap === "klaar" && resultaat && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                  <p className="text-3xl font-bold text-green-700">{resultaat.ingevoerd}</p>
                  <p className="text-sm text-green-600 mt-1">Succesvol ingevoerd</p>
                </div>
                <div className={`border rounded-xl p-4 text-center ${resultaat.overgeslagen > 0 ? "bg-red-50 border-red-200" : "bg-gray-50 border-gray-200"}`}>
                  <p className={`text-3xl font-bold ${resultaat.overgeslagen > 0 ? "text-red-700" : "text-gray-400"}`}>{resultaat.overgeslagen}</p>
                  <p className={`text-sm mt-1 ${resultaat.overgeslagen > 0 ? "text-red-600" : "text-gray-400"}`}>Overgeslagen</p>
                </div>
              </div>

              {resultaat.fouten.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 space-y-1">
                  <p className="text-sm font-medium text-red-800">Meldingen:</p>
                  {resultaat.fouten.map((f, i) => (
                    <p key={i} className="text-xs text-red-700">{f}</p>
                  ))}
                </div>
              )}

              <button onClick={onSluiten}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg text-sm transition-colors">
                Sluiten
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

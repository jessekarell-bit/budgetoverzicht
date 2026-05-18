"use client";

import { useState } from "react";
import { Afdeling, AfdelingNummer } from "@/lib/types";
import { AFDELING_KLEUR_PALET } from "@/lib/afdelingKleur";
import { maakAfdeling, updateAfdeling, verwijderAfdeling } from "@/lib/budgetStore";

interface Props {
  mode: "create" | "edit";
  afdeling?: Afdeling;
  onSuccess: (afdeling: Afdeling) => void;
  onSluiten: () => void;
}

const NUMMERS: AfdelingNummer[] = [1, 2, 3, 4];

export default function AfdelingFormModal({ mode, afdeling, onSuccess, onSluiten }: Props) {
  const [naam, setNaam] = useState(afdeling?.naam ?? "");
  const [manager, setManager] = useState(afdeling?.manager ?? "");
  const [totaalBudget, setTotaalBudget] = useState(
    afdeling ? String(afdeling.totaalBudget) : ""
  );
  const [kleur, setKleur] = useState(afdeling?.kleur ?? AFDELING_KLEUR_PALET[0]);
  const [nummer, setNummer] = useState<AfdelingNummer | "">(afdeling?.nummer ?? "");
  const [bezig, setBezig] = useState(false);
  const [fout, setFout] = useState("");

  function opslaan(e: React.FormEvent) {
    e.preventDefault();
    setBezig(true);
    setFout("");

    const budget = parseFloat(totaalBudget);
    if (isNaN(budget) || budget < 0) {
      setFout("Vul een geldig totaalbudget in.");
      setBezig(false);
      return;
    }

    try {
      const result =
        mode === "create"
          ? maakAfdeling({
              naam,
              manager,
              totaalBudget: budget,
              kleur,
              nummer: nummer === "" ? undefined : nummer,
            })
          : updateAfdeling(afdeling!.id, {
              naam,
              manager,
              totaalBudget: budget,
              kleur,
              nummer: nummer === "" ? null : nummer,
            });
      onSuccess(result);
    } catch (err) {
      setFout(err instanceof Error ? err.message : "Opslaan mislukt.");
    } finally {
      setBezig(false);
    }
  }

  function verwijderen() {
    if (!afdeling) return;
    if (
      !confirm(
        "Afdeling verwijderen? Bestaande boekingen blijven bewaard in het archief en overzicht."
      )
    ) {
      return;
    }
    verwijderAfdeling(afdeling.id);
    onSluiten();
    window.location.href = "/";
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            {mode === "create" ? "Nieuwe afdeling" : "Afdeling bewerken"}
          </h2>
          <button
            type="button"
            onClick={onSluiten}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
          >
            &times;
          </button>
        </div>

        <form onSubmit={opslaan} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Naam afdeling</label>
            <input
              type="text"
              required
              value={naam}
              onChange={(e) => setNaam(e.target.value)}
              placeholder="bijv. Sales"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Manager</label>
            <input
              type="text"
              required
              value={manager}
              onChange={(e) => setManager(e.target.value)}
              placeholder="Naam manager"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Totaalbudget (€)</label>
            <input
              type="number"
              required
              min={0}
              step={100}
              value={totaalBudget}
              onChange={(e) => setTotaalBudget(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {mode === "edit" && afdeling && (
              <p className="text-xs text-gray-400 mt-1">
                Resterend: €{afdeling.resterendBudget.toLocaleString("nl-NL")}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Kleur (Excel)</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {AFDELING_KLEUR_PALET.map((k) => (
                <button
                  key={k}
                  type="button"
                  title={k}
                  onClick={() => setKleur(k)}
                  className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${
                    kleur === k ? "border-gray-900 scale-110" : "border-transparent"
                  }`}
                  style={{ backgroundColor: k }}
                />
              ))}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={kleur}
                onChange={(e) => setKleur(e.target.value)}
                className="w-10 h-10 rounded cursor-pointer border border-gray-200"
              />
              <span className="text-xs text-gray-500 font-mono">{kleur}</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nummer (1–4, eigen kolom in Excel)
            </label>
            <div className="flex gap-2 flex-wrap">
              {NUMMERS.map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setNummer(nummer === n ? "" : n)}
                  className={`w-10 h-10 rounded-lg text-sm font-semibold border transition-colors ${
                    nummer === n
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-gray-600 border-gray-300 hover:border-blue-400"
                  }`}
                >
                  {n}
                </button>
              ))}
              {nummer !== "" && (
                <button
                  type="button"
                  onClick={() => setNummer("")}
                  className="text-xs text-gray-400 hover:text-gray-600 px-2"
                >
                  Wis
                </button>
              )}
            </div>
          </div>

          {fout && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {fout}
            </p>
          )}

          <div className="flex gap-2 pt-1">
            {mode === "edit" && (
              <button
                type="button"
                onClick={verwijderen}
                disabled={bezig}
                className="border border-red-200 text-red-500 hover:bg-red-50 disabled:opacity-50 px-4 py-2 rounded-lg text-sm transition-colors"
              >
                Verwijderen
              </button>
            )}
            <div className="flex-1" />
            <button
              type="button"
              onClick={onSluiten}
              className="border border-gray-300 text-gray-600 px-4 py-2 rounded-lg text-sm hover:bg-gray-50"
            >
              Annuleren
            </button>
            <button
              type="submit"
              disabled={bezig}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium"
            >
              {bezig ? "Bezig…" : mode === "create" ? "Aanmaken" : "Opslaan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

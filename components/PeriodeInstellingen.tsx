"use client";

import { useState } from "react";
import { Instellingen, PeriodeType } from "@/lib/types";
import { saveInstellingen } from "@/lib/budgetStore";

const PERIODE_OPTIES: { value: PeriodeType; label: string }[] = [
  { value: "dag", label: "Per dag" },
  { value: "week", label: "Per week" },
  { value: "maand", label: "Per maand" },
  { value: "kwartaal", label: "Per kwartaal" },
  { value: "jaar", label: "Per jaar" },
];

interface Props {
  instellingen: Instellingen;
  onOpgeslagen: () => void;
  onSluiten: () => void;
}

export default function PeriodeInstellingen({ instellingen, onOpgeslagen, onSluiten }: Props) {
  const [periodeType, setPeriodeType] = useState<PeriodeType>(instellingen.periodeType);
  const [startDatum, setStartDatum] = useState(instellingen.huidigePeriodeStart);
  const [bezig, setBezig] = useState(false);
  const [fout, setFout] = useState("");

  function opslaan() {
    setBezig(true);
    setFout("");
    try {
      saveInstellingen({ periodeType, huidigePeriodeStart: startDatum });
      onOpgeslagen();
    } catch {
      setFout("Opslaan mislukt.");
    } finally {
      setBezig(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Periode-instellingen</h2>
          <button onClick={onSluiten} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Termijn</label>
          <div className="grid grid-cols-5 gap-2">
            {PERIODE_OPTIES.map((o) => (
              <button
                key={o.value}
                onClick={() => setPeriodeType(o.value)}
                className={`py-2 rounded-lg text-sm font-medium border transition-colors ${
                  periodeType === o.value
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-700 border-gray-300 hover:border-blue-400"
                }`}
              >
                {o.label.split(" ")[1]}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Gekozen: <span className="font-medium">{PERIODE_OPTIES.find(o => o.value === periodeType)?.label}</span>
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Startdatum huidige periode</label>
          <input
            type="date"
            value={startDatum}
            onChange={(e) => setStartDatum(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {fout && <p className="text-sm text-red-600">{fout}</p>}

        <div className="flex gap-2 pt-1">
          <button onClick={onSluiten} className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm hover:bg-gray-50 transition-colors">
            Annuleren
          </button>
          <button onClick={opslaan} disabled={bezig} className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-2 rounded-lg text-sm font-medium transition-colors">
            {bezig ? "Opslaan…" : "Opslaan"}
          </button>
        </div>
      </div>
    </div>
  );
}

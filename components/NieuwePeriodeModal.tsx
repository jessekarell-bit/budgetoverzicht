"use client";

import { useState } from "react";
import { PeriodeType } from "@/lib/types";
import { startNieuwePeriode } from "@/lib/budgetStore";

interface Props {
  periodeType: PeriodeType;
  onBevestigd: () => void;
  onSluiten: () => void;
}

export default function NieuwePeriodeModal({ periodeType, onBevestigd, onSluiten }: Props) {
  const [nieuweDatum, setNieuweDatum] = useState(new Date().toISOString().split("T")[0]);
  const [bezig, setBezig] = useState(false);
  const [fout, setFout] = useState("");

  function starten() {
    setBezig(true);
    setFout("");
    try {
      startNieuwePeriode(nieuweDatum);
      onBevestigd();
    } catch {
      setFout("Er ging iets mis.");
    } finally {
      setBezig(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Nieuwe periode starten</h2>
          <button onClick={onSluiten} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm text-amber-800">
          <p className="font-medium mb-1">Let op</p>
          <p>De huidige boekingen worden gearchiveerd en alle budgetten worden teruggezet naar het totaalbedrag.</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Startdatum nieuwe periode</label>
          <input
            type="date"
            value={nieuweDatum}
            onChange={(e) => setNieuweDatum(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {fout && <p className="text-sm text-red-600">{fout}</p>}

        <div className="flex gap-2 pt-1">
          <button onClick={onSluiten} className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm hover:bg-gray-50 transition-colors">
            Annuleren
          </button>
          <button onClick={starten} disabled={bezig} className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white py-2 rounded-lg text-sm font-medium transition-colors">
            {bezig ? "Bezig…" : "Periode starten & budgetten resetten"}
          </button>
        </div>
      </div>
    </div>
  );
}

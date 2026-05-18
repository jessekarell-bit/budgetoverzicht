"use client";

import { useState } from "react";
import { Afdeling } from "@/lib/types";
import { maakAfdeling, updateAfdeling, verwijderAfdeling } from "@/lib/budgetStore";

interface Props {
  mode: "create" | "edit";
  afdeling?: Afdeling;
  onSuccess: (afdeling: Afdeling) => void;
  onSluiten: () => void;
}

export default function AfdelingFormModal({ mode, afdeling, onSuccess, onSluiten }: Props) {
  const [naam, setNaam] = useState(afdeling?.naam ?? "");
  const [manager, setManager] = useState(afdeling?.manager ?? "");
  const [totaalBudget, setTotaalBudget] = useState(
    afdeling ? String(afdeling.totaalBudget) : ""
  );
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
          ? maakAfdeling({ naam, manager, totaalBudget: budget })
          : updateAfdeling(afdeling!.id, { naam, manager, totaalBudget: budget });
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
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
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

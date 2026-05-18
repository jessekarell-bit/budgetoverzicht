"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Afdeling, Boeking } from "@/lib/types";
import BudgetBalk from "@/components/BudgetBalk";
import BoekingForm from "@/components/BoekingForm";
import AfdelingFormModal from "@/components/AfdelingFormModal";
import { getBudgetten, getBoekingen } from "@/lib/budgetStore";
import { kleurVoorAfdeling } from "@/lib/afdelingKleur";

export default function AfdelingPagina() {
  const { slug } = useParams<{ slug: string }>();
  const [afdeling, setAfdeling] = useState<Afdeling | null>(null);
  const [boekingen, setBoekingen] = useState<Boeking[]>([]);
  const [afdelingen, setAfdelingen] = useState<Afdeling[]>([]);
  const [toonFormulier, setToonFormulier] = useState(false);
  const [toonBewerken, setToonBewerken] = useState(false);

  const laadData = useCallback(() => {
    const alle = getBudgetten();
    const alleBoekingen = getBoekingen();
    setAfdelingen(alle);
    setAfdeling(alle.find((a) => a.id === slug) ?? null);
    setBoekingen(alleBoekingen.filter((b) => b.afdelingId === slug));
  }, [slug]);

  useEffect(() => { laadData(); }, [laadData]);

  if (!afdeling) return <p className="p-8 text-gray-500">Laden…</p>;

  const afdelingIndex = afdelingen.findIndex((a) => a.id === slug);
  const kleur = kleurVoorAfdeling(afdeling.kleur, afdelingIndex >= 0 ? afdelingIndex : 0);
  const gebruikt = afdeling.totaalBudget - afdeling.resterendBudget;

  return (
    <main className="min-h-screen bg-gray-50">
      {toonBewerken && (
        <AfdelingFormModal
          mode="edit"
          afdeling={afdeling}
          onSuccess={() => { setToonBewerken(false); laadData(); }}
          onSluiten={() => setToonBewerken(false)}
        />
      )}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4">
        <Link href="/" className="text-gray-400 hover:text-gray-600 text-sm">← Overzicht</Link>
        <span
          className="w-3 h-3 rounded-full shrink-0"
          style={{ backgroundColor: kleur }}
          title="Afdelingskleur"
        />
        <h1 className="text-xl font-bold text-gray-900">{afdeling.naam}</h1>
        {afdeling.nummer != null && (
          <span
            className="text-xs font-bold text-white w-6 h-6 rounded-full flex items-center justify-center shrink-0"
            style={{ backgroundColor: kleur }}
          >
            {afdeling.nummer}
          </span>
        )}
        <span className="text-sm text-gray-500">{afdeling.manager}</span>
        <button
          type="button"
          onClick={() => setToonBewerken(true)}
          className="ml-auto border border-gray-300 text-gray-600 hover:bg-gray-50 text-sm font-medium px-3 py-1.5 rounded-lg transition-colors"
        >
          Bewerken
        </button>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* Budget kaart */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div className="flex justify-between text-sm text-gray-500">
            <span>Totaalbudget</span>
            <span className="font-medium text-gray-900">€{afdeling.totaalBudget.toLocaleString("nl-NL")}</span>
          </div>
          <BudgetBalk totaal={afdeling.totaalBudget} resterend={afdeling.resterendBudget} />
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-green-50 rounded-lg p-3">
              <p className="text-green-700 font-medium">€{afdeling.resterendBudget.toLocaleString("nl-NL")}</p>
              <p className="text-green-600 text-xs mt-1">Resterend</p>
            </div>
            <div className="bg-red-50 rounded-lg p-3">
              <p className="text-red-700 font-medium">€{gebruikt.toLocaleString("nl-NL")}</p>
              <p className="text-red-600 text-xs mt-1">Gebruikt</p>
            </div>
          </div>
        </div>

        {/* Afschrijven */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-800">Afschrijving</h2>
            <button
              onClick={() => setToonFormulier((v) => !v)}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              {toonFormulier ? "Sluiten" : "+ Nieuw"}
            </button>
          </div>
          {toonFormulier && (
            <BoekingForm
              afdelingen={afdelingen}
              defaultAfdelingId={slug}
              onSuccess={() => { setToonFormulier(false); laadData(); }}
            />
          )}
        </div>

        {/* Boekingen tabel */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800">Boekingen ({boekingen.length})</h2>
          </div>
          {boekingen.length === 0 ? (
            <p className="px-6 py-8 text-center text-gray-400 text-sm">Nog geen boekingen.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                <tr>
                  <th className="px-6 py-3 text-left">Uitgavendatum</th>
                  <th className="px-6 py-3 text-left">Boekingsdatum</th>
                  <th className="px-6 py-3 text-left">Omschrijving</th>
                  <th className="px-6 py-3 text-left">Geboekt door</th>
                  <th className="px-6 py-3 text-right">Bedrag</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {boekingen.map((b) => (
                  <tr key={b.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3 text-gray-900 whitespace-nowrap">
                      {new Date(b.uitgavenDatum ?? b.datum ?? "").toLocaleDateString("nl-NL")}
                    </td>
                    <td className="px-6 py-3 text-gray-400 whitespace-nowrap text-xs">
                      {new Date(b.boekingsDatum ?? b.datum ?? "").toLocaleDateString("nl-NL")}
                    </td>
                    <td className="px-6 py-3 text-gray-900">{b.omschrijving}</td>
                    <td className="px-6 py-3 text-gray-500">{b.geboektDoor}</td>
                    <td className="px-6 py-3 text-right font-medium text-red-600">
                      −€{b.bedrag.toLocaleString("nl-NL")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </main>
  );
}

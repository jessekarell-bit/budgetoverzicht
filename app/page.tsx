"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Afdeling, Instellingen, periodeLabel } from "@/lib/types";
import BudgetBalk from "@/components/BudgetBalk";
import BoekingForm from "@/components/BoekingForm";
import ExportKnop from "@/components/ExportKnop";
import PeriodeInstellingen from "@/components/PeriodeInstellingen";
import NieuwePeriodeModal from "@/components/NieuwePeriodeModal";
import ImportModal from "@/components/ImportModal";
import AfdelingFormModal from "@/components/AfdelingFormModal";

export default function Home() {
  const [afdelingen, setAfdelingen] = useState<Afdeling[]>([]);
  const [instellingen, setInstellingen] = useState<Instellingen | null>(null);
  const [toonFormulier, setToonFormulier] = useState(false);
  const [toonInstellingen, setToonInstellingen] = useState(false);
  const [toonNieuwePeriode, setToonNieuwePeriode] = useState(false);
  const [toonImport, setToonImport] = useState(false);
  const [afdelingModal, setAfdelingModal] = useState<"create" | Afdeling | null>(null);

  const laadData = useCallback(async () => {
    const [budRes, instRes] = await Promise.all([
      fetch("/api/budgetten"),
      fetch("/api/instellingen"),
    ]);
    setAfdelingen(await budRes.json());
    setInstellingen(await instRes.json());
  }, []);

  useEffect(() => { laadData(); }, [laadData]);

  return (
    <main className="min-h-screen bg-gray-50">
      {toonInstellingen && instellingen && (
        <PeriodeInstellingen
          instellingen={instellingen}
          onOpgeslagen={() => { setToonInstellingen(false); laadData(); }}
          onSluiten={() => setToonInstellingen(false)}
        />
      )}
      {toonImport && (
        <ImportModal
          onSuccess={() => laadData()}
          onSluiten={() => setToonImport(false)}
        />
      )}
      {afdelingModal === "create" && (
        <AfdelingFormModal
          mode="create"
          onSuccess={() => { setAfdelingModal(null); laadData(); }}
          onSluiten={() => setAfdelingModal(null)}
        />
      )}
      {afdelingModal && afdelingModal !== "create" && (
        <AfdelingFormModal
          mode="edit"
          afdeling={afdelingModal}
          onSuccess={() => { setAfdelingModal(null); laadData(); }}
          onSluiten={() => setAfdelingModal(null)}
        />
      )}
      {toonNieuwePeriode && instellingen && (
        <NieuwePeriodeModal
          periodeType={instellingen.periodeType}
          onBevestigd={() => { setToonNieuwePeriode(false); laadData(); }}
          onSluiten={() => setToonNieuwePeriode(false)}
        />
      )}

      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Budgetbeheer</h1>
          {instellingen && (
            <p className="text-xs text-gray-400 mt-0.5">
              {periodeLabel(instellingen.periodeType, instellingen.huidigePeriodeStart)}
            </p>
          )}
        </div>
        <div className="flex gap-2 flex-wrap justify-end">
          <Link
            href="/archief"
            className="border border-gray-300 text-gray-600 hover:bg-gray-50 text-sm font-medium px-3 py-2 rounded-lg transition-colors"
          >
            Archief
          </Link>
          <button
            onClick={() => setToonImport(true)}
            className="border border-gray-300 text-gray-600 hover:bg-gray-50 text-sm font-medium px-3 py-2 rounded-lg transition-colors"
          >
            📂 Importeer bestand
          </button>
          <button
            onClick={() => setToonInstellingen(true)}
            className="border border-gray-300 text-gray-600 hover:bg-gray-50 text-sm font-medium px-3 py-2 rounded-lg transition-colors"
          >
            ⚙ Periode
          </button>
          <button
            onClick={() => setToonNieuwePeriode(true)}
            className="border border-orange-300 text-orange-600 hover:bg-orange-50 text-sm font-medium px-3 py-2 rounded-lg transition-colors"
          >
            Nieuwe periode
          </button>
          <ExportKnop />
          <button
            onClick={() => setToonFormulier((v) => !v)}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            {toonFormulier ? "Sluiten" : "+ Afschrijven"}
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {toonFormulier && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Nieuwe afschrijving</h2>
            <BoekingForm
              afdelingen={afdelingen}
              onSuccess={() => { setToonFormulier(false); laadData(); }}
            />
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          {afdelingen.map((a) => {
            const gebruikt = a.totaalBudget - a.resterendBudget;
            const pct = a.totaalBudget > 0 ? Math.round((gebruikt / a.totaalBudget) * 100) : 0;
            return (
              <div
                key={a.id}
                className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow relative group"
              >
                <button
                  type="button"
                  onClick={() => setAfdelingModal(a)}
                  title="Afdeling bewerken"
                  className="absolute top-3 right-3 text-gray-400 hover:text-blue-600 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity p-1 rounded"
                >
                  ✎
                </button>
                <Link href={`/afdeling/${a.id}`} className="block">
                  <div className="flex items-start justify-between mb-3 pr-6">
                    <div>
                      <p className="font-semibold text-gray-900">{a.naam}</p>
                      <p className="text-sm text-gray-500">{a.manager}</p>
                    </div>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full shrink-0">
                      {pct}% gebruikt
                    </span>
                  </div>
                  <BudgetBalk totaal={a.totaalBudget} resterend={a.resterendBudget} />
                  <div className="flex justify-between mt-3 text-sm">
                    <span className="text-gray-500">Resterend</span>
                    <span className="font-medium text-gray-900">
                      €{a.resterendBudget.toLocaleString("nl-NL")} / €{a.totaalBudget.toLocaleString("nl-NL")}
                    </span>
                  </div>
                </Link>
              </div>
            );
          })}
          <button
            type="button"
            onClick={() => setAfdelingModal("create")}
            className="bg-white rounded-xl border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50 p-5 flex flex-col items-center justify-center gap-2 transition-colors min-h-[140px]"
          >
            <span className="text-2xl text-gray-300">+</span>
            <span className="text-sm font-medium text-gray-400">Nieuwe afdeling</span>
          </button>
        </div>
      </div>
    </main>
  );
}

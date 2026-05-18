"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArchiefPeriode, periodeLabel } from "@/lib/types";
import { getArchief } from "@/lib/budgetStore";

export default function ArchiefPagina() {
  const [archief, setArchief] = useState<ArchiefPeriode[]>([]);
  const [open, setOpen] = useState<string | null>(null);

  useEffect(() => {
    setArchief(getArchief());
  }, []);

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4">
        <Link href="/" className="text-gray-400 hover:text-gray-600 text-sm">← Terug</Link>
        <h1 className="text-xl font-bold text-gray-900">Archief</h1>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-4">
        {archief.length === 0 && (
          <p className="text-center text-gray-400 text-sm py-12">Nog geen gearchiveerde periodes.</p>
        )}

        {archief.map((p) => {
          const totalGebruikt = p.boekingen.reduce((s, b) => s + b.bedrag, 0);
          const isOpen = open === p.id;
          return (
            <div key={p.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <button
                onClick={() => setOpen(isOpen ? null : p.id)}
                className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
              >
                <div className="text-left">
                  <p className="font-semibold text-gray-900">{periodeLabel(p.periodeType, p.periodeStart)}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {new Date(p.periodeStart).toLocaleDateString("nl-NL")} – {new Date(p.periodeEinde).toLocaleDateString("nl-NL")}
                    &nbsp;·&nbsp; {p.boekingen.length} boeking{p.boekingen.length !== 1 ? "en" : ""}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-red-600">−€{totalGebruikt.toLocaleString("nl-NL")}</p>
                  <p className="text-xs text-gray-400">{isOpen ? "▲ sluiten" : "▼ tonen"}</p>
                </div>
              </button>

              {isOpen && (
                <div className="border-t border-gray-100">
                  {/* Budget snapshot */}
                  <div className="px-6 py-4 bg-gray-50">
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-3">Budgetten einde periode</p>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {p.budgetSnapshot.map((a) => {
                        const gebruikt = a.totaalBudget - a.resterendBudget;
                        return (
                          <div key={a.id} className="bg-white rounded-lg border border-gray-200 px-3 py-2 text-sm">
                            <p className="font-medium text-gray-900">{a.naam}</p>
                            <p className="text-red-600">−€{gebruikt.toLocaleString("nl-NL")}</p>
                            <p className="text-gray-400 text-xs">resterend €{a.resterendBudget.toLocaleString("nl-NL")}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Boekingen */}
                  {p.boekingen.length > 0 && (
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                        <tr>
                          <th className="px-6 py-2 text-left">Uitgavendatum</th>
                          <th className="px-6 py-2 text-left">Boekingsdatum</th>
                          <th className="px-6 py-2 text-left">Afdeling</th>
                          <th className="px-6 py-2 text-left">Omschrijving</th>
                          <th className="px-6 py-2 text-left">Door</th>
                          <th className="px-6 py-2 text-right">Bedrag</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {p.boekingen.map((b) => (
                          <tr key={b.id}>
                            <td className="px-6 py-2 text-gray-900">{new Date(b.uitgavenDatum ?? b.datum ?? "").toLocaleDateString("nl-NL")}</td>
                            <td className="px-6 py-2 text-gray-400 text-xs">{new Date(b.boekingsDatum ?? b.datum ?? "").toLocaleDateString("nl-NL")}</td>
                            <td className="px-6 py-2">{b.afdelingNaam}</td>
                            <td className="px-6 py-2 text-gray-600">{b.omschrijving}</td>
                            <td className="px-6 py-2 text-gray-500">{b.geboektDoor}</td>
                            <td className="px-6 py-2 text-right font-medium text-red-600">−€{b.bedrag.toLocaleString("nl-NL")}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </main>
  );
}

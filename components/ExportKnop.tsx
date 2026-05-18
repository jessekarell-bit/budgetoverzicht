"use client";

import { useState } from "react";
import * as XLSX from "xlsx";
import { getBudgetten, getBoekingen } from "@/lib/budgetStore";

export default function ExportKnop() {
  const [bezig, setBezig] = useState(false);

  function handleExport() {
    setBezig(true);

    const afdelingen = getBudgetten();
    const boekingen = getBoekingen();

    // Tabblad 1: Budgetten
    const budgetRijen = afdelingen.map((a) => ({
      Afdeling: a.naam,
      Manager: a.manager,
      "Totaal budget (€)": a.totaalBudget,
      "Gebruikt (€)": a.totaalBudget - a.resterendBudget,
      "Resterend (€)": a.resterendBudget,
      "Gebruikt (%)": Math.round(((a.totaalBudget - a.resterendBudget) / a.totaalBudget) * 100),
    }));

    // Tabblad 2: Boekingen
    const boekingRijen = boekingen.map((b) => ({
      Uitgavendatum: new Date(b.uitgavenDatum ?? b.datum ?? "").toLocaleDateString("nl-NL"),
      Boekingsdatum: new Date(b.boekingsDatum ?? b.datum ?? "").toLocaleDateString("nl-NL"),
      Afdeling: b.afdelingNaam,
      Omschrijving: b.omschrijving,
      "Bedrag (€)": b.bedrag,
      "Geboekt door": b.geboektDoor,
    }));

    const wb = XLSX.utils.book_new();

    const wsBudget = XLSX.utils.json_to_sheet(budgetRijen);
    wsBudget["!cols"] = [
      { wch: 16 }, { wch: 18 }, { wch: 18 }, { wch: 14 }, { wch: 14 }, { wch: 12 },
    ];
    XLSX.utils.book_append_sheet(wb, wsBudget, "Budgetten");

    const wsBoekingen = XLSX.utils.json_to_sheet(boekingRijen);
    wsBoekingen["!cols"] = [
      { wch: 14 }, { wch: 14 }, { wch: 16 }, { wch: 30 }, { wch: 12 }, { wch: 18 },
    ];
    XLSX.utils.book_append_sheet(wb, wsBoekingen, "Boekingen");

    const maand = new Date().toLocaleDateString("nl-NL", { month: "long", year: "numeric" });
    XLSX.writeFile(wb, `Budgetoverzicht_${maand}.xlsx`);

    setBezig(false);
  }

  return (
    <button
      onClick={handleExport}
      disabled={bezig}
      className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
      {bezig ? "Exporteren…" : "Exporteer naar Excel"}
    </button>
  );
}

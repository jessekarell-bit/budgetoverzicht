import * as XLSX from "xlsx-js-style";
import { Afdeling, Boeking } from "@/lib/types";
import { hexNaarExcelRgb, kleurVoorAfdeling, tekstKleurOpAchtergrond } from "@/lib/afdelingKleur";

function celStijl(achtergrondHex: string): XLSX.CellStyle {
  const rgb = hexNaarExcelRgb(achtergrondHex);
  const tekst = tekstKleurOpAchtergrond(achtergrondHex);
  return {
    fill: { patternType: "solid", fgColor: { rgb } },
    font: { color: { rgb: tekst } },
  };
}

function styleRij(ws: XLSX.WorkSheet, rijIndex: number, achtergrondHex: string) {
  const ref = ws["!ref"];
  if (!ref) return;
  const range = XLSX.utils.decode_range(ref);
  const stijl = celStijl(achtergrondHex);
  for (let c = range.s.c; c <= range.e.c; c++) {
    const addr = XLSX.utils.encode_cell({ r: rijIndex, c });
    if (!ws[addr]) ws[addr] = { t: "s", v: "" };
    ws[addr].s = { ...(ws[addr].s ?? {}), ...stijl };
  }
}

function afdelingMap(afdelingen: Afdeling[]): Map<string, Afdeling> {
  return new Map(afdelingen.map((a) => [a.id, a]));
}

export function exportBudgetNaarExcel(afdelingen: Afdeling[], boekingen: Boeking[], bestandsnaam: string) {
  const idNaarAfdeling = afdelingMap(afdelingen);

  const budgetRijen = afdelingen.map((a, i) => {
    const kleur = kleurVoorAfdeling(a.kleur, i);
    const gebruikt = a.totaalBudget - a.resterendBudget;
    return {
      Afdeling: a.naam,
      Manager: a.manager,
      Nummer: a.nummer ?? "",
      Kleur: kleur,
      "Totaal budget (€)": a.totaalBudget,
      "Gebruikt (€)": gebruikt,
      "Resterend (€)": a.resterendBudget,
      "Gebruikt (%)": a.totaalBudget > 0 ? Math.round((gebruikt / a.totaalBudget) * 100) : 0,
    };
  });

  const boekingRijen = boekingen.map((b) => {
    const a = idNaarAfdeling.get(b.afdelingId);
    const idx = afdelingen.findIndex((x) => x.id === b.afdelingId);
    const kleur = a ? kleurVoorAfdeling(a.kleur, idx >= 0 ? idx : 0) : "#E5E7EB";
    return {
      Uitgavendatum: new Date(b.uitgavenDatum ?? b.datum ?? "").toLocaleDateString("nl-NL"),
      Boekingsdatum: new Date(b.boekingsDatum ?? b.datum ?? "").toLocaleDateString("nl-NL"),
      Afdeling: b.afdelingNaam,
      Nummer: a?.nummer ?? "",
      Kleur: kleur,
      Omschrijving: b.omschrijving,
      "Bedrag (€)": b.bedrag,
      "Geboekt door": b.geboektDoor,
    };
  });

  const wb = XLSX.utils.book_new();

  const wsBudget = XLSX.utils.json_to_sheet(budgetRijen);
  wsBudget["!cols"] = [
    { wch: 16 },
    { wch: 18 },
    { wch: 8 },
    { wch: 10 },
    { wch: 18 },
    { wch: 14 },
    { wch: 14 },
    { wch: 12 },
  ];
  afdelingen.forEach((a, i) => {
    styleRij(wsBudget, i + 1, kleurVoorAfdeling(a.kleur, i));
  });
  XLSX.utils.book_append_sheet(wb, wsBudget, "Budgetten");

  const wsBoekingen = XLSX.utils.json_to_sheet(boekingRijen);
  wsBoekingen["!cols"] = [
    { wch: 14 },
    { wch: 14 },
    { wch: 16 },
    { wch: 8 },
    { wch: 10 },
    { wch: 30 },
    { wch: 12 },
    { wch: 18 },
  ];
  boekingen.forEach((b, i) => {
    const a = idNaarAfdeling.get(b.afdelingId);
    const idx = afdelingen.findIndex((x) => x.id === b.afdelingId);
    const kleur = a ? kleurVoorAfdeling(a.kleur, idx >= 0 ? idx : 0) : "#F3F4F6";
    styleRij(wsBoekingen, i + 1, kleur);
  });
  XLSX.utils.book_append_sheet(wb, wsBoekingen, "Boekingen");

  XLSX.writeFile(wb, bestandsnaam);
}

import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import {
  getBudgetten, getBoekingen, getInstellingen, getArchief,
  saveBudgetten, saveBoekingen, saveInstellingen, saveArchief,
} from "@/lib/data";

// POST: start een nieuwe periode (archiveer huidig + reset budgetten)
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { nieuwePeriodeStart } = body;

  if (!nieuwePeriodeStart) {
    return NextResponse.json({ error: "Nieuwe startdatum is verplicht." }, { status: 400 });
  }

  const instellingen = getInstellingen();
  const budgetten = getBudgetten();
  const boekingen = getBoekingen();
  const archief = getArchief();

  // Archiveer de huidige periode
  const archiefItem = {
    id: randomUUID(),
    periodeType: instellingen.periodeType,
    periodeStart: instellingen.huidigePeriodeStart,
    periodeEinde: new Date(Date.now() - 86400000).toISOString().split("T")[0], // gisteren
    boekingen,
    budgetSnapshot: budgetten.map((a) => ({ ...a })),
  };

  archief.unshift(archiefItem);
  saveArchief(archief);

  // Reset budgetten
  const gereset = budgetten.map((a) => ({ ...a, resterendBudget: a.totaalBudget }));
  saveBudgetten(gereset);

  // Lege boekingen
  saveBoekingen([]);

  // Sla nieuwe periode op
  saveInstellingen({ ...instellingen, huidigePeriodeStart: nieuwePeriodeStart });

  return NextResponse.json({ ok: true });
}

// GET: haal archief op
export async function GET() {
  return NextResponse.json(getArchief());
}

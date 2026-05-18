import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import {
  getBudgetten, getBoekingen, getInstellingen, getArchief,
  saveBudgetten, saveBoekingen, saveInstellingen, saveArchief,
} from "@/lib/data";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { nieuwePeriodeStart } = body;

    if (!nieuwePeriodeStart) {
      return NextResponse.json({ error: "Nieuwe startdatum is verplicht." }, { status: 400 });
    }

    const instellingen = await getInstellingen();
    const budgetten = await getBudgetten();
    const boekingen = await getBoekingen();
    const archief = await getArchief();

    const archiefItem = {
      id: randomUUID(),
      periodeType: instellingen.periodeType,
      periodeStart: instellingen.huidigePeriodeStart,
      periodeEinde: new Date(Date.now() - 86400000).toISOString().split("T")[0],
      boekingen,
      budgetSnapshot: budgetten.map((a) => ({ ...a })),
    };

    archief.unshift(archiefItem);
    await saveArchief(archief);

    const gereset = budgetten.map((a) => ({ ...a, resterendBudget: a.totaalBudget }));
    await saveBudgetten(gereset);
    await saveBoekingen([]);
    await saveInstellingen({ ...instellingen, huidigePeriodeStart: nieuwePeriodeStart });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("POST /api/periode:", e);
    return NextResponse.json({ error: "Kon periode niet starten." }, { status: 500 });
  }
}

export async function GET() {
  try {
    return NextResponse.json(await getArchief());
  } catch (e) {
    console.error("GET /api/periode:", e);
    return NextResponse.json({ error: "Kon archief niet laden." }, { status: 500 });
  }
}

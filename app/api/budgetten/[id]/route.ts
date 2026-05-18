import { NextRequest, NextResponse } from "next/server";
import { getBudgetten, getBoekingen, saveBudgetten, saveBoekingen } from "@/lib/data";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const body = await req.json();
  const { naam, manager, totaalBudget } = body as {
    naam?: string;
    manager?: string;
    totaalBudget?: number;
  };

  const budgetten = getBudgetten();
  const idx = budgetten.findIndex((a) => a.id === id);
  if (idx === -1) {
    return NextResponse.json({ error: "Afdeling niet gevonden." }, { status: 404 });
  }

  const oud = budgetten[idx];
  const nieuweNaam = (naam ?? oud.naam).trim();
  const nieuweManager = (manager ?? oud.manager).trim();
  const nieuwTotaal = totaalBudget !== undefined ? Number(totaalBudget) : oud.totaalBudget;

  if (!nieuweNaam || !nieuweManager) {
    return NextResponse.json({ error: "Naam en manager zijn verplicht." }, { status: 400 });
  }
  if (isNaN(nieuwTotaal) || nieuwTotaal < 0) {
    return NextResponse.json({ error: "Ongeldig totaalbudget." }, { status: 400 });
  }

  const verschil = nieuwTotaal - oud.totaalBudget;
  budgetten[idx] = {
    ...oud,
    naam: nieuweNaam,
    manager: nieuweManager,
    totaalBudget: nieuwTotaal,
    resterendBudget: Math.max(0, oud.resterendBudget + verschil),
  };
  saveBudgetten(budgetten);

  if (nieuweNaam !== oud.naam) {
    const boekingen = getBoekingen();
    let gewijzigd = false;
    for (const b of boekingen) {
      if (b.afdelingId === id) {
        b.afdelingNaam = nieuweNaam;
        gewijzigd = true;
      }
    }
    if (gewijzigd) saveBoekingen(boekingen);
  }

  return NextResponse.json(budgetten[idx]);
}

export async function DELETE(_req: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const budgetten = getBudgetten();
  if (!budgetten.some((a) => a.id === id)) {
    return NextResponse.json({ error: "Afdeling niet gevonden." }, { status: 404 });
  }

  saveBudgetten(budgetten.filter((a) => a.id !== id));
  return NextResponse.json({ ok: true });
}

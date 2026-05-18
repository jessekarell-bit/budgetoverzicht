import { NextRequest, NextResponse } from "next/server";
import { getBudgetten, getBoekingen, saveBudgetten, saveBoekingen } from "@/lib/data";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    const { naam, manager, totaalBudget, kleur, nummer } = body as {
      naam?: string;
      manager?: string;
      totaalBudget?: number;
      kleur?: string;
      nummer?: 1 | 2 | 3 | 4 | null;
    };

    const budgetten = await getBudgetten();
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
    const kleurGeldig = kleur && /^#[0-9A-Fa-f]{6}$/.test(kleur) ? kleur : undefined;
    budgetten[idx] = {
      ...oud,
      naam: nieuweNaam,
      manager: nieuweManager,
      totaalBudget: nieuwTotaal,
      resterendBudget: Math.max(0, oud.resterendBudget + verschil),
      ...(kleurGeldig ? { kleur: kleurGeldig } : kleur === undefined ? {} : { kleur: oud.kleur }),
      ...(nummer === null
        ? { nummer: undefined }
        : nummer && [1, 2, 3, 4].includes(nummer)
          ? { nummer }
          : {}),
    };
    await saveBudgetten(budgetten);

    if (nieuweNaam !== oud.naam) {
      const boekingen = await getBoekingen();
      let gewijzigd = false;
      for (const b of boekingen) {
        if (b.afdelingId === id) {
          b.afdelingNaam = nieuweNaam;
          gewijzigd = true;
        }
      }
      if (gewijzigd) await saveBoekingen(boekingen);
    }

    return NextResponse.json(budgetten[idx]);
  } catch (e) {
    console.error("PATCH /api/budgetten:", e);
    return NextResponse.json({ error: "Kon afdeling niet bijwerken." }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const budgetten = await getBudgetten();
    if (!budgetten.some((a) => a.id === id)) {
      return NextResponse.json({ error: "Afdeling niet gevonden." }, { status: 404 });
    }

    await saveBudgetten(budgetten.filter((a) => a.id !== id));
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("DELETE /api/budgetten:", e);
    return NextResponse.json({ error: "Kon afdeling niet verwijderen." }, { status: 500 });
  }
}

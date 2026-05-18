import { NextRequest, NextResponse } from "next/server";
import { getBudgetten, saveBudgetten } from "@/lib/data";
import { maakAfdelingId } from "@/lib/afdelingId";

export async function GET() {
  try {
    const budgetten = await getBudgetten();
    return NextResponse.json(budgetten);
  } catch (e) {
    console.error("GET /api/budgetten:", e);
    return NextResponse.json({ error: "Kon budgetten niet laden." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { naam, manager, totaalBudget, kleur, nummer } = body as {
      naam?: string;
      manager?: string;
      totaalBudget?: number;
      kleur?: string;
      nummer?: 1 | 2 | 3 | 4;
    };

    const naamTrim = (naam ?? "").trim();
    const managerTrim = (manager ?? "").trim();
    const budget = Number(totaalBudget);

    if (!naamTrim || !managerTrim) {
      return NextResponse.json({ error: "Naam en manager zijn verplicht." }, { status: 400 });
    }
    if (isNaN(budget) || budget < 0) {
      return NextResponse.json({ error: "Ongeldig totaalbudget." }, { status: 400 });
    }

    const budgetten = await getBudgetten();
    const nieuw = {
      id: maakAfdelingId(naamTrim, budgetten),
      naam: naamTrim,
      manager: managerTrim,
      totaalBudget: budget,
      resterendBudget: budget,
      ...(kleur && /^#[0-9A-Fa-f]{6}$/.test(kleur) ? { kleur } : {}),
      ...(nummer && [1, 2, 3, 4].includes(nummer) ? { nummer } : {}),
    };

    budgetten.push(nieuw);
    await saveBudgetten(budgetten);

    return NextResponse.json(nieuw, { status: 201 });
  } catch (e) {
    console.error("POST /api/budgetten:", e);
    return NextResponse.json(
      { error: "Kon afdeling niet opslaan. Probeer het opnieuw of neem contact op met de beheerder." },
      { status: 500 }
    );
  }
}

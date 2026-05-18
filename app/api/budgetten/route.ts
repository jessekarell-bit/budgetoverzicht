import { NextRequest, NextResponse } from "next/server";
import { getBudgetten, saveBudgetten } from "@/lib/data";
import { maakAfdelingId } from "@/lib/afdelingId";

export async function GET() {
  const budgetten = getBudgetten();
  return NextResponse.json(budgetten);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { naam, manager, totaalBudget } = body as {
    naam?: string;
    manager?: string;
    totaalBudget?: number;
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

  const budgetten = getBudgetten();
  const nieuw = {
    id: maakAfdelingId(naamTrim, budgetten),
    naam: naamTrim,
    manager: managerTrim,
    totaalBudget: budget,
    resterendBudget: budget,
  };

  budgetten.push(nieuw);
  saveBudgetten(budgetten);

  return NextResponse.json(nieuw, { status: 201 });
}

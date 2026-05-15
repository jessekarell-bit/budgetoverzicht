import { NextRequest, NextResponse } from "next/server";
import { getBudgetten, getBoekingen, saveBudgetten, saveBoekingen, Boeking } from "@/lib/data";
import { randomUUID } from "crypto";

export async function GET() {
  const boekingen = getBoekingen();
  return NextResponse.json(boekingen);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { afdelingId, bedrag, omschrijving, geboektDoor, boekingsDatum, uitgavenDatum } = body;

  if (!afdelingId || !bedrag || !omschrijving || !geboektDoor || !uitgavenDatum) {
    return NextResponse.json({ error: "Alle velden zijn verplicht." }, { status: 400 });
  }

  const bedragNum = Number(bedrag);
  if (isNaN(bedragNum) || bedragNum <= 0) {
    return NextResponse.json({ error: "Bedrag moet groter zijn dan 0." }, { status: 400 });
  }

  const budgetten = getBudgetten();
  const afdeling = budgetten.find((a) => a.id === afdelingId);
  if (!afdeling) {
    return NextResponse.json({ error: "Afdeling niet gevonden." }, { status: 404 });
  }

  if (afdeling.resterendBudget < bedragNum) {
    return NextResponse.json(
      { error: `Onvoldoende budget. Resterend: €${afdeling.resterendBudget.toLocaleString("nl-NL")}.` },
      { status: 422 }
    );
  }

  afdeling.resterendBudget -= bedragNum;
  saveBudgetten(budgetten);

  const vandaag = new Date().toISOString().split("T")[0];
  const boeking: Boeking = {
    id: randomUUID(),
    boekingsDatum: boekingsDatum ?? vandaag,
    uitgavenDatum,
    afdelingId,
    afdelingNaam: afdeling.naam,
    bedrag: bedragNum,
    omschrijving,
    geboektDoor,
  };

  const boekingen = getBoekingen();
  boekingen.unshift(boeking);
  saveBoekingen(boekingen);

  return NextResponse.json(boeking, { status: 201 });
}

import { NextRequest, NextResponse } from "next/server";
import { getInstellingen, saveInstellingen, PeriodeType } from "@/lib/data";

export async function GET() {
  return NextResponse.json(getInstellingen());
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { periodeType, huidigePeriodeStart } = body;

  const geldigePeriodes: PeriodeType[] = ["dag", "week", "maand", "kwartaal", "jaar"];
  if (!geldigePeriodes.includes(periodeType)) {
    return NextResponse.json({ error: "Ongeldig periodetype." }, { status: 400 });
  }
  if (!huidigePeriodeStart) {
    return NextResponse.json({ error: "Startdatum is verplicht." }, { status: 400 });
  }

  saveInstellingen({ periodeType, huidigePeriodeStart });
  return NextResponse.json({ ok: true });
}

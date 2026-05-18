import { NextRequest, NextResponse } from "next/server";
import { getInstellingen, saveInstellingen, PeriodeType } from "@/lib/data";

export async function GET() {
  try {
    return NextResponse.json(await getInstellingen());
  } catch (e) {
    console.error("GET /api/instellingen:", e);
    return NextResponse.json({ error: "Kon instellingen niet laden." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { periodeType, huidigePeriodeStart } = body;

    const geldigePeriodes: PeriodeType[] = ["dag", "week", "maand", "kwartaal", "jaar"];
    if (!geldigePeriodes.includes(periodeType)) {
      return NextResponse.json({ error: "Ongeldig periodetype." }, { status: 400 });
    }
    if (!huidigePeriodeStart) {
      return NextResponse.json({ error: "Startdatum is verplicht." }, { status: 400 });
    }

    await saveInstellingen({ periodeType, huidigePeriodeStart });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("POST /api/instellingen:", e);
    return NextResponse.json({ error: "Kon instellingen niet opslaan." }, { status: 500 });
  }
}

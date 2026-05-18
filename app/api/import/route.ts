import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getBudgetten, getBoekingen, saveBudgetten, saveBoekingen } from "@/lib/data";
import { Boeking, OpleidingCategorie, OpleidingPrioriteit, OpleidingNiveau } from "@/lib/types";

interface ImportRegel {
  afdelingNaam: string;
  manager: string;
  deelnemerNaam: string;
  opleiding: string;
  categorie: string;
  prioriteit: string;
  niveau: string;
  aantalPersonen: number;
  bedrag: number;
}

function normaliseer(waarde: string, opties: string[]): string {
  const v = (waarde ?? "").toLowerCase().trim();
  return opties.find((o) => o.toLowerCase() === v) ?? opties.find((o) => v.includes(o.toLowerCase())) ?? waarde;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { regels, uitgavenDatum, boekingsDatum } = body as {
      regels: ImportRegel[];
      uitgavenDatum: string;
      boekingsDatum: string;
    };

    if (!regels?.length) {
      return NextResponse.json({ error: "Geen regels aangeleverd." }, { status: 400 });
    }

    const budgetten = await getBudgetten();
    const boekingen = await getBoekingen();
    const vandaag = new Date().toISOString().split("T")[0];

    const fouten: string[] = [];
    const nieuweBoekingen: Boeking[] = [];

    for (const regel of regels) {
      const bedrag = Number(regel.bedrag);
      if (!regel.afdelingNaam || isNaN(bedrag) || bedrag <= 0) {
        fouten.push(`Overgeslagen: "${regel.opleiding || "onbekend"}" — ongeldige afdeling of bedrag.`);
        continue;
      }

      const afdeling = budgetten.find(
        (a) => a.naam.toLowerCase() === regel.afdelingNaam.toLowerCase()
      );
      if (!afdeling) {
        fouten.push(`Afdeling "${regel.afdelingNaam}" niet gevonden — "${regel.opleiding}" overgeslagen.`);
        continue;
      }
      if (afdeling.resterendBudget < bedrag) {
        fouten.push(`Onvoldoende budget voor "${afdeling.naam}" — "${regel.opleiding}" (€${bedrag}) overgeslagen.`);
        continue;
      }

      afdeling.resterendBudget -= bedrag;

      nieuweBoekingen.push({
        id: randomUUID(),
        boekingsDatum: boekingsDatum ?? vandaag,
        uitgavenDatum: uitgavenDatum ?? vandaag,
        afdelingId: afdeling.id,
        afdelingNaam: afdeling.naam,
        bedrag,
        omschrijving: [regel.deelnemerNaam, regel.opleiding].filter(Boolean).join(" – "),
        geboektDoor: regel.manager || "Import",
        deelnemerNaam: regel.deelnemerNaam,
        opleiding: regel.opleiding,
        categorie: normaliseer(regel.categorie, ["vakkennis", "gedragscompetenties", "coaching"]) as OpleidingCategorie,
        prioriteit: normaliseer(regel.prioriteit, ["noodzakelijk", "essentieel", "preventief", "algemene ontwikkeling"]) as OpleidingPrioriteit,
        niveau: normaliseer(regel.niveau, ["individu", "team"]) as OpleidingNiveau,
        aantalPersonen: Number(regel.aantalPersonen) || 1,
        bron: "import",
      });
    }

    await saveBudgetten(budgetten);
    boekingen.unshift(...nieuweBoekingen);
    await saveBoekingen(boekingen);

    return NextResponse.json({
      ingevoerd: nieuweBoekingen.length,
      overgeslagen: fouten.length,
      fouten,
    });
  } catch (e) {
    console.error("POST /api/import:", e);
    return NextResponse.json({ error: "Import mislukt." }, { status: 500 });
  }
}

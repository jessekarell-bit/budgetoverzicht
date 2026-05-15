export type PeriodeType = "dag" | "week" | "maand" | "kwartaal" | "jaar";

export interface Afdeling {
  id: string;
  naam: string;
  manager: string;
  totaalBudget: number;
  resterendBudget: number;
}

export type OpleidingCategorie = "vakkennis" | "gedragscompetenties" | "coaching";
export type OpleidingPrioriteit = "noodzakelijk" | "essentieel" | "preventief" | "algemene ontwikkeling";
export type OpleidingNiveau = "individu" | "team";

export interface Boeking {
  id: string;
  boekingsDatum: string;    // datum waarop de boeking geregistreerd is
  uitgavenDatum: string;    // datum waarop het geld daadwerkelijk gespendeerd is
  /** @deprecated gebruik boekingsDatum */
  datum?: string;           // backwards compat met oude boekingen
  afdelingId: string;
  afdelingNaam: string;
  bedrag: number;
  omschrijving: string;
  geboektDoor: string;
  // Opleidingsvelden (optioneel, gevuld bij import)
  deelnemerNaam?: string;
  opleiding?: string;
  categorie?: OpleidingCategorie;
  prioriteit?: OpleidingPrioriteit;
  niveau?: OpleidingNiveau;
  aantalPersonen?: number;
  bron?: "handmatig" | "import";
}

export interface Instellingen {
  periodeType: PeriodeType;
  huidigePeriodeStart: string;
}

export interface ArchiefPeriode {
  id: string;
  periodeType: PeriodeType;
  periodeStart: string;
  periodeEinde: string;
  boekingen: Boeking[];
  budgetSnapshot: Afdeling[];
}

export function periodeLabel(type: PeriodeType, start: string): string {
  const d = new Date(start);
  switch (type) {
    case "dag":
      return d.toLocaleDateString("nl-NL", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
    case "week": {
      const einde = new Date(d);
      einde.setDate(d.getDate() + 6);
      return `${d.toLocaleDateString("nl-NL", { day: "numeric", month: "short" })} – ${einde.toLocaleDateString("nl-NL", { day: "numeric", month: "short", year: "numeric" })}`;
    }
    case "maand":
      return d.toLocaleDateString("nl-NL", { month: "long", year: "numeric" });
    case "kwartaal": {
      const q = Math.floor(d.getMonth() / 3) + 1;
      return `Q${q} ${d.getFullYear()}`;
    }
    case "jaar":
      return `${d.getFullYear()}`;
  }
}

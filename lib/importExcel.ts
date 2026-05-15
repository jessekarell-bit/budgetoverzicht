export interface ImportRegel {
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

const VELD_RIJEN = {
  AFDELING: 0,
  MANAGER: 1,
  NAAM_OPL: 2,
  CATEGORIE: 3,
  PRIORITEIT: 4,
  NIVEAU: 5,
  PERSONEN: 6,
  KOSTEN: 7,
} as const;

const VELD_SLEUTELWOORDEN = [
  ["team", "afdeling"],
  ["manager"],
  ["naam", "deelnemer", "opleiding"],
  ["categorie", "vakkennis"],
  ["prioriteit"],
  ["niveau"],
  ["personen", "aantal"],
  ["kosten", "kost", "bedrag", "€"],
];

function normaliseerTekst(waarde: unknown): string {
  return String(waarde ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .trim();
}

function celKomtOvereen(cel: unknown, sleutelwoorden: string[]): boolean {
  const tekst = normaliseerTekst(cel);
  return sleutelwoorden.some((s) => tekst.includes(s));
}

function telVeldMatches(cellen: unknown[]): number {
  return VELD_SLEUTELWOORDEN.reduce(
    (score, sleutelwoorden, index) =>
      score + (celKomtOvereen(cellen[index], sleutelwoorden) ? 1 : 0),
    0
  );
}

/** Kolom A = veldlabels, kolom B+ = één opleiding per kolom */
function isKolomFormaat(matrix: string[][]): boolean {
  if (matrix.length < 8) return false;
  const eersteKolom = matrix.slice(0, 8).map((rij) => rij[0]);
  return telVeldMatches(eersteKolom) >= 4;
}

/** Rij 1 = veldlabels, rij 2+ = één opleiding per rij */
function isRijFormaat(matrix: string[][]): boolean {
  if (matrix.length < 2 || (matrix[0]?.length ?? 0) < 8) return false;
  return telVeldMatches(matrix[0]) >= 4;
}

function transpose(matrix: string[][]): string[][] {
  const rijen = matrix.length;
  const kolommen = Math.max(0, ...matrix.map((rij) => rij.length));
  return Array.from({ length: kolommen }, (_, kolom) =>
    Array.from({ length: rijen }, (_, rij) => String(matrix[rij]?.[kolom] ?? ""))
  );
}

function parseKosten(waarde: unknown): number {
  const kosten = parseFloat(
    String(waarde ?? "0")
      .replace(/[^\d.,]/g, "")
      .replace(",", ".")
  );
  return isNaN(kosten) ? 0 : kosten;
}

function parseNaamEnOpleiding(naamOpl: string): { deelnemerNaam: string; opleiding: string } {
  const [naam, ...oplArr] = naamOpl.split(/[\n\r|–\-]+/);
  const deelnemerNaam = naam.trim();
  const opleiding = oplArr.join(" ").trim() || naamOpl;
  return { deelnemerNaam, opleiding };
}

function regelUitKolom(matrix: string[][], kolom: number): ImportRegel | null {
  const afdeling = String(matrix[VELD_RIJEN.AFDELING]?.[kolom] ?? "").trim();
  const kosten = parseKosten(matrix[VELD_RIJEN.KOSTEN]?.[kolom]);

  if (!afdeling && kosten <= 0) return null;

  const naamOpl = String(matrix[VELD_RIJEN.NAAM_OPL]?.[kolom] ?? "").trim();
  const { deelnemerNaam, opleiding } = parseNaamEnOpleiding(naamOpl);

  return {
    afdelingNaam: afdeling,
    manager: String(matrix[VELD_RIJEN.MANAGER]?.[kolom] ?? "").trim(),
    deelnemerNaam,
    opleiding,
    categorie: String(matrix[VELD_RIJEN.CATEGORIE]?.[kolom] ?? "").trim(),
    prioriteit: String(matrix[VELD_RIJEN.PRIORITEIT]?.[kolom] ?? "").trim(),
    niveau: String(matrix[VELD_RIJEN.NIVEAU]?.[kolom] ?? "").trim(),
    aantalPersonen: parseInt(String(matrix[VELD_RIJEN.PERSONEN]?.[kolom] ?? "1")) || 1,
    bedrag: kosten,
  };
}

/** Leest opleidingen uit kolomformaat (veldlabels in kolom A). */
export function parseKolomMatrix(matrix: string[][]): ImportRegel[] {
  if (matrix.length < 8) return [];

  const aantalKolommen = Math.max(0, ...matrix.map((rij) => rij.length));
  const regels: ImportRegel[] = [];

  for (let kolom = 1; kolom < aantalKolommen; kolom++) {
    const regel = regelUitKolom(matrix, kolom);
    if (regel) regels.push(regel);
  }

  return regels;
}

/**
 * Zet een rij-gebaseerd Excel-bestand om naar kolomformaat en leest de opleidingen.
 * Elk gegevensrij wordt één kolom (veldlabels staan in de eerste rij).
 */
export function parseOpleidingsMatrix(matrix: string[][]): {
  regels: ImportRegel[];
  formaat: "kolommen" | "rijen";
} {
  const opgeschoond = matrix.map((rij) => rij.map((cel) => String(cel ?? "")));

  if (isKolomFormaat(opgeschoond)) {
    return { regels: parseKolomMatrix(opgeschoond), formaat: "kolommen" };
  }

  if (isRijFormaat(opgeschoond)) {
    const getransponeerd = transpose(opgeschoond);
    return { regels: parseKolomMatrix(getransponeerd), formaat: "rijen" };
  }

  // Fallback: probeer kolomformaat (sjabloon zonder herkende labels in A)
  const regels = parseKolomMatrix(opgeschoond);
  if (regels.length > 0) {
    return { regels, formaat: "kolommen" };
  }

  // Laatste poging: rijen → kolommen
  const getransponeerd = transpose(opgeschoond);
  return { regels: parseKolomMatrix(getransponeerd), formaat: "rijen" };
}

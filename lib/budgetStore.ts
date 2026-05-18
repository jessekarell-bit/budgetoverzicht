"use client";

import { Afdeling, AfdelingNummer, Boeking, Instellingen, ArchiefPeriode, OpleidingCategorie, OpleidingPrioriteit, OpleidingNiveau } from "@/lib/types";
import { AFDELING_KLEUR_PALET } from "@/lib/afdelingKleur";
import { DEFAULT_BUDGETTEN, defaultInstellingen } from "@/lib/defaults";
import { maakAfdelingId } from "@/lib/afdelingId";
import { ImportRegel } from "@/lib/importExcel";

const KEYS = {
  budgetten: "bb_budgetten",
  boekingen: "bb_boekingen",
  instellingen: "bb_instellingen",
  archief: "bb_archief",
  profiel: "bb_profiel_id",
} as const;

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function lees<T>(key: string, fallback: T): T {
  if (!isBrowser()) return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function schrijf<T>(key: string, data: T): void {
  if (!isBrowser()) return;
  localStorage.setItem(key, JSON.stringify(data));
}

function uuid(): string {
  return crypto.randomUUID();
}

/** Uniek profiel-id per browser (blijft bewaard in localStorage). */
export function getProfielId(): string {
  if (!isBrowser()) return "server";
  let id = localStorage.getItem(KEYS.profiel);
  if (!id) {
    id = uuid();
    localStorage.setItem(KEYS.profiel, id);
  }
  return id;
}

function initAlsLeeg(): void {
  if (!isBrowser()) return;
  if (!localStorage.getItem(KEYS.budgetten)) {
    schrijf(KEYS.budgetten, DEFAULT_BUDGETTEN);
  }
  if (!localStorage.getItem(KEYS.boekingen)) {
    schrijf(KEYS.boekingen, []);
  }
  if (!localStorage.getItem(KEYS.instellingen)) {
    schrijf(KEYS.instellingen, defaultInstellingen());
  }
  if (!localStorage.getItem(KEYS.archief)) {
    schrijf(KEYS.archief, []);
  }
  getProfielId();
}

export function getBudgetten(): Afdeling[] {
  initAlsLeeg();
  return lees<Afdeling[]>(KEYS.budgetten, DEFAULT_BUDGETTEN);
}

export function saveBudgetten(data: Afdeling[]): void {
  schrijf(KEYS.budgetten, data);
}

export function getBoekingen(): Boeking[] {
  initAlsLeeg();
  return lees<Boeking[]>(KEYS.boekingen, []);
}

export function saveBoekingen(data: Boeking[]): void {
  schrijf(KEYS.boekingen, data);
}

export function getInstellingen(): Instellingen {
  initAlsLeeg();
  return lees<Instellingen>(KEYS.instellingen, defaultInstellingen());
}

export function saveInstellingen(data: Instellingen): void {
  schrijf(KEYS.instellingen, data);
}

export function getArchief(): ArchiefPeriode[] {
  initAlsLeeg();
  return lees<ArchiefPeriode[]>(KEYS.archief, []);
}

export function saveArchief(data: ArchiefPeriode[]): void {
  schrijf(KEYS.archief, data);
}

export function maakAfdeling(input: {
  naam: string;
  manager: string;
  totaalBudget: number;
  kleur?: string;
  nummer?: AfdelingNummer;
}): Afdeling {
  const budgetten = getBudgetten();
  const kleur =
    input.kleur && /^#[0-9A-Fa-f]{6}$/.test(input.kleur)
      ? input.kleur
      : AFDELING_KLEUR_PALET[budgetten.length % AFDELING_KLEUR_PALET.length];
  const nieuw: Afdeling = {
    id: maakAfdelingId(input.naam, budgetten),
    naam: input.naam.trim(),
    manager: input.manager.trim(),
    totaalBudget: input.totaalBudget,
    resterendBudget: input.totaalBudget,
    kleur,
    ...(input.nummer !== undefined ? { nummer: input.nummer } : {}),
  };
  budgetten.push(nieuw);
  saveBudgetten(budgetten);
  return nieuw;
}

export function updateAfdeling(
  id: string,
  input: {
    naam: string;
    manager: string;
    totaalBudget: number;
    kleur?: string;
    nummer?: AfdelingNummer | null;
  }
): Afdeling {
  const budgetten = getBudgetten();
  const idx = budgetten.findIndex((a) => a.id === id);
  if (idx === -1) throw new Error("Afdeling niet gevonden.");

  const oud = budgetten[idx];
  const verschil = input.totaalBudget - oud.totaalBudget;
  const kleur =
    input.kleur && /^#[0-9A-Fa-f]{6}$/.test(input.kleur) ? input.kleur : oud.kleur;
  const bijgewerkt: Afdeling = {
    ...oud,
    naam: input.naam.trim(),
    manager: input.manager.trim(),
    totaalBudget: input.totaalBudget,
    resterendBudget: Math.max(0, oud.resterendBudget + verschil),
    ...(kleur ? { kleur } : {}),
    ...(input.nummer === null
      ? { nummer: undefined }
      : input.nummer !== undefined
        ? { nummer: input.nummer }
        : {}),
  };
  budgetten[idx] = bijgewerkt;
  saveBudgetten(budgetten);

  if (bijgewerkt.naam !== oud.naam) {
    const boekingen = getBoekingen();
    let gewijzigd = false;
    for (const b of boekingen) {
      if (b.afdelingId === id) {
        b.afdelingNaam = bijgewerkt.naam;
        gewijzigd = true;
      }
    }
    if (gewijzigd) saveBoekingen(boekingen);
  }

  return bijgewerkt;
}

export function verwijderAfdeling(id: string): void {
  saveBudgetten(getBudgetten().filter((a) => a.id !== id));
}

export function maakBoeking(input: {
  afdelingId: string;
  bedrag: number;
  omschrijving: string;
  geboektDoor: string;
  boekingsDatum?: string;
  uitgavenDatum: string;
}): Boeking {
  const budgetten = getBudgetten();
  const afdeling = budgetten.find((a) => a.id === input.afdelingId);
  if (!afdeling) throw new Error("Afdeling niet gevonden.");
  if (afdeling.resterendBudget < input.bedrag) {
    throw new Error(
      `Onvoldoende budget. Resterend: €${afdeling.resterendBudget.toLocaleString("nl-NL")}.`
    );
  }

  afdeling.resterendBudget -= input.bedrag;
  saveBudgetten(budgetten);

  const vandaag = new Date().toISOString().split("T")[0];
  const boeking: Boeking = {
    id: uuid(),
    boekingsDatum: input.boekingsDatum ?? vandaag,
    uitgavenDatum: input.uitgavenDatum,
    afdelingId: input.afdelingId,
    afdelingNaam: afdeling.naam,
    bedrag: input.bedrag,
    omschrijving: input.omschrijving,
    geboektDoor: input.geboektDoor,
  };

  const boekingen = getBoekingen();
  boekingen.unshift(boeking);
  saveBoekingen(boekingen);
  return boeking;
}

function normaliseer(waarde: string, opties: string[]): string {
  const v = (waarde ?? "").toLowerCase().trim();
  return opties.find((o) => o.toLowerCase() === v) ?? opties.find((o) => v.includes(o.toLowerCase())) ?? waarde;
}

export function importeerRegels(
  regels: ImportRegel[],
  uitgavenDatum: string,
  boekingsDatum: string
): { ingevoerd: number; overgeslagen: number; fouten: string[] } {
  const budgetten = getBudgetten();
  const boekingen = getBoekingen();
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
      id: uuid(),
      boekingsDatum: boekingsDatum || vandaag,
      uitgavenDatum: uitgavenDatum || vandaag,
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

  saveBudgetten(budgetten);
  boekingen.unshift(...nieuweBoekingen);
  saveBoekingen(boekingen);

  return { ingevoerd: nieuweBoekingen.length, overgeslagen: fouten.length, fouten };
}

export function startNieuwePeriode(nieuwePeriodeStart: string): void {
  const instellingen = getInstellingen();
  const budgetten = getBudgetten();
  const boekingen = getBoekingen();
  const archief = getArchief();

  archief.unshift({
    id: uuid(),
    periodeType: instellingen.periodeType,
    periodeStart: instellingen.huidigePeriodeStart,
    periodeEinde: new Date(Date.now() - 86400000).toISOString().split("T")[0],
    boekingen,
    budgetSnapshot: budgetten.map((a) => ({ ...a })),
  });
  saveArchief(archief);

  saveBudgetten(budgetten.map((a) => ({ ...a, resterendBudget: a.totaalBudget })));
  saveBoekingen([]);
  saveInstellingen({ ...instellingen, huidigePeriodeStart: nieuwePeriodeStart });
}

/** Wis alle lokale gegevens en begin opnieuw met standaarddata. */
export function resetAlleData(): void {
  if (!isBrowser()) return;
  Object.values(KEYS).forEach((k) => localStorage.removeItem(k));
  initAlsLeeg();
}

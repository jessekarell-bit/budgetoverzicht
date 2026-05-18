import "server-only";
import { Afdeling, Boeking, Instellingen, ArchiefPeriode } from "@/lib/types";
import { readJsonFile, writeJsonFile } from "@/lib/storage";

export type { Afdeling, Boeking, Instellingen, ArchiefPeriode };
export type { PeriodeType } from "@/lib/types";

const FILES = {
  budgetten: "budgetten.json",
  boekingen: "boekingen.json",
  instellingen: "instellingen.json",
  archief: "archief.json",
} as const;

export async function getBudgetten(): Promise<Afdeling[]> {
  return readJsonFile<Afdeling[]>(FILES.budgetten);
}

export async function getBoekingen(): Promise<Boeking[]> {
  return readJsonFile<Boeking[]>(FILES.boekingen);
}

export async function getInstellingen(): Promise<Instellingen> {
  return readJsonFile<Instellingen>(FILES.instellingen);
}

export async function getArchief(): Promise<ArchiefPeriode[]> {
  return readJsonFile<ArchiefPeriode[]>(FILES.archief);
}

export async function saveBudgetten(data: Afdeling[]): Promise<void> {
  await writeJsonFile(FILES.budgetten, data);
}

export async function saveBoekingen(data: Boeking[]): Promise<void> {
  await writeJsonFile(FILES.boekingen, data);
}

export async function saveInstellingen(data: Instellingen): Promise<void> {
  await writeJsonFile(FILES.instellingen, data);
}

export async function saveArchief(data: ArchiefPeriode[]): Promise<void> {
  await writeJsonFile(FILES.archief, data);
}

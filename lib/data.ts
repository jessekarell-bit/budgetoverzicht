import "server-only";
import fs from "fs";
import path from "path";
import { Afdeling, Boeking, Instellingen, ArchiefPeriode } from "@/lib/types";

export type { Afdeling, Boeking, Instellingen, ArchiefPeriode };
export type { PeriodeType } from "@/lib/types";

const dataDir = path.join(process.cwd(), "data");

export function getBudgetten(): Afdeling[] {
  const raw = fs.readFileSync(path.join(dataDir, "budgetten.json"), "utf-8");
  return JSON.parse(raw);
}

export function getBoekingen(): Boeking[] {
  const raw = fs.readFileSync(path.join(dataDir, "boekingen.json"), "utf-8");
  return JSON.parse(raw);
}

export function getInstellingen(): Instellingen {
  const raw = fs.readFileSync(path.join(dataDir, "instellingen.json"), "utf-8");
  return JSON.parse(raw);
}

export function getArchief(): ArchiefPeriode[] {
  const raw = fs.readFileSync(path.join(dataDir, "archief.json"), "utf-8");
  return JSON.parse(raw);
}

export function saveBudgetten(data: Afdeling[]) {
  fs.writeFileSync(path.join(dataDir, "budgetten.json"), JSON.stringify(data, null, 2));
}

export function saveBoekingen(data: Boeking[]) {
  fs.writeFileSync(path.join(dataDir, "boekingen.json"), JSON.stringify(data, null, 2));
}

export function saveInstellingen(data: Instellingen) {
  fs.writeFileSync(path.join(dataDir, "instellingen.json"), JSON.stringify(data, null, 2));
}

export function saveArchief(data: ArchiefPeriode[]) {
  fs.writeFileSync(path.join(dataDir, "archief.json"), JSON.stringify(data, null, 2));
}

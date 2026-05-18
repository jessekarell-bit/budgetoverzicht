import { Afdeling } from "@/lib/types";

/** Unieke id op basis van naam (bijv. "Financiën" → "financien"). */
export function maakAfdelingId(naam: string, bestaande: Afdeling[]): string {
  let basis = naam
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  if (!basis) basis = "afdeling";

  let id = basis;
  let n = 2;
  while (bestaande.some((a) => a.id === id)) {
    id = `${basis}-${n++}`;
  }
  return id;
}

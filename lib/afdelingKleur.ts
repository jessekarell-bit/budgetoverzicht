/** Vaste kleurenpalet voor afdelingen (hex). */
export const AFDELING_KLEUR_PALET = [
  "#3B82F6",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#EC4899",
  "#06B6D4",
  "#84CC16",
  "#F97316",
  "#6366F1",
] as const;

export function kleurVoorAfdeling(kleur: string | undefined, index: number): string {
  if (kleur && /^#[0-9A-Fa-f]{6}$/.test(kleur)) return kleur;
  return AFDELING_KLEUR_PALET[index % AFDELING_KLEUR_PALET.length];
}

/** Zet #RRGGBB om naar RRGGBB voor Excel (xlsx-js-style). */
export function hexNaarExcelRgb(hex: string): string {
  return hex.replace("#", "").toUpperCase();
}

/** Donkere tekst op lichte achtergrond, anders wit. */
export function tekstKleurOpAchtergrond(hex: string): string {
  const rgb = hexNaarExcelRgb(hex);
  const r = parseInt(rgb.slice(0, 2), 16);
  const g = parseInt(rgb.slice(2, 4), 16);
  const b = parseInt(rgb.slice(4, 6), 16);
  const luminantie = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminantie > 0.55 ? "1F2937" : "FFFFFF";
}

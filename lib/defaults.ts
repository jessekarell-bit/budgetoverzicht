import { Afdeling, Instellingen } from "@/lib/types";

export const DEFAULT_BUDGETTEN: Afdeling[] = [
  { id: "ict", naam: "ICT", manager: "Jan de Vries", totaalBudget: 50000, resterendBudget: 50000, kleur: "#3B82F6", nummer: 1 },
  { id: "hr", naam: "HR", manager: "Lisa Smit", totaalBudget: 30000, resterendBudget: 30000, kleur: "#10B981", nummer: 2 },
  { id: "marketing", naam: "Marketing", manager: "Tom Bakker", totaalBudget: 40000, resterendBudget: 40000, kleur: "#F59E0B", nummer: 3 },
  { id: "financien", naam: "Financiën", manager: "Sara Jansen", totaalBudget: 25000, resterendBudget: 25000, kleur: "#8B5CF6", nummer: 4 },
  { id: "operations", naam: "Operations", manager: "Piet Willems", totaalBudget: 60000, resterendBudget: 60000, kleur: "#EF4444" },
];

export function defaultInstellingen(): Instellingen {
  return {
    periodeType: "maand",
    huidigePeriodeStart: new Date().toISOString().split("T")[0],
  };
}

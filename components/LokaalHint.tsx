"use client";

import { useEffect, useState } from "react";
import { getProfielId } from "@/lib/budgetStore";

export default function LokaalHint() {
  const [profielId, setProfielId] = useState("");

  useEffect(() => {
    setProfielId(getProfielId().slice(0, 8));
  }, []);

  if (!profielId) return null;

  return (
    <div className="bg-slate-800 text-slate-200 text-xs px-4 py-2 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-center">
      <span>
        Gegevens worden <strong className="text-white">lokaal in deze browser</strong> opgeslagen — elke
        collega/computer heeft een eigen budgetoverzicht.
      </span>
      <span className="text-slate-400">Profiel: {profielId}…</span>
    </div>
  );
}

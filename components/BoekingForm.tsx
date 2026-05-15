"use client";

import { useState } from "react";
import { Afdeling } from "@/lib/types";

interface Props {
  afdelingen: Afdeling[];
  defaultAfdelingId?: string;
  onSuccess: () => void;
}

export default function BoekingForm({ afdelingen, defaultAfdelingId, onSuccess }: Props) {
  const vandaag = new Date().toISOString().split("T")[0];

  const [afdelingId, setAfdelingId] = useState(defaultAfdelingId ?? "");
  const [bedrag, setBedrag] = useState("");
  const [omschrijving, setOmschrijving] = useState("");
  const [geboektDoor, setGeboektDoor] = useState("");
  const [boekingsDatum, setBoekingsDatum] = useState(vandaag);
  const [uitgavenDatum, setUitgavenDatum] = useState(vandaag);
  const [fout, setFout] = useState("");
  const [bezig, setBezig] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFout("");
    setBezig(true);

    const res = await fetch("/api/boeken", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        afdelingId,
        bedrag: Number(bedrag),
        omschrijving,
        geboektDoor,
        boekingsDatum,
        uitgavenDatum,
      }),
    });

    const data = await res.json();
    setBezig(false);

    if (!res.ok) {
      setFout(data.error ?? "Er ging iets mis.");
      return;
    }

    setBedrag("");
    setOmschrijving("");
    setGeboektDoor("");
    setBoekingsDatum(vandaag);
    setUitgavenDatum(vandaag);
    onSuccess();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Afdeling</label>
        <select
          value={afdelingId}
          onChange={(e) => setAfdelingId(e.target.value)}
          required
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">— Kies een afdeling —</option>
          {afdelingen.map((a) => (
            <option key={a.id} value={a.id}>
              {a.naam} (resterend: €{a.resterendBudget.toLocaleString("nl-NL")})
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Bedrag (€)</label>
        <input
          type="number"
          min="1"
          step="0.01"
          value={bedrag}
          onChange={(e) => setBedrag(e.target.value)}
          required
          placeholder="0,00"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Omschrijving</label>
        <input
          type="text"
          value={omschrijving}
          onChange={(e) => setOmschrijving(e.target.value)}
          required
          placeholder="Waarvoor is dit bedrag?"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Geboekt door</label>
        <input
          type="text"
          value={geboektDoor}
          onChange={(e) => setGeboektDoor(e.target.value)}
          required
          placeholder="Jouw naam"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Twee datumvelden naast elkaar */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Uitgavendatum
            <span className="ml-1 text-xs text-gray-400 font-normal">wanneer gespendeerd</span>
          </label>
          <input
            type="date"
            value={uitgavenDatum}
            onChange={(e) => setUitgavenDatum(e.target.value)}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Boekingsdatum
            <span className="ml-1 text-xs text-gray-400 font-normal">wanneer geregistreerd</span>
          </label>
          <input
            type="date"
            value={boekingsDatum}
            onChange={(e) => setBoekingsDatum(e.target.value)}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {fout && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{fout}</p>
      )}

      <button
        type="submit"
        disabled={bezig}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-2 px-4 rounded-lg transition-colors"
      >
        {bezig ? "Boeken…" : "Bedrag afschrijven"}
      </button>
    </form>
  );
}

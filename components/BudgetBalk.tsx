interface Props {
  totaal: number;
  resterend: number;
}

export default function BudgetBalk({ totaal, resterend }: Props) {
  const pct = totaal > 0 ? Math.max(0, (resterend / totaal) * 100) : 0;
  const kleur = pct > 50 ? "bg-green-500" : pct > 20 ? "bg-yellow-400" : "bg-red-500";

  return (
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div className={`${kleur} h-2 rounded-full transition-all`} style={{ width: `${pct}%` }} />
    </div>
  );
}

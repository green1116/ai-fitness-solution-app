type StatWidgetProps = {
  label: string;
  value: string | number;
  sub?: string;
};

export function StatWidget({ label, value, sub }: StatWidgetProps) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-black/40 p-5">
      <p className="text-xs uppercase tracking-widest text-zinc-500">{label}</p>
      <p className="mt-2 text-3xl font-bold text-white">{value}</p>
      {sub ? <p className="mt-1 text-xs text-zinc-500">{sub}</p> : null}
    </div>
  );
}

type ScoreWidgetProps = {
  label: string;
  score: number;
};

export function ScoreWidget({ label, score }: ScoreWidgetProps) {
  return (
    <div className="rounded-2xl border border-violet-900/40 bg-violet-950/20 p-5">
      <p className="text-xs uppercase tracking-widest text-violet-400">{label}</p>
      <p className="mt-2 text-3xl font-bold text-violet-200">{score}</p>
    </div>
  );
}

export function ExecutiveWidgets({
  stats,
  commercial,
}: {
  stats: {
    projects: number;
    quotes: number;
    tenderPacks: number;
    downloads: number;
    deliveries: number;
  };
  commercial: {
    commercialReadiness: number;
    deliveryReadiness: number;
    tenderReadiness: number;
    executionReadiness: number;
    overallBusinessScore: number;
  };
}) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatWidget label="Projects" value={stats.projects} />
        <StatWidget label="Quotes" value={stats.quotes} />
        <StatWidget label="Tender Packs" value={stats.tenderPacks} />
        <StatWidget label="Downloads" value={stats.downloads} />
        <StatWidget label="Deliveries" value={stats.deliveries} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <ScoreWidget label="Commercial" score={commercial.commercialReadiness} />
        <ScoreWidget label="Tender" score={commercial.tenderReadiness} />
        <ScoreWidget label="Delivery" score={commercial.deliveryReadiness} />
        <ScoreWidget label="Execution" score={commercial.executionReadiness} />
        <ScoreWidget label="Overall" score={commercial.overallBusinessScore} />
      </div>
    </div>
  );
}

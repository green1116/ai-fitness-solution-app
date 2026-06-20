import type { QuoteEntryPlaceholderCard } from "../shared/portal-types";

interface QuoteEntryCardProps {
  card: QuoteEntryPlaceholderCard;
}

export function QuoteEntryCard({ card }: QuoteEntryCardProps) {
  return (
    <article className="rounded-lg border border-dashed border-zinc-700 bg-zinc-950/50 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-medium text-white">{card.title}</h3>
          <p className="mt-1 text-xs text-zinc-400">{card.description}</p>
        </div>
        <span className="shrink-0 rounded-full bg-zinc-900 px-2 py-1 text-[10px] uppercase tracking-wide text-amber-300">
          {card.status}
        </span>
      </div>
    </article>
  );
}

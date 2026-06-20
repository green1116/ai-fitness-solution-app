"use client";

import { QuoteEntryCard } from "../components/quote-entry-card";
import { QuoteEntryEmptyState } from "../components/quote-entry-empty-state";
import { QuoteEntryHeader } from "../components/quote-entry-header";
import { WorkspacePanel } from "../components/workspace-panel";
import { listQuoteEntryPlaceholderCards } from "../quote-entry/quote-entry-placeholder-cards";
import { getQuoteEntryStatusView } from "../quote-entry/quote-entry-status";

export function QuoteEntryPageContent() {
  const statusView = getQuoteEntryStatusView();
  const placeholderCards = listQuoteEntryPlaceholderCards();

  return (
    <div className="space-y-6">
      <QuoteEntryHeader />

      <WorkspacePanel title="Quote Entry Status" description="Read-only entry mount status">
        <dl className="grid gap-3 text-sm md:grid-cols-2">
          <div>
            <dt className="text-xs text-zinc-500">Phase</dt>
            <dd className="mt-1 font-medium text-white">{statusView.phase}</dd>
          </div>
          <div>
            <dt className="text-xs text-zinc-500">Layer</dt>
            <dd className="mt-1 font-medium text-white">{statusView.layer}</dd>
          </div>
          <div>
            <dt className="text-xs text-zinc-500">Capability</dt>
            <dd className="mt-1 font-medium text-amber-200">{statusView.capability}</dd>
          </div>
          <div>
            <dt className="text-xs text-zinc-500">Commercial Logic</dt>
            <dd className="mt-1 font-medium text-white">{statusView.commercialLogic ? "enabled" : "disabled"}</dd>
          </div>
        </dl>
      </WorkspacePanel>

      <WorkspacePanel title="Placeholder Cards" description="Reserved quote surfaces · entry-only">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {placeholderCards.map((card) => (
            <QuoteEntryCard key={card.key} card={card} />
          ))}
        </div>
      </WorkspacePanel>

      <QuoteEntryEmptyState />
    </div>
  );
}

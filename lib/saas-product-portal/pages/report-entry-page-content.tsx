"use client";

import { ReportEntryCard } from "../components/report-entry-card";
import { ReportEntryEmptyState } from "../components/report-entry-empty-state";
import { ReportEntryHeader } from "../components/report-entry-header";
import { WorkspacePanel } from "../components/workspace-panel";
import { listReportEntryPlaceholderCards } from "../report-entry/report-entry-placeholder-cards";
import { getReportEntryStatusView } from "../report-entry/report-entry-status";

export function ReportEntryPageContent() {
  const statusView = getReportEntryStatusView();
  const placeholderCards = listReportEntryPlaceholderCards();

  return (
    <div className="space-y-6">
      <ReportEntryHeader />

      <WorkspacePanel title="Report Entry Status" description="Read-only entry mount status">
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
            <dt className="text-xs text-zinc-500">Report Runtime</dt>
            <dd className="mt-1 font-medium text-white">{statusView.reportRuntime ? "enabled" : "disabled"}</dd>
          </div>
        </dl>
      </WorkspacePanel>

      <WorkspacePanel title="Placeholder Cards" description="Reserved report surfaces · entry-only">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {placeholderCards.map((card) => (
            <ReportEntryCard key={card.key} card={card} />
          ))}
        </div>
      </WorkspacePanel>

      <ReportEntryEmptyState />
    </div>
  );
}

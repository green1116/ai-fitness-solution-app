import { getQuoteEntryStatusView } from "../quote-entry/quote-entry-status";
import { WorkspacePanel } from "./workspace-panel";

export function QuoteEntryEmptyState() {
  const statusView = getQuoteEntryStatusView();

  return (
    <WorkspacePanel title="Coming Soon" description="Quote Entry UI shell · no commercial runtime wired">
      <div className="space-y-3 text-sm text-zinc-300">
        <p>
          Quote business surfaces are reserved for a future layer. This page only mounts the workspace quote entry
          shell.
        </p>
        <ul className="list-disc space-y-1 pl-5 text-xs text-zinc-400">
          <li>No quote pricing or calculation</li>
          <li>No workflow runtime</li>
          <li>No persistence access from portal UI</li>
        </ul>
        <p className="rounded-lg border border-dashed border-zinc-700 bg-zinc-950/40 p-3 text-xs text-zinc-500">
          Entry status: {statusView.label} · layer={statusView.layer} · capability={statusView.capability}
        </p>
      </div>
    </WorkspacePanel>
  );
}

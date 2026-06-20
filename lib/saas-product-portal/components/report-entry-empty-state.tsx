import { getReportEntryStatusView } from "../report-entry/report-entry-status";
import { WorkspacePanel } from "./workspace-panel";

export function ReportEntryEmptyState() {
  const statusView = getReportEntryStatusView();

  return (
    <WorkspacePanel title="Coming Soon" description="Report Entry UI shell · no report runtime wired">
      <div className="space-y-3 text-sm text-zinc-300">
        <p>
          Reporting surfaces are reserved for a future layer. This page only mounts the workspace report entry shell.
        </p>
        <ul className="list-disc space-y-1 pl-5 text-xs text-zinc-400">
          <li>No report runtime or analytics orchestration</li>
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

import { getProjectEntryStatusView } from "../project-entry/project-entry-status";
import { WorkspacePanel } from "./workspace-panel";

export function ProjectEntryEmptyState() {
  const statusView = getProjectEntryStatusView();

  return (
    <WorkspacePanel title="Coming Soon" description="Project Entry UI shell · no project runtime wired">
      <div className="space-y-3 text-sm text-zinc-300">
        <p>
          Project delivery surfaces are reserved for a future layer. This page only mounts the workspace project entry
          shell.
        </p>
        <ul className="list-disc space-y-1 pl-5 text-xs text-zinc-400">
          <li>No project runtime or delivery orchestration</li>
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

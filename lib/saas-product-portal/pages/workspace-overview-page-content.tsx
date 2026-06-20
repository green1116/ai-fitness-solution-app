"use client";

import { WorkspaceDashboardOverview } from "../components/workspace-dashboard-overview";
import { WorkspaceEntryGrid } from "../components/workspace-entry-grid";
import { useWorkspaceContext } from "../hooks/use-workspace-context";

export function WorkspaceOverviewPageContent() {
  const { workspaceId } = useWorkspaceContext();

  return (
    <div className="space-y-6">
      <WorkspaceDashboardOverview />
      <WorkspaceEntryGrid workspaceId={workspaceId} />
    </div>
  );
}

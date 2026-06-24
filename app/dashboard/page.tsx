import { WorkspaceDashboardPage } from "@/components/workspace/WorkspaceDashboardPage";
import { WorkspaceShell } from "@/components/workspace/WorkspaceShell";

export default function DashboardPage() {
  return (
    <WorkspaceShell>
      <WorkspaceDashboardPage />
    </WorkspaceShell>
  );
}

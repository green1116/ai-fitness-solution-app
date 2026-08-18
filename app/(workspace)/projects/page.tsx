import { WorkspaceCrmWorkSurfacePanel } from "../WorkspaceCrmWorkSurfacePanel";
import { ProjectsPageClient } from "./ProjectsPageClient";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  return (
    <>
      <WorkspaceCrmWorkSurfacePanel />
      <ProjectsPageClient />
    </>
  );
}

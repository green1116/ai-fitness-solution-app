import { Suspense } from "react";
import { getCurrentUser } from "@/lib/auth/currentUser";
import { isPlatformAdminEmail } from "@/lib/dashboard/platform-admin";
import { resolveExactSingleOrganizationIdForUser } from "@/lib/organization/single-org-context";
import { listProjects } from "@/lib/services/project.service";
import { WorkspaceCrmWorkSurfacePanel } from "../WorkspaceCrmWorkSurfacePanel";
import { ProjectsPageClient } from "./ProjectsPageClient";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const user = await getCurrentUser();
  const isPlatformAdmin = isPlatformAdminEmail(user?.email);

  // Same exact-single-org tenant rule as workspace layout / API org gate.
  const organizationId = user
    ? await resolveExactSingleOrganizationIdForUser(user.id)
    : null;
  const initialProjects = organizationId
    ? (await listProjects({ organizationId })).map((p) => ({
        id: p.id,
        name: p.name,
        clientName: p.clientName,
        city: p.city,
        quoteCount: p.quoteCount,
        tenderCount: p.tenderCount,
      }))
    : [];

  return (
    <>
      {isPlatformAdmin ? (
        <Suspense fallback={null}>
          <WorkspaceCrmWorkSurfacePanel />
        </Suspense>
      ) : null}
      <ProjectsPageClient initialProjects={initialProjects} />
    </>
  );
}

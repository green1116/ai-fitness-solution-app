import { Suspense } from "react";
import { getCurrentUser } from "@/lib/auth/currentUser";
import { isPlatformAdminEmail } from "@/lib/dashboard/platform-admin";
import { WorkspaceCrmWorkSurfacePanel } from "../WorkspaceCrmWorkSurfacePanel";
import { ProjectsPageClient } from "./ProjectsPageClient";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const user = await getCurrentUser();
  const isPlatformAdmin = isPlatformAdminEmail(user?.email);

  return (
    <>
      {isPlatformAdmin ? (
        <Suspense fallback={null}>
          <WorkspaceCrmWorkSurfacePanel />
        </Suspense>
      ) : null}
      <ProjectsPageClient />
    </>
  );
}

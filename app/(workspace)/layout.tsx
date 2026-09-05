import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/currentUser";
import { isPlatformAdminEmail } from "@/lib/dashboard/platform-admin";
import { listOrganizationsForUser } from "@/lib/organization/organization.service";
import { redirect } from "next/navigation";
import {
  PEX_INTELLIGENCE_ENDPOINT,
  readProductIntelligenceExperience,
} from "@/lib/product/experience";
import { WorkspaceActionSurfacePanel } from "./WorkspaceActionSurfacePanel";
import { WorkspaceOrganizationProvider } from "./WorkspaceOrganizationProvider";

export const dynamic = "force-dynamic";

export default async function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  let organizationId: string | null = null;
  try {
    const orgs = await listOrganizationsForUser(user.id);
    organizationId = orgs[0]?.organization.id ?? null;
  } catch {
    organizationId = null;
  }

  const isPlatformAdmin = isPlatformAdminEmail(user.email);
  const pex = isPlatformAdmin ? await readProductIntelligenceExperience() : null;

  return (
    <WorkspaceOrganizationProvider organizationId={organizationId ?? ""}>
      <div className="min-h-screen bg-zinc-950 text-white">
        <header className="border-b border-zinc-800 px-6 py-4">
          <nav className="mx-auto flex max-w-5xl items-center gap-6 text-sm">
            <Link href="/projects" className="font-semibold">
              项目 Workspace
            </Link>
          </nav>
          {pex ? (
            <section className="mx-auto mt-4 max-w-5xl rounded-lg border border-zinc-800 bg-zinc-950 p-4">
              <p className="text-xs text-zinc-600">只读 · GET {PEX_INTELLIGENCE_ENDPOINT}</p>
              <div className="mt-3 grid gap-4 sm:grid-cols-3">
                <div>
                  <p className="text-xs text-zinc-500">Status</p>
                  <p className="mt-1 text-lg font-semibold">{pex.status}</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500">Signals</p>
                  <p className="mt-1 text-sm text-zinc-300">
                    open {pex.signals.openCount} · queued {pex.signals.queuedCount} · watch{" "}
                    {pex.signals.watchCount} · held {pex.signals.heldCount} · escalate{" "}
                    {pex.signals.escalateCount}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500">Attention</p>
                  <p className="mt-1 text-sm text-zinc-300">
                    open {pex.attention.openCount} · escalate {pex.attention.escalateCount}
                  </p>
                </div>
              </div>
            </section>
          ) : null}
          <WorkspaceActionSurfacePanel organizationId={organizationId} />
        </header>
        <main className="mx-auto max-w-5xl px-6 py-8">{children}</main>
      </div>
    </WorkspaceOrganizationProvider>
  );
}

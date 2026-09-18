import Link from "next/link";
import { Suspense } from "react";
import { getCurrentUser } from "@/lib/auth/currentUser";
import { resolveOrganizationFeatures } from "@/lib/billing/subscription/subscription.resolver";
import { isPlatformAdminEmail } from "@/lib/dashboard/platform-admin";
import { resolveExactSingleOrganizationIdForUser } from "@/lib/organization/single-org-context";
import { redirect } from "next/navigation";
import {
  PEX_INTELLIGENCE_ENDPOINT,
  readProductIntelligenceExperience,
} from "@/lib/product/experience";
import { WorkspaceActionSurfacePanel } from "./WorkspaceActionSurfacePanel";
import { WorkspaceOrganizationProvider } from "./WorkspaceOrganizationProvider";

export const dynamic = "force-dynamic";

function planIdentityLabel(plan: string): string {
  const p = plan.trim().toUpperCase();
  if (p === "PRO" || p === "ENTERPRISE" || p === "BASIC") {
    return `当前套餐：${p}`;
  }
  return "";
}

export default async function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  let organizationId: string | null = null;
  try {
    organizationId = await resolveExactSingleOrganizationIdForUser(user.id);
  } catch {
    organizationId = null;
  }

  const isPlatformAdmin = isPlatformAdminEmail(user.email);
  const pex = isPlatformAdmin ? await readProductIntelligenceExperience() : null;

  // Same subscription source as ProductCommercialNav (7e2ca30e) / billing API.
  let currentPlan = "";
  if (organizationId) {
    try {
      const features = await resolveOrganizationFeatures(organizationId);
      currentPlan = String(features.plan || "").trim().toUpperCase();
    } catch {
      currentPlan = "";
    }
  }
  const planLabel = planIdentityLabel(currentPlan);

  return (
    <WorkspaceOrganizationProvider organizationId={organizationId ?? ""}>
      <div className="min-h-screen bg-zinc-950 text-white">
        <header className="border-b border-zinc-800 px-6 py-4">
          <nav className="mx-auto flex max-w-5xl flex-wrap items-center gap-6 text-sm">
            <Link href="/projects" className="font-semibold">
              项目
            </Link>
            <span className="ml-auto flex items-center gap-3 text-xs text-zinc-400">
              {user.email ? (
                <span className="max-w-[12rem] truncate" title={user.email}>
                  {user.email}
                </span>
              ) : null}
              {planLabel ? (
                <span
                  className={
                    currentPlan === "BASIC"
                      ? "text-zinc-400"
                      : "font-medium text-emerald-400"
                  }
                >
                  {planLabel}
                </span>
              ) : null}
              <Link
                href="/account"
                className="text-zinc-300 underline-offset-2 hover:text-white hover:underline"
              >
                账户
              </Link>
            </span>
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
          <Suspense fallback={null}>
            <WorkspaceActionSurfacePanel organizationId={organizationId} />
          </Suspense>
        </header>
        <main className="mx-auto max-w-5xl px-6 py-8">{children}</main>
      </div>
    </WorkspaceOrganizationProvider>
  );
}

import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { TenderEnterpriseUpgradeCta } from "@/app/(product)/TenderEnterpriseUpgradeCta";
import { buildTenderUpgradeHref } from "@/app/(product)/tender-entitlement";
import { getCurrentUser } from "@/lib/auth/currentUser";
import { isPlatformAdminEmail } from "@/lib/dashboard/platform-admin";
import { evaluatePaywall } from "@/lib/growth/conversion/paywall.engine";
import {
  ensureOrganizationForUser,
  listOrganizationsForUser,
} from "@/lib/organization/organization.service";
import {
  PEX_INTELLIGENCE_ENDPOINT,
  readProductIntelligenceExperience,
} from "@/lib/product/experience";
import { getProjectById } from "@/lib/services/project.service";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const existing = await listOrganizationsForUser(user.id);
  const organization =
    existing[0]?.organization ??
    (await ensureOrganizationForUser({
      userId: user.id,
      name: user.name ?? undefined,
    }));

  const { id } = await params;
  const project = await getProjectById(id);
  if (
    !project ||
    !project.organizationId ||
    project.organizationId !== organization.id
  ) {
    notFound();
  }

  const pex = isPlatformAdminEmail(user.email)
    ? await readProductIntelligenceExperience()
    : null;
  const tenderPaywall = await evaluatePaywall({
    organizationId: organization.id,
    userId: user.id,
    trigger: "tender_generation_click",
  });
  const canGenerateTender = !tenderPaywall.showPaywall;

  return (
    <div className="space-y-6">
      <div>
        <Link href="/projects" className="text-sm text-zinc-400 hover:text-white">
          ← 返回项目列表
        </Link>
        <h1 className="mt-2 text-2xl font-bold">{project.name}</h1>
        <p className="text-sm text-zinc-400">
          {project.clientName ?? "—"} · {project.city ?? "—"}
        </p>
      </div>
      {pex ? (
        <section className="rounded-lg border border-zinc-800 bg-black p-4 text-sm">
          <p className="text-xs text-zinc-600">只读 · GET {PEX_INTELLIGENCE_ENDPOINT}</p>
          <p className="mt-2">Status: {pex.status}</p>
          <p className="mt-1 text-zinc-300">
            Signals: open {pex.signals.openCount} · queued {pex.signals.queuedCount} · watch{" "}
            {pex.signals.watchCount} · held {pex.signals.heldCount} · escalate{" "}
            {pex.signals.escalateCount}
          </p>
          <p className="mt-1 text-zinc-300">
            Attention: open {pex.attention.openCount} · escalate {pex.attention.escalateCount}
          </p>
        </section>
      ) : null}

      <section className="grid gap-4 md:grid-cols-3">
        <Link
          href={`/quote?projectId=${encodeURIComponent(project.id)}`}
          className="rounded-xl border border-zinc-800 bg-black p-4 hover:border-zinc-600"
        >
          <div className="font-semibold">生成方案</div>
          <div className="text-xs text-zinc-400">Quote · {project.quotes.length} 条</div>
        </Link>
        <Link
          href={`/budget?projectId=${encodeURIComponent(project.id)}${
            project.quotes[0]
              ? `&quoteId=${encodeURIComponent(project.quotes[0].id)}`
              : ""
          }`}
          className="rounded-xl border border-zinc-800 bg-black p-4 hover:border-zinc-600"
        >
          <div className="font-semibold">计算预算</div>
          <div className="text-xs text-zinc-400">Budget · {project.budgets.length} 条</div>
        </Link>
        {canGenerateTender ? (
          <Link
            href={`/tender?projectId=${encodeURIComponent(project.id)}${
              project.quotes[0]
                ? `&quoteId=${encodeURIComponent(project.quotes[0].id)}`
                : ""
            }${
              project.budgets[0]
                ? `&budgetId=${encodeURIComponent(project.budgets[0].id)}`
                : ""
            }`}
            className="rounded-xl border border-zinc-800 bg-black p-4 hover:border-zinc-600"
          >
            <div className="font-semibold">生成标书</div>
            <div className="text-xs text-zinc-400">Tender · {project.tenders.length} 条</div>
          </Link>
        ) : (
          <div className="rounded-xl border border-amber-700/50 bg-black p-4">
            <div className="font-semibold text-zinc-300">生成标书（锁定）</div>
            <div className="mt-1 text-xs text-zinc-500">
              Enterprise 功能 · 当前{" "}
              {tenderPaywall?.currentPlan ?? "BASIC"} · 升级{" "}
              {tenderPaywall?.recommendedPlan ?? "ENTERPRISE"}
            </div>
            <div className="mt-3">
              <TenderEnterpriseUpgradeCta
                href={buildTenderUpgradeHref(
                  {
                    organizationId: organization?.id,
                    projectId: project.id,
                    quoteId: project.quotes[0]?.id,
                    budgetId: project.budgets[0]?.id,
                  },
                  { authenticated: Boolean(organization?.id), currentPath: "/tender" },
                )}
                context={{
                  organizationId: organization?.id,
                  projectId: project.id,
                  quoteId: project.quotes[0]?.id,
                  budgetId: project.budgets[0]?.id,
                }}
              />
            </div>
          </div>
        )}
      </section>

      <section className="rounded-xl border border-zinc-800 bg-black p-4 text-xs text-zinc-400">
        <div>Project ID: {project.id}</div>
        <div>Site: {project.siteType} · Budget Level: {project.budgetLevel}</div>
      </section>
    </div>
  );
}

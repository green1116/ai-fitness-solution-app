import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { ProUpgradeContactCta } from "@/app/(product)/ProUpgradeContactCta";
import { TenderEnterpriseUpgradeCta } from "@/app/(product)/TenderEnterpriseUpgradeCta";
import { buildTenderUpgradeHref } from "@/app/(product)/tender-entitlement";
import { getCurrentUser } from "@/lib/auth/currentUser";
import { isPlatformAdminEmail } from "@/lib/dashboard/platform-admin";
import { evaluatePaywall } from "@/lib/growth/conversion/paywall.engine";
import { getPricingTier } from "@/lib/growth/conversion/pricing.strategy";
import { resolveExactSingleOrganizationIdForUser } from "@/lib/organization/single-org-context";
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

  const organizationId = await resolveExactSingleOrganizationIdForUser(user.id);
  if (!organizationId) {
    notFound();
  }

  const { id } = await params;
  const project = await getProjectById(id);
  if (
    !project ||
    !project.organizationId ||
    project.organizationId !== organizationId
  ) {
    notFound();
  }

  const pex = isPlatformAdminEmail(user.email)
    ? await readProductIntelligenceExperience()
    : null;
  const tenderPaywall = await evaluatePaywall({
    organizationId,
    userId: user.id,
    trigger: "tender_generation_click",
  });
  const canGenerateTender = !tenderPaywall.showPaywall;
  const budgetPaywall = await evaluatePaywall({
    organizationId,
    userId: user.id,
    trigger: "budget_feature_blocked",
  });
  const canGenerateBudget = !budgetPaywall.showPaywall;
  const proTier = getPricingTier("PRO");

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

      <p className="text-sm text-zinc-400">
        交付路径：项目 → 方案 → 预算 → 投标 → 下载
      </p>

      <section className="grid gap-4 md:grid-cols-3">
        <Link
          href={`/quote?projectId=${encodeURIComponent(project.id)}`}
          className={`rounded-xl border bg-black p-4 hover:border-zinc-600 ${
            project.quotes.length === 0
              ? "border-emerald-600 ring-1 ring-emerald-600/40"
              : "border-zinc-800"
          }`}
        >
          <div className="text-xs text-emerald-400">第 1 步</div>
          <div className="font-semibold">
            {project.quotes.length === 0 ? "下一步：生成方案" : "方案"}
          </div>
          <div className="text-xs text-zinc-400">已有 {project.quotes.length} 份方案</div>
        </Link>
        {canGenerateBudget ? (
          <Link
            href={`/budget?projectId=${encodeURIComponent(project.id)}${
              project.quotes[0]
                ? `&quoteId=${encodeURIComponent(project.quotes[0].id)}`
                : ""
            }`}
            className={`rounded-xl border bg-black p-4 hover:border-zinc-600 ${
              project.quotes.length > 0 && project.budgets.length === 0
                ? "border-emerald-600 ring-1 ring-emerald-600/40"
                : "border-zinc-800"
            }`}
          >
            <div className="text-xs text-emerald-400">第 2 步</div>
            <div className="font-semibold">
              {project.quotes.length > 0 && project.budgets.length === 0
                ? "下一步：计算预算"
                : "预算"}
            </div>
            <div className="text-xs text-zinc-400">已有 {project.budgets.length} 份预算</div>
          </Link>
        ) : (
          <div
            className={`rounded-xl border bg-black p-4 ${
              project.quotes.length > 0 && project.budgets.length === 0
                ? "border-amber-700/50"
                : "border-zinc-800"
            }`}
          >
            <div className="text-xs text-amber-400">第 2 步</div>
            <div className="font-semibold text-zinc-300">预算（{proTier.label}）</div>
            <div className="mt-1 text-xs text-zinc-500">
              {proTier.label} · ¥{proTier.monthlyPriceCny}/月 · {proTier.headline} · 当前{" "}
              {budgetPaywall.currentPlan} · 提交后由团队联系完成升级
            </div>
            <div className="mt-3">
              <ProUpgradeContactCta
                context={{
                  organizationId,
                  projectId: project.id,
                  quoteId: project.quotes[0]?.id,
                }}
                buttonClassName="inline-flex rounded-lg bg-emerald-400 px-3 py-1.5 text-xs font-semibold text-black hover:bg-emerald-300"
              />
            </div>
          </div>
        )}
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
            className={`rounded-xl border bg-black p-4 hover:border-zinc-600 ${
              project.budgets.length > 0
                ? "border-emerald-600 ring-1 ring-emerald-600/40"
                : "border-zinc-800"
            }`}
          >
            <div className="text-xs text-emerald-400">第 3 步</div>
            <div className="font-semibold">
              {project.budgets.length > 0 ? "下一步：生成投标文件" : "投标"}
            </div>
            <div className="text-xs text-zinc-400">已有 {project.tenders.length} 份投标文件</div>
          </Link>
        ) : (
          <div className="rounded-xl border border-amber-700/50 bg-black p-4">
            <div className="text-xs text-amber-400">第 3 步</div>
            <div className="font-semibold text-zinc-300">投标（锁定）</div>
            <div className="mt-1 text-xs text-zinc-500">
              Enterprise 功能 · 当前{" "}
              {tenderPaywall?.currentPlan ?? "BASIC"} · 升级{" "}
              {tenderPaywall?.recommendedPlan ?? "ENTERPRISE"}
            </div>
            <div className="mt-3">
              <TenderEnterpriseUpgradeCta
                href={buildTenderUpgradeHref(
                  {
                    organizationId,
                    projectId: project.id,
                    quoteId: project.quotes[0]?.id,
                    budgetId: project.budgets[0]?.id,
                  },
                  { authenticated: Boolean(organizationId), currentPath: "/tender" },
                )}
                context={{
                  organizationId,
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
        <div>项目编号：{project.id}</div>
        <div>
          场地：{project.siteType} · 预算档位：{project.budgetLevel}
        </div>
      </section>
    </div>
  );
}

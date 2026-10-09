import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { BUDGET_PRICE_BASIS_LABEL, countBudgetPriceBasis } from "@/app/(product)/budget/price-basis";
import { ProUpgradeContactCta } from "@/app/(product)/ProUpgradeContactCta";
import { getCurrentUser } from "@/lib/auth/currentUser";
import { listProjectBudgets, resolveSavedBudgetProjectAccess } from "@/lib/services/saved-budget.service";

import {
  budgetRecalculateHref,
  formatSavedBudgetRange,
  formatSavedBudgetTime,
  parseSavedBudgetPage,
  readSavedBudgetItems,
  savedBudgetDetailHref,
  savedBudgetHistoryHref,
  savedBudgetTierLabel,
  type SavedBudgetItemsView,
} from "./saved-budget-view";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function basisSummary(view: SavedBudgetItemsView): string {
  if (view.kind === "legacy") return "旧版预算 · 仅品类合计";
  if (view.kind === "unrecognized") return "明细格式无法识别";
  const counts = countBudgetPriceBasis(view.panelItems);
  return (["VERIFIED", "ORGANIZATION_ESTIMATE", "PLATFORM_ESTIMATE"] as const)
    .map((kind) => `${BUDGET_PRICE_BASIS_LABEL[kind]} ${counts[kind]} 项`)
    .join(" · ");
}

export default async function SavedBudgetHistoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string | string[] }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { id } = await params;
  const access = await resolveSavedBudgetProjectAccess(user.id, id);
  if (access.kind === "not-found") notFound();

  const backToProject = (
    <Link href={`/projects/${encodeURIComponent(access.projectId)}`} className="text-sm text-zinc-400 hover:text-white">
      ← 返回项目
    </Link>
  );

  if (access.kind === "locked") {
    return (
      <div className="space-y-4">
        {backToProject}
        <h1 className="text-2xl font-bold">历史预算</h1>
        <p className="text-sm text-zinc-300">当前套餐不包含预算功能，升级专业版后可查看已保存的预算。</p>
        <ProUpgradeContactCta context={{ organizationId: access.organizationId, projectId: access.projectId }} />
      </div>
    );
  }

  const requestedPage = parseSavedBudgetPage((await searchParams).page);
  const result = await listProjectBudgets(access.projectId, access.organizationId, requestedPage);
  const newestId = result.page === 1 ? result.budgets[0]?.id : undefined;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        {backToProject}
        <h1 className="text-2xl font-bold">历史预算</h1>
        <p className="text-sm text-zinc-400">{`${access.projectName} · 共 ${result.total} 份预算（按保存时间倒序）`}</p>
        <p className="text-sm text-zinc-400">每份预算保存的是计算当时的快照，之后修改采购库、价目表或方案不会改变已保存的预算。</p>
      </div>

      {result.total === 0 ? (
        <p className="rounded-xl border border-zinc-800 p-4 text-sm text-zinc-400">该项目还没有保存的预算。</p>
      ) : (
        <ul className="space-y-3">
          {result.budgets.map((budget) => (
            <li key={budget.id} data-budget-id={budget.id} className="space-y-1 rounded-xl border border-zinc-800 bg-black p-4 text-sm">
              <p className="flex flex-wrap items-center gap-2 text-zinc-100">
                <span className="font-semibold">{formatSavedBudgetTime(budget.createdAt)}</span>
                {budget.id === newestId ? (
                  <span className="rounded-full border border-emerald-700 px-2 text-xs text-emerald-200">最新</span>
                ) : null}
              </p>
              <p className="text-zinc-200">{`总预算：${formatSavedBudgetRange(budget.totalEstimateMin, budget.totalEstimateMax)}（${budget.currency}）`}</p>
              <p className="text-zinc-400">
                {`方案依据：${budget.quoteId ? `quoteId=${budget.quoteId}` : "未记录方案依据"} · 预算档位：${savedBudgetTierLabel(budget.budgetTier)}`}
              </p>
              <p className="text-zinc-400">{basisSummary(readSavedBudgetItems(budget.items))}</p>
              <Link href={savedBudgetDetailHref(access.projectId, budget.id)} className="inline-block text-emerald-400 underline">
                查看详情与 PDF
              </Link>
            </li>
          ))}
        </ul>
      )}

      {result.pageCount > 1 ? (
        <nav className="flex items-center gap-4 text-sm text-zinc-300">
          {result.page > 1 ? (
            <Link href={savedBudgetHistoryHref(access.projectId, result.page - 1)} className="underline">
              上一页
            </Link>
          ) : null}
          <span>{`第 ${result.page} / ${result.pageCount} 页`}</span>
          {result.page < result.pageCount ? (
            <Link href={savedBudgetHistoryHref(access.projectId, result.page + 1)} className="underline">
              下一页
            </Link>
          ) : null}
        </nav>
      ) : null}

      <Link
        href={budgetRecalculateHref(access.projectId, null)}
        className="inline-block rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-200 hover:border-zinc-500"
      >
        重新计算预算
      </Link>
    </div>
  );
}

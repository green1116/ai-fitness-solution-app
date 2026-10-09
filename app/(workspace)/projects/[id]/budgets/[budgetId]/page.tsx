import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { BudgetPriceBasisPanel } from "@/app/(product)/budget/price-basis";
import { ProUpgradeContactCta } from "@/app/(product)/ProUpgradeContactCta";
import { getCurrentUser } from "@/lib/auth/currentUser";
import { getProjectBudget, resolveSavedBudgetProjectAccess } from "@/lib/services/saved-budget.service";

import {
  budgetRecalculateHref,
  formatSavedBudgetRange,
  formatSavedBudgetTime,
  readSavedBudgetItems,
  savedBudgetHistoryHref,
  savedBudgetTierLabel,
} from "../saved-budget-view";
import { SavedBudgetPdfButton } from "./SavedBudgetPdfButton";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function SavedBudgetDetailPage({
  params,
}: {
  params: Promise<{ id: string; budgetId: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { id, budgetId } = await params;
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
        <h1 className="text-2xl font-bold">已保存预算</h1>
        <p className="text-sm text-zinc-300">当前套餐不包含预算功能，升级专业版后可查看已保存的预算明细与 PDF。</p>
        <ProUpgradeContactCta context={{ organizationId: access.organizationId, projectId: access.projectId }} />
      </div>
    );
  }

  const budget = await getProjectBudget(access.projectId, budgetId, access.organizationId);
  if (!budget) notFound();

  const view = readSavedBudgetItems(budget.items);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        {backToProject}
        <h1 className="text-2xl font-bold">已保存预算</h1>
        <p className="text-sm text-zinc-400">
          {`${access.projectName} · 保存于 ${formatSavedBudgetTime(budget.createdAt)} · 预算编号 ${budget.id}`}
        </p>
      </div>

      <section className="space-y-2 rounded-xl border border-zinc-800 bg-black p-4 text-sm text-zinc-300">
        <p className="text-base font-semibold text-white">
          {`总预算：${formatSavedBudgetRange(budget.totalEstimateMin, budget.totalEstimateMax)}（${budget.currency}）`}
        </p>
        <p>{`方案依据：${budget.quoteId ? `quoteId=${budget.quoteId}` : "未记录方案依据"}`}</p>
        <p>{`预算档位：${savedBudgetTierLabel(budget.budgetTier)}`}</p>
        <p className="text-zinc-400">
          以上为预算保存时的快照；之后修改采购库、组织估算价目表或方案不会改变本预算。重新计算会生成新的预算。
        </p>
      </section>

      {view.kind === "detailed" ? (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">设备明细（保存时）</h2>
          <div className="overflow-x-auto rounded-xl border border-zinc-800">
            <table className="w-full text-left text-sm text-zinc-300">
              <thead className="text-zinc-400">
                <tr className="border-b border-zinc-800">
                  <th className="px-3 py-2 font-medium">设备</th>
                  <th className="px-3 py-2 font-medium">数量</th>
                  <th className="px-3 py-2 font-medium">单价区间</th>
                  <th className="px-3 py-2 font-medium">小计</th>
                  <th className="px-3 py-2 font-medium">核实状态</th>
                </tr>
              </thead>
              <tbody>
                {view.rows.map((row, index) => (
                  <tr key={index} data-row={index} className="border-b border-zinc-900 align-top">
                    <td className="px-3 py-2 text-zinc-100">
                      {row.name}
                      <span className="text-zinc-400">{`（${row.category}）`}</span>
                    </td>
                    <td className="px-3 py-2">{row.quantity}</td>
                    <td className="px-3 py-2">{formatSavedBudgetRange(row.unitPriceMin, row.unitPriceMax)}</td>
                    <td className="px-3 py-2">{formatSavedBudgetRange(row.subtotalMin, row.subtotalMax)}</td>
                    <td className="px-3 py-2">
                      {row.verifiedSource ? (
                        <span className="text-emerald-200">{`已核实 · ${row.verifiedSource}`}</span>
                      ) : (
                        <span className="text-zinc-400">估算（未核实）</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <BudgetPriceBasisPanel items={view.panelItems} />
        </section>
      ) : view.kind === "legacy" ? (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">品类合计（旧版预算）</h2>
          <p className="text-sm text-amber-300">旧版预算仅保存了品类合计，未保存逐项数量、单价与价格依据。</p>
          <ul className="space-y-1 rounded-xl border border-zinc-800 p-4 text-sm text-zinc-300">
            {view.rows.map((row, index) => (
              <li key={index}>{`${row.category}：${formatSavedBudgetRange(row.min, row.max)}`}</li>
            ))}
          </ul>
        </section>
      ) : (
        <p className="rounded-xl border border-zinc-800 p-4 text-sm text-amber-300">
          该预算的明细快照格式无法识别，暂不能逐项显示；总预算以上方保存值为准。
        </p>
      )}

      <section className="flex flex-wrap items-start gap-4">
        <SavedBudgetPdfButton
          organizationId={access.organizationId}
          projectId={access.projectId}
          budgetId={budget.id}
          budgetTier={budget.budgetTier}
          companySize={budget.companySize}
        />
        <Link
          href={savedBudgetHistoryHref(access.projectId)}
          className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-200 hover:border-zinc-500"
        >
          全部历史预算
        </Link>
        <Link
          href={budgetRecalculateHref(access.projectId, budget.quoteId)}
          className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-200 hover:border-zinc-500"
        >
          重新计算预算
        </Link>
      </section>
    </div>
  );
}

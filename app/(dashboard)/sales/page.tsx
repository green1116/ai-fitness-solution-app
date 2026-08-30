import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { getCurrentUser } from "@/lib/auth/currentUser";
import { analyzeSales } from "@/lib/dashboard/analytics/sales.analytics";
import { isPlatformAdminEmail } from "@/lib/dashboard/platform-admin";
import { buildSalesFunnelWidget } from "@/lib/dashboard/widgets/funnel.widget";
import { redirect } from "next/navigation";

export default async function SalesDashboardPage() {
  const user = await getCurrentUser();
  if (!isPlatformAdminEmail(user?.email)) redirect("/projects");
  const sales = analyzeSales("ceo-global");
  const funnel = buildSalesFunnelWidget(sales.pipeline);

  return (
    <div className="space-y-6">
      <DashboardNav active="/sales" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
          <p className="text-xs text-zinc-500">Lead → Deal 转化率</p>
          <p className="mt-2 text-2xl font-semibold">{sales.conversion.leadToDealRate}%</p>
        </div>
        <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
          <p className="text-xs text-zinc-500">AI 销售成功率</p>
          <p className="mt-2 text-2xl font-semibold">{sales.conversion.aiSuccessRate}%</p>
        </div>
        <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
          <p className="text-xs text-zinc-500">预计成交天数</p>
          <p className="mt-2 text-2xl font-semibold">{sales.conversion.predictedCloseDays}</p>
        </div>
        <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
          <p className="text-xs text-zinc-500">Hot Deals</p>
          <p className="mt-2 text-2xl font-semibold">{sales.pipeline.hotDeals}</p>
        </div>
      </div>
      <section className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
        <h3 className="font-medium">Pipeline 状态</h3>
        <ul className="mt-3 space-y-2">
          {funnel.stages.map((s) => (
            <li key={s.name} className="flex justify-between text-sm text-zinc-400">
              <span>{s.name}</span>
              <span>{s.count}</span>
            </li>
          ))}
        </ul>
      </section>
      <section className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
        <h3 className="font-medium">商机预测</h3>
        <p className="mt-2 text-sm text-zinc-400">
          概率标签: <span className="text-emerald-400">{sales.dealPrediction.label}</span> ·{" "}
          {sales.dealPrediction.probability}% · 预计 {sales.dealPrediction.estimatedCloseDays} 天
        </p>
      </section>
    </div>
  );
}

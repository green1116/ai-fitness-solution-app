import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { KpiGrid } from "@/components/dashboard/KpiGrid";
import { getCurrentUser } from "@/lib/auth/currentUser";
import { refreshDashboardData } from "@/lib/dashboard/dashboard.service";
import { isPlatformAdminEmail } from "@/lib/dashboard/platform-admin";
import { redirect } from "next/navigation";

export default async function OverviewDashboardPage() {
  const user = await getCurrentUser();
  if (!isPlatformAdminEmail(user?.email)) redirect("/customers");
  const data = refreshDashboardData("ceo-global");
  const coreKpis = data.kpis.filter((k) =>
    ["mrr", "arr", "active_users", "conversion", "churn"].includes(k.id),
  );

  return (
    <div className="space-y-6">
      <DashboardNav active="/overview" />
      <section>
        <h2 className="mb-4 text-lg font-semibold">核心 KPI</h2>
        <KpiGrid widgets={coreKpis} />
      </section>
      <section className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
        <h3 className="text-sm font-medium text-zinc-300">漏斗概览</h3>
        <ul className="mt-3 space-y-2">
          {data.funnelWidget.stages.map((s) => (
            <li key={s.name} className="flex justify-between text-sm text-zinc-400">
              <span>{s.name}</span>
              <span>
                {s.count}
                {s.rate !== undefined ? ` (${s.rate}%)` : ""}
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-xs text-zinc-600">更新于 {data.refreshedAt}</p>
      </section>
    </div>
  );
}

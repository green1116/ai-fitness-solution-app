import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { getCurrentUser } from "@/lib/auth/currentUser";
import { analyzeGrowth } from "@/lib/dashboard/analytics/growth.analytics";
import { isPlatformAdminEmail } from "@/lib/dashboard/platform-admin";
import { buildFunnelWidget } from "@/lib/dashboard/widgets/funnel.widget";
import { redirect } from "next/navigation";

export default async function GrowthDashboardPage() {
  const user = await getCurrentUser();
  if (!isPlatformAdminEmail(user?.email)) redirect("/customers");
  const growth = analyzeGrowth();
  const funnel = buildFunnelWidget(growth.funnel);

  return (
    <div className="space-y-6">
      <DashboardNav active="/growth" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
          <p className="text-xs text-zinc-500">Visitor → Signup</p>
          <p className="mt-2 text-2xl font-semibold">{growth.visitorToSignup}%</p>
        </div>
        <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
          <p className="text-xs text-zinc-500">Activation Rate</p>
          <p className="mt-2 text-2xl font-semibold">{growth.activationRate}%</p>
        </div>
        <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
          <p className="text-xs text-zinc-500">留存率</p>
          <p className="mt-2 text-2xl font-semibold">{growth.metrics.retentionRate}%</p>
        </div>
        <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
          <p className="text-xs text-zinc-500">流失率</p>
          <p className="mt-2 text-2xl font-semibold">{growth.metrics.churnRate}%</p>
        </div>
      </div>
      <section className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
        <h3 className="font-medium">增长漏斗</h3>
        <ul className="mt-3 space-y-2">
          {funnel.stages.map((s) => (
            <li key={s.name} className="flex justify-between text-sm text-zinc-400">
              <span>{s.name}</span>
              <span>
                {s.count}
                {s.rate !== undefined ? ` (${s.rate}%)` : ""}
              </span>
            </li>
          ))}
        </ul>
      </section>
      <section className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
        <h3 className="font-medium">增长趋势</h3>
        <ul className="mt-3 space-y-2 text-sm text-zinc-400">
          {Object.entries(growth.trends).map(([k, v]) => (
            <li key={k} className="flex justify-between">
              <span>{k}</span>
              <span>{v}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

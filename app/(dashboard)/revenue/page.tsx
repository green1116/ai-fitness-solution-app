import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { analyzeRevenue } from "@/lib/dashboard/analytics/revenue.analytics";

export default function RevenueDashboardPage() {
  const revenue = analyzeRevenue();

  return (
    <div className="space-y-6">
      <DashboardNav active="/revenue" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "MRR", value: revenue.mrr, unit: "USD" },
          { label: "ARR", value: revenue.arr, unit: "USD" },
          { label: "Stripe 收入", value: revenue.stripeRevenue, unit: "USD" },
          { label: "总营收", value: revenue.totalRevenue, unit: "USD" },
        ].map((item) => (
          <div key={item.label} className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
            <p className="text-xs text-zinc-500">{item.label}</p>
            <p className="mt-2 text-2xl font-semibold">
              {item.value.toLocaleString()} <span className="text-sm text-zinc-400">{item.unit}</span>
            </p>
          </div>
        ))}
      </div>
      <section className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
        <h3 className="font-medium">订阅拆解</h3>
        <table className="mt-3 w-full text-sm">
          <thead>
            <tr className="text-left text-zinc-500">
              <th className="pb-2">套餐</th>
              <th className="pb-2">数量</th>
              <th className="pb-2">MRR</th>
            </tr>
          </thead>
          <tbody>
            {revenue.subscriptionBreakdown.map((row) => (
              <tr key={row.plan} className="border-t border-zinc-900 text-zinc-300">
                <td className="py-2">{row.plan}</td>
                <td className="py-2">{row.count}</td>
                <td className="py-2">${row.mrr}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
          <p className="text-xs text-zinc-500">使用量收入</p>
          <p className="mt-2 text-xl font-semibold">${revenue.usageRevenue}</p>
        </div>
        <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
          <p className="text-xs text-zinc-500">企业收入</p>
          <p className="mt-2 text-xl font-semibold">${revenue.enterpriseRevenue}</p>
        </div>
      </div>
    </div>
  );
}

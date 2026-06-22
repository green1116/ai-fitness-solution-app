import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { analyzeCustomersFromEvents } from "@/lib/dashboard/analytics/customer.analytics";

export default function CustomersDashboardPage() {
  const customers = analyzeCustomersFromEvents();

  return (
    <div className="space-y-6">
      <DashboardNav active="/customers" />
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
          <p className="text-xs text-zinc-500">客户数量</p>
          <p className="mt-2 text-2xl font-semibold">{customers.totalCustomers}</p>
        </div>
        <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
          <p className="text-xs text-zinc-500">企业组织</p>
          <p className="mt-2 text-2xl font-semibold">{customers.organizations}</p>
        </div>
        <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
          <p className="text-xs text-zinc-500">付费用户比例</p>
          <p className="mt-2 text-2xl font-semibold">{customers.paidUserRatio}%</p>
        </div>
      </div>
      <section className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
        <h3 className="font-medium">客户生命周期</h3>
        <ul className="mt-3 space-y-2 text-sm text-zinc-400">
          <li className="flex justify-between">
            <span>注册</span>
            <span>{customers.lifecycle.signups}</span>
          </li>
          <li className="flex justify-between">
            <span>激活</span>
            <span>{customers.lifecycle.activated}</span>
          </li>
          <li className="flex justify-between">
            <span>付费</span>
            <span>{customers.lifecycle.paid}</span>
          </li>
        </ul>
      </section>
    </div>
  );
}

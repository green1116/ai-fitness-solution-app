import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { getCurrentUser } from "@/lib/auth/currentUser";
import { analyzeCustomers } from "@/lib/dashboard/analytics/customer.analytics";
import { isPlatformAdminEmail } from "@/lib/dashboard/platform-admin";
import { listOrganizationsForUser } from "@/lib/organization/organization.service";
import { redirect } from "next/navigation";

export default async function CustomersDashboardPage() {
  const user = await getCurrentUser();
  if (!isPlatformAdminEmail(user?.email)) redirect("/projects");
  const orgs = user ? await listOrganizationsForUser(user.id) : [];
  const organizationId = orgs[0]?.organization.id ?? "";
  const customers = await analyzeCustomers(organizationId);

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
            <span>线索</span>
            <span>{customers.lifecycle.leads}</span>
          </li>
          <li className="flex justify-between">
            <span>合格</span>
            <span>{customers.lifecycle.qualified}</span>
          </li>
          <li className="flex justify-between">
            <span>商机</span>
            <span>{customers.lifecycle.opportunities}</span>
          </li>
          <li className="flex justify-between">
            <span>赢单</span>
            <span>{customers.lifecycle.dealsWon}</span>
          </li>
          <li className="flex justify-between">
            <span>收入</span>
            <span>{customers.lifecycle.revenue}</span>
          </li>
        </ul>
        <div className="mt-4">
          <h4 className="text-sm font-medium text-zinc-300">赢单客户</h4>
          <ul className="mt-2 space-y-2 text-sm text-zinc-400">
            {customers.wonCustomerIds.map((customerId) => (
              <li key={customerId} className="flex justify-between gap-4">
                <span className="truncate">{customerId}</span>
                <span>{customers.revenueByCustomer[customerId] ?? 0}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}

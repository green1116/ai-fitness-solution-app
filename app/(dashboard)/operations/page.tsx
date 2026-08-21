import { GET } from "@/app/api/operations/surface/route";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { getCurrentUser } from "@/lib/auth/currentUser";
import type { OperationsSurface } from "@/lib/commercial/operations-surface";
import { analyzeCustomers } from "@/lib/dashboard/analytics/customer.analytics";
import { analyzeOperations } from "@/lib/dashboard/analytics/operations.analytics";
import { listOrganizationsForUser } from "@/lib/organization/organization.service";

export const dynamic = "force-dynamic";

export default async function OperationsDashboardPage() {
  const ops = analyzeOperations();
  const surfaceRes = await GET();
  const surface = (await surfaceRes.json()) as OperationsSurface;
  const { summary } = surface;

  const user = await getCurrentUser();
  const orgs = user ? await listOrganizationsForUser(user.id) : [];
  const organizationId = orgs[0]?.organization.id ?? "";
  const customers = await analyzeCustomers(organizationId);
  const totalWonCustomers = customers.wonCustomerIds.length;
  const totalWonRevenue = customers.wonCustomerIds.reduce(
    (sum, id) => sum + (customers.revenueByCustomer[id] ?? 0),
    0,
  );

  return (
    <div className="space-y-6">
      <DashboardNav active="/operations" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
          <p className="text-xs text-zinc-500">系统健康</p>
          <p className="mt-2 text-2xl font-semibold capitalize text-emerald-400">{ops.health}</p>
        </div>
        <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
          <p className="text-xs text-zinc-500">API 调用</p>
          <p className="mt-2 text-2xl font-semibold">{ops.apiRequests}</p>
        </div>
        <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
          <p className="text-xs text-zinc-500">错误率</p>
          <p className="mt-2 text-2xl font-semibold">{ops.errorRate}%</p>
        </div>
        <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
          <p className="text-xs text-zinc-500">平均延迟</p>
          <p className="mt-2 text-2xl font-semibold">{ops.avgLatencyMs} ms</p>
        </div>
      </div>
      <section className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
        <h3 className="font-medium">运行环境</h3>
        <p className="mt-2 text-sm text-zinc-400">{ops.environment}</p>
        <p className="mt-1 text-xs text-zinc-600">API 错误: {ops.apiErrors}</p>
      </section>
      <section className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
        <h3 className="font-medium">Operations Surface</h3>
        <p className="mt-1 text-xs text-zinc-600">只读 · GET /api/operations/surface</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-xs text-zinc-500">Queue</p>
            <p className="mt-2 text-2xl font-semibold">{summary.itemCount}</p>
            <p className="mt-1 text-xs text-zinc-600">
              open {summary.openCount} · queued {summary.queuedCount} · watch{" "}
              {summary.watchCount} · held {summary.heldCount}
            </p>
          </div>
          <div>
            <p className="text-xs text-zinc-500">Decision</p>
            <p className="mt-2 text-2xl font-semibold">{summary.actCount}</p>
          </div>
          <div>
            <p className="text-xs text-zinc-500">Outcome</p>
            <p className="mt-2 text-2xl font-semibold">{summary.recordedCount}</p>
          </div>
          <div>
            <p className="text-xs text-zinc-500">Feedback</p>
            <p className="mt-2 text-2xl font-semibold">{summary.escalateCount}</p>
          </div>
        </div>
      </section>
      <section className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
        <h3 className="font-medium">CRM Win Signals</h3>
        <ul className="mt-3 space-y-2 text-sm text-zinc-400">
          <li className="flex justify-between">
            <span>赢单客户数</span>
            <span>{totalWonCustomers}</span>
          </li>
          <li className="flex justify-between">
            <span>赢单收入合计</span>
            <span>{totalWonRevenue}</span>
          </li>
        </ul>
        <div className="mt-4">
          <h4 className="text-sm font-medium text-zinc-300">赢单客户</h4>
          <ul className="mt-2 space-y-2 text-sm text-zinc-400">
            {customers.wonCustomerIds.map((customerId) => {
              const revenue = customers.revenueByCustomer[customerId] ?? 0;
              const revenueLabel =
                revenue > 0 ? "REVENUE CONFIRMED" : "WIN RECORDED";
              const postWinCount =
                customers.postWinActivityCountByCustomer[customerId] ?? 0;
              const postWinLabel =
                postWinCount > 0 ? "POST-WIN ACTIVITY" : "NO POST-WIN ACTIVITY";
              const engagementLabel =
                revenue > 0 && postWinCount > 0
                  ? "POST-WIN COMMERCIAL ENGAGEMENT"
                  : null;
              return (
                <li key={customerId} className="flex justify-between gap-4">
                  <span className="truncate">
                    {customerId} · WON · {revenueLabel} · {postWinLabel} (
                    {postWinCount})
                    {engagementLabel ? ` · ${engagementLabel}` : ""}
                  </span>
                  <span>{revenue}</span>
                </li>
              );
            })}
          </ul>
        </div>
      </section>
    </div>
  );
}

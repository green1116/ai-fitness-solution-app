import { GET } from "@/app/api/operations/surface/route";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { getCurrentUser } from "@/lib/auth/currentUser";
import type { OperationsSurface } from "@/lib/commercial/operations-surface";
import { analyzeCustomers } from "@/lib/dashboard/analytics/customer.analytics";
import { analyzeOperations } from "@/lib/dashboard/analytics/operations.analytics";
import { isPlatformAdminEmail } from "@/lib/dashboard/platform-admin";
import { listOrganizationsForUser } from "@/lib/organization/organization.service";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

const HEALTH_LABELS: Record<string, string> = {
  healthy: "正常",
  degraded: "需关注",
  critical: "风险",
};

const ENVIRONMENT_LABELS: Record<string, string> = {
  production: "生产环境",
  staging: "预发环境",
  development: "开发环境",
};

function labelHealth(health: string): string {
  return HEALTH_LABELS[health] ?? "未知";
}

function labelEnvironment(environment: string): string {
  return ENVIRONMENT_LABELS[environment] ?? environment;
}

function labelWonCustomerStatus(revenue: number, postWinCount: number): string {
  const revenueLabel = revenue > 0 ? "收入已确认" : "赢单已记录";
  const postWinLabel = postWinCount > 0 ? "赢单后有跟进" : "赢单后待跟进";
  const engagementLabel =
    revenue > 0 && postWinCount > 0 ? " · 已形成商业互动" : "";
  return `已赢单 · ${revenueLabel} · ${postWinLabel}（${postWinCount}）${engagementLabel}`;
}

export default async function OperationsDashboardPage() {
  const ops = analyzeOperations();
  const surfaceRes = await GET();
  const surface = (await surfaceRes.json()) as OperationsSurface;
  const { summary } = surface;

  const user = await getCurrentUser();
  if (!isPlatformAdminEmail(user?.email)) redirect("/customers");

  const orgs = user ? await listOrganizationsForUser(user.id) : [];
  const organizationId = orgs[0]?.organization.id ?? "";
  const customers = await analyzeCustomers(organizationId);
  const totalWonCustomers = customers.wonCustomerIds.length;
  const totalWonRevenue = customers.wonCustomerIds.reduce(
    (sum, id) => sum + (customers.revenueByCustomer[id] ?? 0),
    0,
  );

  const customerRows =
    customers.wonCustomerIds.length === 0
      ? []
      : await prisma.customer.findMany({
          where: { id: { in: customers.wonCustomerIds } },
          select: { id: true, name: true },
        });
  const customerNameById = new Map(customerRows.map((row) => [row.id, row.name]));

  const displayCustomerName = (customerId: string) => {
    const name = customerNameById.get(customerId)?.trim();
    return name && name.length > 0 ? name : `客户 ${customerId.slice(0, 8)}`;
  };

  return (
    <div className="space-y-6">
      <DashboardNav active="/operations" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
          <p className="text-xs text-zinc-500">系统健康</p>
          <p className="mt-2 text-2xl font-semibold text-emerald-400">{labelHealth(ops.health)}</p>
        </div>
        <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
          <p className="text-xs text-zinc-500">服务请求量</p>
          <p className="mt-2 text-2xl font-semibold">{ops.apiRequests}</p>
        </div>
        <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
          <p className="text-xs text-zinc-500">服务错误率</p>
          <p className="mt-2 text-2xl font-semibold">{ops.errorRate}%</p>
        </div>
        <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
          <p className="text-xs text-zinc-500">平均响应时间</p>
          <p className="mt-2 text-2xl font-semibold">{ops.avgLatencyMs} 毫秒</p>
        </div>
      </div>
      <section className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
        <h3 className="font-medium">运行环境</h3>
        <p className="mt-2 text-sm text-zinc-400">{labelEnvironment(ops.environment)}</p>
        <p className="mt-1 text-xs text-zinc-600">服务错误次数：{ops.apiErrors}</p>
      </section>
      <section className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
        <h3 className="font-medium">运营工作台概览</h3>
        <p className="mt-1 text-xs text-zinc-600">只读运营摘要</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-xs text-zinc-500">待处理事项</p>
            <p className="mt-2 text-2xl font-semibold">{summary.itemCount}</p>
            <p className="mt-1 text-xs text-zinc-600">
              进行中 {summary.openCount} · 排队中 {summary.queuedCount} · 观察中{" "}
              {summary.watchCount} · 暂缓 {summary.heldCount}
            </p>
          </div>
          <div>
            <p className="text-xs text-zinc-500">已决策</p>
            <p className="mt-2 text-2xl font-semibold">{summary.actCount}</p>
          </div>
          <div>
            <p className="text-xs text-zinc-500">已记录结果</p>
            <p className="mt-2 text-2xl font-semibold">{summary.recordedCount}</p>
          </div>
          <div>
            <p className="text-xs text-zinc-500">需升级反馈</p>
            <p className="mt-2 text-2xl font-semibold">{summary.escalateCount}</p>
          </div>
        </div>
      </section>
      <section className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
        <h3 className="font-medium">赢单业务信号</h3>
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
              const postWinCount =
                customers.postWinActivityCountByCustomer[customerId] ?? 0;
              return (
                <li key={customerId} className="flex justify-between gap-4">
                  <span className="truncate">
                    {displayCustomerName(customerId)} ·{" "}
                    {labelWonCustomerStatus(revenue, postWinCount)}
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

import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { analyzeOperations } from "@/lib/dashboard/analytics/operations.analytics";

export default function OperationsDashboardPage() {
  const ops = analyzeOperations();

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
    </div>
  );
}

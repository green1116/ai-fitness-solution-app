import { GET } from "@/app/api/operations/surface/route";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import type { OperationsSurface } from "@/lib/commercial/operations-surface";
import { analyzeOperations } from "@/lib/dashboard/analytics/operations.analytics";

export const dynamic = "force-dynamic";

export default async function OperationsDashboardPage() {
  const ops = analyzeOperations();
  const surfaceRes = await GET();
  const surface = (await surfaceRes.json()) as OperationsSurface;
  const { summary } = surface;

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
    </div>
  );
}

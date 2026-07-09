"use client";

import { useCallback, useEffect, useState } from "react";

type Kpis = {
  releasedCount: number;
  openedCount: number;
  downloadedCount: number;
  failedDeliveryCount: number;
  pendingActionCount: number;
};

type SlaSession = {
  sessionId: string;
  releasePackageId?: string;
  projectName?: string;
  overallStatus: string;
  releaseToFirstOpen: string;
  releaseToFirstDownload: string;
  firstOpenMs?: number;
  firstDownloadMs?: number;
};

type Alert = {
  id: string;
  sessionId: string;
  kind: string;
  severity: string;
  message: string;
  triggeredAt: string;
};

type TimelineEntry = {
  id: string;
  timestamp: string;
  type: string;
  label: string;
};

const SLA_COLORS: Record<string, string> = {
  healthy: "text-emerald-400 border-emerald-800/50",
  at_risk: "text-amber-400 border-amber-800/50",
  breached: "text-red-400 border-red-800/50",
};

const METRIC_COLORS: Record<string, string> = {
  met: "text-emerald-400",
  pending: "text-zinc-400",
  breached: "text-red-400",
};

function formatMs(ms?: number): string {
  if (ms === undefined) return "—";
  if (ms < 60000) return `${Math.round(ms / 1000)}s`;
  if (ms < 3600000) return `${Math.round(ms / 60000)}m`;
  return `${(ms / 3600000).toFixed(1)}h`;
}

export function DeliveryAnalyticsDashboard() {
  const [kpis, setKpis] = useState<Kpis | null>(null);
  const [slaSummary, setSlaSummary] = useState<{
    healthy: number;
    atRisk: number;
    breached: number;
  } | null>(null);
  const [sessions, setSessions] = useState<SlaSession[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [expanded, setExpanded] = useState("");
  const [timeline, setTimeline] = useState<TimelineEntry[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/pilot/v82/delivery-analytics");
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.message ?? data.code ?? "加载失败");
      const m = data.monitoring;
      setKpis(m.kpis);
      setSlaSummary(m.slaSummary);
      setSessions(m.sessions ?? []);
      setAlerts(m.alerts ?? []);
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "加载失败");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function loadTimeline(sessionId: string) {
    if (expanded === sessionId) {
      setExpanded("");
      setTimeline([]);
      return;
    }
    try {
      const res = await fetch(
        `/api/pilot/v82/delivery-analytics/${encodeURIComponent(sessionId)}`,
      );
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.message ?? "加载时间线失败");
      setExpanded(sessionId);
      setTimeline(data.timeline?.entries ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "加载时间线失败");
    }
  }

  if (loading) {
    return <p className="text-sm text-zinc-500">加载分析与 SLA 面板…</p>;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-zinc-500">只读监控 — 基于 V81 追踪事件聚合</p>
        <button
          type="button"
          onClick={() => void load()}
          className="text-xs text-zinc-400 underline hover:text-white"
        >
          刷新
        </button>
      </div>

      {kpis ? (
        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {[
            { label: "已发布", value: kpis.releasedCount, color: "text-violet-300" },
            { label: "已打开", value: kpis.openedCount, color: "text-sky-300" },
            { label: "已下载", value: kpis.downloadedCount, color: "text-emerald-300" },
            { label: "交付失败", value: kpis.failedDeliveryCount, color: "text-red-300" },
            { label: "待处理", value: kpis.pendingActionCount, color: "text-amber-300" },
          ].map((card) => (
            <div
              key={card.label}
              className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4"
            >
              <p className="text-xs text-zinc-500">{card.label}</p>
              <p className={`mt-1 text-2xl font-bold ${card.color}`}>{card.value}</p>
            </div>
          ))}
        </section>
      ) : null}

      {slaSummary ? (
        <section className="flex flex-wrap gap-3">
          {[
            { label: "健康", value: slaSummary.healthy, status: "healthy" },
            { label: "风险", value: slaSummary.atRisk, status: "at_risk" },
            { label: "违约", value: slaSummary.breached, status: "breached" },
          ].map((s) => (
            <span
              key={s.status}
              className={`rounded-full border px-4 py-2 text-sm font-medium ${SLA_COLORS[s.status]}`}
            >
              SLA {s.label}: {s.value}
            </span>
          ))}
        </section>
      ) : null}

      {alerts.length > 0 ? (
        <section className="space-y-2 rounded-2xl border border-red-900/40 bg-red-950/20 p-6">
          <h2 className="text-sm font-semibold text-red-200">告警 ({alerts.length})</h2>
          <ul className="space-y-2">
            {alerts.map((a) => (
              <li
                key={a.id}
                className="rounded-lg border border-red-900/30 bg-black/30 px-3 py-2 text-xs"
              >
                <span
                  className={
                    a.severity === "critical" ? "text-red-400" : "text-amber-400"
                  }
                >
                  [{a.kind}]
                </span>{" "}
                <span className="text-zinc-300">{a.message}</span>
                <span className="ml-2 text-zinc-600">
                  {new Date(a.triggeredAt).toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : (
        <p className="text-sm text-zinc-500">暂无活跃告警</p>
      )}

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-white">按会话 SLA</h2>
        {sessions.length === 0 ? (
          <p className="text-sm text-zinc-500">暂无已发布会话数据</p>
        ) : (
          <ul className="space-y-2">
            {sessions.map((s) => (
              <li
                key={s.sessionId}
                className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-medium text-zinc-200">
                      {s.projectName ?? s.sessionId.slice(0, 8)}
                    </p>
                    <p className="font-mono text-xs text-zinc-600">{s.releasePackageId}</p>
                  </div>
                  <span
                    className={`rounded-full border px-3 py-1 text-xs ${SLA_COLORS[s.overallStatus] ?? "text-zinc-400"}`}
                  >
                    {s.overallStatus}
                  </span>
                </div>
                <dl className="mt-2 grid gap-1 text-xs sm:grid-cols-2">
                  <div>
                    <dt className="text-zinc-600">release → open</dt>
                    <dd className={METRIC_COLORS[s.releaseToFirstOpen]}>
                      {s.releaseToFirstOpen} ({formatMs(s.firstOpenMs)})
                    </dd>
                  </div>
                  <div>
                    <dt className="text-zinc-600">release → download</dt>
                    <dd className={METRIC_COLORS[s.releaseToFirstDownload]}>
                      {s.releaseToFirstDownload} ({formatMs(s.firstDownloadMs)})
                    </dd>
                  </div>
                </dl>
                <button
                  type="button"
                  onClick={() => void loadTimeline(s.sessionId)}
                  className="mt-2 text-xs text-sky-400 underline"
                >
                  {expanded === s.sessionId ? "收起时间线" : "查看时间线"}
                </button>
                {expanded === s.sessionId && timeline.length > 0 ? (
                  <ol className="mt-3 space-y-1 border-t border-zinc-800 pt-3 text-xs">
                    {timeline.map((e) => (
                      <li key={e.id} className="flex gap-2 text-zinc-400">
                        <span className="text-zinc-600">
                          {new Date(e.timestamp).toLocaleString()}
                        </span>
                        <span className="text-zinc-300">{e.label}</span>
                      </li>
                    ))}
                  </ol>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>

      {error ? <p className="text-sm text-red-400">{error}</p> : null}
    </div>
  );
}

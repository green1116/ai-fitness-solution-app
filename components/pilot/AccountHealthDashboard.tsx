"use client";

import { useCallback, useEffect, useState } from "react";

type Scores = {
  accountHealthScore: number;
  engagementScore: number;
  riskScore: number;
  renewalLikelihood: number;
};

type Forecast = {
  category: string;
  renewalDate: string;
  daysUntilRenewal: number;
  outreachRecommended: boolean;
  reason: string;
};

type Account = {
  sessionId: string;
  projectName?: string;
  releasePackageId?: string;
  scores: Scores;
  forecast: Forecast;
  openRisks: string[];
  followUp: { status: string };
  lastEventLabel?: string;
};

type Summary = {
  total: number;
  healthy: number;
  atRisk: number;
  expiringSoon: number;
  likelyRenew: number;
  needsOutreach: number;
  avgHealthScore: number;
  avgRenewalLikelihood: number;
};

type TimelineEntry = { date: string; label: string; kind: string };

const CATEGORY_COLORS: Record<string, string> = {
  expiring_soon: "text-amber-400 border-amber-800/50 bg-amber-950/30",
  likely_renew: "text-emerald-400 border-emerald-800/50 bg-emerald-950/30",
  at_risk: "text-red-400 border-red-800/50 bg-red-950/30",
  needs_outreach: "text-sky-400 border-sky-800/50 bg-sky-950/30",
};

const CATEGORY_LABELS: Record<string, string> = {
  expiring_soon: "即将到期",
  likely_renew: "可能续约",
  at_risk: "流失风险",
  needs_outreach: "需外联",
};

function healthColor(score: number): string {
  if (score >= 65) return "text-emerald-400";
  if (score >= 40) return "text-amber-400";
  return "text-red-400";
}

export function AccountHealthDashboard() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [renewalList, setRenewalList] = useState<Account[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [selected, setSelected] = useState("");
  const [timeline, setTimeline] = useState<TimelineEntry[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/pilot/v85/account-health");
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.message ?? data.code ?? "加载失败");
      const d = data.dashboard;
      setAccounts(d.accounts ?? []);
      setRenewalList(d.renewalList ?? []);
      setSummary(d.summary ?? null);
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "加载失败");
    } finally {
      setLoading(false);
    }
  }, []);

  const drilldown = useCallback(async (sessionId: string) => {
    setSelected(sessionId);
    const res = await fetch(
      `/api/pilot/v85/account-health/${encodeURIComponent(sessionId)}`,
    );
    const data = await res.json();
    if (res.ok && data.ok) {
      setTimeline(data.detail?.forecastTimeline ?? []);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return <p className="text-sm text-zinc-500">加载账户健康面板…</p>;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-zinc-500">只读预测层 — 派生自 V84 跟进 + V83 智能 + V81 事件</p>
        <button
          type="button"
          onClick={() => void load()}
          className="text-xs text-zinc-400 underline hover:text-white"
        >
          刷新
        </button>
      </div>

      {summary ? (
        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
            <p className="text-xs text-zinc-500">平均健康分</p>
            <p className={`text-2xl font-bold ${healthColor(summary.avgHealthScore)}`}>
              {summary.avgHealthScore}
            </p>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
            <p className="text-xs text-zinc-500">平均续约可能性</p>
            <p className={`text-2xl font-bold ${healthColor(summary.avgRenewalLikelihood)}`}>
              {summary.avgRenewalLikelihood}%
            </p>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
            <p className="text-xs text-zinc-500">可能续约</p>
            <p className="text-2xl font-bold text-emerald-400">{summary.likelyRenew}</p>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
            <p className="text-xs text-zinc-500">流失风险</p>
            <p className="text-2xl font-bold text-red-400">{summary.atRisk}</p>
          </div>
        </section>
      ) : null}

      <section className="flex flex-wrap gap-2">
        {summary
          ? [
              { label: "即将到期", value: summary.expiringSoon, key: "expiring_soon" },
              { label: "需外联", value: summary.needsOutreach, key: "needs_outreach" },
              { label: "健康", value: summary.healthy, key: "healthy" },
            ].map((b) => (
              <span
                key={b.key}
                className={`rounded-full border px-3 py-1 text-xs ${CATEGORY_COLORS[b.key] ?? "border-zinc-700 text-zinc-400"}`}
              >
                {b.label}: {b.value}
              </span>
            ))
          : null}
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-white">续约列表</h2>
        {renewalList.length === 0 ? (
          <p className="text-sm text-zinc-500">暂无账户数据</p>
        ) : (
          <ul className="space-y-3">
            {renewalList.map((a) => (
              <li
                key={a.sessionId}
                className={`rounded-2xl border p-4 ${
                  selected === a.sessionId
                    ? "border-cyan-700 bg-cyan-950/20"
                    : "border-zinc-800 bg-zinc-950"
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-white">
                      {a.projectName ?? a.sessionId.slice(0, 8)}
                    </p>
                    <p className="mt-1 text-xs text-zinc-500">
                      健康 {a.scores.accountHealthScore} · 参与 {a.scores.engagementScore} · 续约{" "}
                      {a.scores.renewalLikelihood}%
                    </p>
                    <p className="mt-1 text-xs text-zinc-600">{a.forecast.reason}</p>
                  </div>
                  <span
                    className={`rounded-full border px-3 py-1 text-xs ${CATEGORY_COLORS[a.forecast.category] ?? ""}`}
                  >
                    {CATEGORY_LABELS[a.forecast.category] ?? a.forecast.category}
                  </span>
                </div>

                {a.openRisks.length > 0 ? (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {a.openRisks.map((r) => (
                      <span
                        key={r}
                        className="rounded bg-red-950/40 px-2 py-0.5 text-xs text-red-300"
                      >
                        {r}
                      </span>
                    ))}
                  </div>
                ) : null}

                <div className="mt-2 flex flex-wrap gap-3 text-xs text-zinc-500">
                  <span>续约 {a.forecast.daysUntilRenewal} 天后</span>
                  <span>跟进: {a.followUp.status}</span>
                  {a.forecast.outreachRecommended ? (
                    <span className="text-amber-400">建议外联</span>
                  ) : null}
                </div>

                <button
                  type="button"
                  onClick={() => void drilldown(a.sessionId)}
                  className="mt-2 text-xs text-cyan-400 underline"
                >
                  预测时间线
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {selected && timeline.length > 0 ? (
        <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
          <h2 className="text-sm font-semibold text-white">预测时间线</h2>
          <ol className="mt-3 space-y-2 text-xs">
            {timeline.map((t, i) => (
              <li key={`${t.date}-${i}`} className="flex gap-3 text-zinc-400">
                <span className="text-zinc-600">{new Date(t.date).toLocaleDateString()}</span>
                <span
                  className={
                    t.kind === "renewal"
                      ? "text-cyan-400"
                      : t.kind === "follow_up"
                        ? "text-teal-400"
                        : "text-zinc-300"
                  }
                >
                  {t.label}
                </span>
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      {error ? <p className="text-sm text-red-400">{error}</p> : null}
    </div>
  );
}

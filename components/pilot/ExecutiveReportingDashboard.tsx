"use client";

import { useCallback, useEffect, useState } from "react";

type Summary = {
  portfolio: {
    totalAccounts: number;
    enterprise: number;
    expansionReady: number;
    activeGovernance: number;
    avgHealthScore: number;
  };
  risk: {
    atRisk: number;
    rescue: number;
    blocked: number;
    totalChurnExposure: number;
    avgRiskScore: number;
  };
  value: {
    totalExpectedValue: number;
    totalExpansionPotential: number;
    topAccountValue: number;
  };
  decisions: {
    approved: number;
    deferred: number;
    blocked: number;
    pending: number;
    totalDecisions: number;
  };
};

type Metrics = {
  governanceQueueSize: number;
  decisionsRecorded: number;
  packetsGenerated: number;
  exportsCount: number;
  reviewedPackets: number;
};

type Packet = {
  id: string;
  title: string;
  generatedAt: string;
  status: string;
};

type DecisionEntry = {
  id: string;
  action: string;
  timestamp: string;
  note?: string;
  sessionId: string;
};

function formatCurrency(n: number) {
  return `¥${n.toLocaleString("zh-CN")}`;
}

const STATUS_STYLES: Record<string, string> = {
  draft: "bg-zinc-800 text-zinc-300",
  scheduled: "bg-violet-950 text-violet-300",
  reviewed: "bg-emerald-950 text-emerald-300",
  exported: "bg-sky-950 text-sky-300",
};

export function ExecutiveReportingDashboard() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [packets, setPackets] = useState<Packet[]>([]);
  const [decisions, setDecisions] = useState<DecisionEntry[]>([]);
  const [selectedPacket, setSelectedPacket] = useState("");
  const [error, setError] = useState("");
  const [acting, setActing] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/pilot/v93/executive-reporting");
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.message ?? data.code ?? "加载失败");
      const d = data.dashboard;
      setSummary(d.summary ?? null);
      setMetrics(d.metrics ?? null);
      setPackets(d.packets ?? []);
      setDecisions(d.recentDecisions ?? []);
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

  async function runAction(action: string, extra?: Record<string, string>) {
    setActing(true);
    setError("");
    try {
      const res = await fetch("/api/pilot/v93/executive-reporting/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...extra }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.message ?? data.code ?? "操作失败");
      if (data.packet?.id) setSelectedPacket(data.packet.id);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "操作失败");
    } finally {
      setActing(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-zinc-500">加载高管报告面板…</p>;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-zinc-500">高管报告 — 只读治理/组合层 + 报告缓存写入</p>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={acting}
            onClick={() => void runAction("generate_packet")}
            className="rounded-lg bg-cyan-700 px-3 py-1.5 text-xs text-white disabled:opacity-40"
          >
            生成材料包
          </button>
          <button
            type="button"
            onClick={() => void load()}
            className="text-xs text-zinc-400 underline hover:text-white"
          >
            刷新
          </button>
        </div>
      </div>

      {summary ? (
        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
            <p className="text-xs font-medium text-cyan-400">组合摘要</p>
            <p className="mt-2 text-xs text-zinc-500">
              账户 {summary.portfolio.totalAccounts} · 企业级 {summary.portfolio.enterprise}
            </p>
            <p className="text-xs text-zinc-500">
              扩展就绪 {summary.portfolio.expansionReady} · 治理中{" "}
              {summary.portfolio.activeGovernance}
            </p>
            <p className="mt-1 text-sm text-white">
              均健康分 {summary.portfolio.avgHealthScore}
            </p>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
            <p className="text-xs font-medium text-orange-400">风险摘要</p>
            <p className="mt-2 text-xs text-zinc-500">
              高风险 {summary.risk.atRisk} · 救援 {summary.risk.rescue} · 阻断{" "}
              {summary.risk.blocked}
            </p>
            <p className="mt-1 text-sm text-white">
              敞口 {formatCurrency(summary.risk.totalChurnExposure)}
            </p>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
            <p className="text-xs font-medium text-emerald-400">价值摘要</p>
            <p className="mt-2 text-xs text-zinc-500">
              预期总值 {formatCurrency(summary.value.totalExpectedValue)}
            </p>
            <p className="text-xs text-zinc-500">
              扩展潜力 {formatCurrency(summary.value.totalExpansionPotential)}
            </p>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
            <p className="text-xs font-medium text-violet-400">决策摘要</p>
            <p className="mt-2 text-xs text-zinc-500">
              批准 {summary.decisions.approved} · 延期 {summary.decisions.deferred} · 阻断{" "}
              {summary.decisions.blocked}
            </p>
            <p className="text-xs text-zinc-500">待决 {summary.decisions.pending}</p>
          </div>
        </section>
      ) : null}

      {metrics ? (
        <section className="grid gap-3 sm:grid-cols-5">
          {[
            { label: "治理队列", value: metrics.governanceQueueSize },
            { label: "决策记录", value: metrics.decisionsRecorded },
            { label: "材料包", value: metrics.packetsGenerated },
            { label: "已审阅", value: metrics.reviewedPackets },
            { label: "导出次数", value: metrics.exportsCount },
          ].map((c) => (
            <div key={c.label} className="rounded-xl border border-zinc-800 bg-zinc-950 p-3">
              <p className="text-xs text-zinc-500">{c.label}</p>
              <p className="text-xl font-bold text-cyan-300">{c.value}</p>
            </div>
          ))}
        </section>
      ) : null}

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-white">董事会材料包</h2>
        {packets.length === 0 ? (
          <p className="text-sm text-zinc-500">暂无材料包 — 点击「生成材料包」</p>
        ) : (
          <ul className="space-y-3">
            {packets.map((pkt) => (
              <li
                key={pkt.id}
                className={`rounded-2xl border p-4 ${
                  selectedPacket === pkt.id
                    ? "border-cyan-700 bg-cyan-950/20"
                    : "border-zinc-800 bg-zinc-950"
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-white">{pkt.title}</p>
                    <p className="mt-1 text-xs text-zinc-500">
                      {new Date(pkt.generatedAt).toLocaleString()} · {pkt.id.slice(0, 12)}
                    </p>
                  </div>
                  <span
                    className={`rounded px-2 py-0.5 text-xs ${STATUS_STYLES[pkt.status] ?? "bg-zinc-800"}`}
                  >
                    {pkt.status}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={acting}
                    onClick={() => {
                      setSelectedPacket(pkt.id);
                      void runAction("schedule_review", { packetId: pkt.id });
                    }}
                    className="rounded-lg border border-zinc-600 px-3 py-1.5 text-xs disabled:opacity-40"
                  >
                    排期评审
                  </button>
                  <button
                    type="button"
                    disabled={acting}
                    onClick={() => {
                      setSelectedPacket(pkt.id);
                      void runAction("mark_reviewed", { packetId: pkt.id });
                    }}
                    className="rounded-lg border border-emerald-800 px-3 py-1.5 text-xs text-emerald-300 disabled:opacity-40"
                  >
                    已审阅
                  </button>
                  <button
                    type="button"
                    disabled={acting}
                    onClick={() => {
                      setSelectedPacket(pkt.id);
                      void runAction("export_summary", { packetId: pkt.id });
                    }}
                    className="rounded-lg border border-sky-800 px-3 py-1.5 text-xs text-sky-300 disabled:opacity-40"
                  >
                    导出摘要
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {decisions.length > 0 ? (
        <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
          <h2 className="text-sm font-semibold text-white">决策时间线</h2>
          <ol className="mt-3 space-y-2 text-xs">
            {decisions.slice(0, 10).map((d) => (
              <li key={d.id} className="flex gap-3 text-zinc-400">
                <span className="text-zinc-600">{new Date(d.timestamp).toLocaleString()}</span>
                <span className="font-mono text-cyan-500">{d.action}</span>
                <span className="text-zinc-600">{d.sessionId.slice(0, 8)}</span>
                <span>{d.note}</span>
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      {error ? <p className="text-sm text-red-400">{error}</p> : null}
    </div>
  );
}

"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

type Dimension = {
  dimension: string;
  label: string;
  score: number;
  gateStatus: string;
  summary: string;
};

type Gate = {
  id: string;
  label: string;
  status: string;
  requirement: string;
  evidence: string;
};

type Risk = {
  id: string;
  label: string;
  severity: string;
  exposure: string;
};

type Summary = {
  overallReadiness: string;
  certificationStatus: string;
  gatesPassed: number;
  gatesTotal: number;
  dimensions: Dimension[];
};

type Pack = {
  id: string;
  title: string;
  generatedAt: string;
  overallReadiness: string;
};

type ActionEntry = {
  id: string;
  action: string;
  timestamp: string;
  note?: string;
};

const STATUS_STYLES: Record<string, string> = {
  pass: "bg-emerald-950 text-emerald-300",
  warning: "bg-amber-950 text-amber-300",
  blocked: "bg-red-950 text-red-300",
  waived: "bg-violet-950 text-violet-300",
  ready: "bg-emerald-950 text-emerald-300",
  conditional: "bg-amber-950 text-amber-300",
  not_ready: "bg-red-950 text-red-300",
  certified: "bg-sky-950 text-sky-300",
};

const OVERALL_LABELS: Record<string, string> = {
  ready: "就绪",
  conditional: "有条件就绪",
  not_ready: "未就绪",
  certified: "已认证",
};

export function ReadinessDashboard() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [gates, setGates] = useState<Gate[]>([]);
  const [risks, setRisks] = useState<Risk[]>([]);
  const [packages, setPackages] = useState<Pack[]>([]);
  const [actions, setActions] = useState<ActionEntry[]>([]);
  const [selectedGate, setSelectedGate] = useState("");
  const [error, setError] = useState("");
  const [acting, setActing] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/pilot/v99/production-readiness");
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.message ?? data.code ?? "加载失败");
      const d = data.dashboard;
      setSummary(d.summary ?? null);
      setGates(d.gates ?? []);
      setRisks(d.risks ?? []);
      setPackages(d.packages ?? []);
      setActions(d.recentActions ?? []);
      if (!selectedGate && d.gates?.[0]?.id) setSelectedGate(d.gates[0].id);
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "加载失败");
    } finally {
      setLoading(false);
    }
  }, [selectedGate]);

  useEffect(() => {
    void load();
  }, [load]);

  async function runAction(action: string, extra?: Record<string, string>) {
    setActing(true);
    setError("");
    try {
      const res = await fetch("/api/pilot/v99/production-readiness/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, gateId: selectedGate, ...extra }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.message ?? data.code ?? "操作失败");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "操作失败");
    } finally {
      setActing(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-zinc-500">加载就绪认证面板…</p>;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-zinc-500">生产认证 — 只读全链路层 + 认证缓存写入</p>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={acting}
            onClick={() => void runAction("generate_certification_package")}
            className="rounded-lg bg-cyan-700 px-3 py-1.5 text-xs text-white disabled:opacity-40"
          >
            生成认证包
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
        <section className="rounded-2xl border border-cyan-900/50 bg-cyan-950/10 p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-cyan-300">就绪摘要</h2>
              <p className="mt-2 text-lg font-bold text-white">
                {summary.certificationStatus}
              </p>
              <p className="mt-1 text-xs text-zinc-500">
                门控 {summary.gatesPassed}/{summary.gatesTotal} 通过
              </p>
            </div>
            <span
              className={`rounded px-3 py-1 text-sm ${STATUS_STYLES[summary.overallReadiness] ?? "bg-zinc-800"}`}
            >
              {OVERALL_LABELS[summary.overallReadiness] ?? summary.overallReadiness}
            </span>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {summary.dimensions.map((d) => (
              <div key={d.dimension} className="rounded-xl border border-zinc-800 bg-zinc-950 p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-medium text-white">{d.label}</p>
                  <span
                    className={`rounded px-1.5 py-0.5 text-xs ${STATUS_STYLES[d.gateStatus] ?? "bg-zinc-800"}`}
                  >
                    {d.gateStatus}
                  </span>
                </div>
                <p className="mt-1 text-xs text-zinc-500">{d.summary}</p>
                <p className="mt-1 text-sm text-cyan-300">{d.score}%</p>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-white">门控清单</h2>
        <ul className="space-y-2">
          {gates.map((gate) => (
            <li
              key={gate.id}
              className={`cursor-pointer rounded-xl border p-4 ${
                selectedGate === gate.id
                  ? "border-cyan-700 bg-cyan-950/20"
                  : "border-zinc-800 bg-zinc-950"
              }`}
              onClick={() => setSelectedGate(gate.id)}
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-medium text-white">{gate.label}</p>
                  <p className="mt-1 text-xs text-zinc-500">{gate.requirement}</p>
                  <p className="text-xs text-zinc-400">{gate.evidence}</p>
                </div>
                <span
                  className={`rounded px-2 py-0.5 text-xs ${STATUS_STYLES[gate.status] ?? "bg-zinc-800"}`}
                >
                  {gate.status}
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={acting}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedGate(gate.id);
                    void runAction("record_gate_review", { gateId: gate.id, status: "pass" });
                  }}
                  className="rounded border border-emerald-800 px-2 py-1 text-xs text-emerald-300 disabled:opacity-40"
                >
                  标记通过
                </button>
                <button
                  type="button"
                  disabled={acting}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedGate(gate.id);
                    void runAction("waive_gate", { gateId: gate.id });
                  }}
                  className="rounded border border-violet-800 px-2 py-1 text-xs text-violet-300 disabled:opacity-40"
                >
                  豁免
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {risks.length > 0 ? (
        <section className="rounded-2xl border border-orange-900/50 bg-orange-950/10 p-6">
          <h2 className="text-sm font-semibold text-orange-400">风险面板</h2>
          <ul className="mt-3 space-y-2">
            {risks.map((r) => (
              <li key={r.id} className="text-sm text-zinc-300">
                <span className="text-orange-300">{r.severity}</span> — {r.label}: {r.exposure}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={acting}
          onClick={() => void runAction("certify_ready")}
          className="rounded-lg bg-sky-700 px-4 py-2 text-sm text-white disabled:opacity-40"
        >
          生产认证
        </button>
        <Link
          href="/pilot/policy-enforcement"
          className="rounded-lg border border-zinc-600 px-4 py-2 text-sm text-zinc-300"
        >
          下钻策略执行
        </Link>
      </section>

      {packages.length > 0 ? (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-white">认证包</h2>
          <ul className="space-y-2">
            {packages.map((p) => (
              <li key={p.id} className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
                <p className="font-medium text-white">{p.title}</p>
                <p className="mt-1 text-xs text-zinc-500">
                  {new Date(p.generatedAt).toLocaleString()} · {p.overallReadiness}
                </p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {actions.length > 0 ? (
        <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
          <h2 className="text-sm font-semibold text-white">门控历史</h2>
          <ol className="mt-3 space-y-2 text-xs">
            {actions.slice(0, 12).map((a) => (
              <li key={a.id} className="flex flex-wrap gap-3 text-zinc-400">
                <span className="text-zinc-600">{new Date(a.timestamp).toLocaleString()}</span>
                <span className="font-mono text-cyan-500">{a.action}</span>
                <span>{a.note}</span>
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      {error ? <p className="text-sm text-red-400">{error}</p> : null}
    </div>
  );
}

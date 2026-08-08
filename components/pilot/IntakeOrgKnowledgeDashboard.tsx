"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

type GovernanceEntry = {
  patternId: string;
  entryVersion: number;
  status: string;
  authority: string;
  trustScore: number;
  trustBand: string;
  freshness: string;
  overrideSuggestion?: string;
  deprecationReason?: string;
  lineage: Array<{ action: string; at: string; note?: string }>;
};

type Pattern = {
  id: string;
  kind: string;
  title: string;
  example: string;
  frequency: number;
  suggestion: string;
  tags: string[];
  sourceSessionIds: string[];
  lastSeenAt: string;
  governance?: GovernanceEntry | null;
};

type Library = {
  version: string;
  organizationId: string;
  builtAt: string;
  contentHash: string;
  sourceSessionCount: number;
  patterns: Pattern[];
  summary: {
    requirementPatterns: number;
    clarificationPatterns: number;
    compliancePatterns: number;
    equipmentPatterns: number;
    standardPatterns: number;
  };
};

type GovernanceState = {
  libraryRevision: number;
  libraryFreshness: string;
  libraryContentHash: string;
  audit: Array<{ id: string; action: string; message: string; at: string }>;
};

const KIND_LABEL: Record<string, string> = {
  requirement: "需求",
  clarification: "澄清",
  compliance: "合规",
  equipment: "设备",
  standard: "标准",
};

const FRESH_LABEL: Record<string, string> = {
  fresh: "新鲜",
  aging: "老化",
  stale: "过期",
  unknown: "未知",
};

export function IntakeOrgKnowledgeDashboard() {
  const [library, setLibrary] = useState<Library | null>(null);
  const [patterns, setPatterns] = useState<Pattern[]>([]);
  const [governance, setGovernance] = useState<GovernanceState | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [kindFilter, setKindFilter] = useState<string>("all");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [libRes, govRes] = await Promise.all([
        fetch("/api/pilot/v80/intake/knowledge"),
        fetch("/api/pilot/v80/intake/knowledge/governance"),
      ]);
      const libData = await libRes.json();
      const govData = await govRes.json();
      if (!libRes.ok || !libData.ok) throw new Error(libData.code || "LOAD_FAILED");
      setLibrary(libData.library);
      setGovernance(govData.governance ?? libData.governance ?? null);
      setPatterns(govData.patterns?.length ? govData.patterns : libData.library?.patterns ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "LOAD_FAILED");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function rebuild() {
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/pilot/v80/intake/knowledge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "rebuild" }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.code || "REBUILD_FAILED");
      setLibrary(data.library);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "REBUILD_FAILED");
    } finally {
      setBusy(false);
    }
  }

  async function govern(action: string, patternId: string) {
    setBusy(true);
    setError("");
    try {
      const body: Record<string, unknown> = { action, patternId };
      if (action === "deprecate") {
        body.reason = "仪表盘人工弃用";
      }
      if (action === "override") {
        body.suggestion = "【组织标准】请按已晋升规格执行，并复核数量/功率。";
        body.notes = "仪表盘覆盖";
      }
      const res = await fetch("/api/pilot/v80/intake/knowledge/governance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.code || "GOV_FAILED");
      setGovernance(data.governance);
      setPatterns(data.patterns ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "GOV_FAILED");
    } finally {
      setBusy(false);
    }
  }

  const filtered =
    patterns.filter((p) => kindFilter === "all" || p.kind === kindFilter) ?? [];

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-zinc-500">Pilot P12 / P13</p>
          <h1 className="mt-1 text-2xl font-semibold text-zinc-100">组织知识学习与治理</h1>
          <p className="mt-2 max-w-2xl text-sm text-zinc-400">
            从已完成 Intake 学习可复用模式，并通过版本、新鲜度、权威等级与晋升/弃用保持可信可用。
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/api/pilot/v80/intake/knowledge?download=1"
            className="rounded-lg border border-zinc-700 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-900"
          >
            导出 JSON
          </Link>
          <button
            type="button"
            disabled={busy}
            onClick={() => void rebuild()}
            className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-black disabled:opacity-50"
          >
            {busy ? "处理中…" : "重建知识库"}
          </button>
        </div>
      </header>

      {error ? <p className="text-sm text-rose-400">{error}</p> : null}
      {loading ? <p className="text-sm text-zinc-500">加载中…</p> : null}

      {library ? (
        <>
          <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Stat label="来源会话" value={String(library.sourceSessionCount)} />
            <Stat label="模式总数" value={String(library.patterns.length)} />
            <Stat
              label="治理修订"
              value={governance ? `r${governance.libraryRevision}` : "—"}
            />
            <Stat
              label="库新鲜度"
              value={
                governance
                  ? FRESH_LABEL[governance.libraryFreshness] ?? governance.libraryFreshness
                  : "—"
              }
            />
            <Stat
              label="内容哈希"
              value={`${library.contentHash.slice(0, 12)}…`}
              mono
            />
            <Stat
              label="构建时间"
              value={new Date(library.builtAt).toLocaleString("zh-CN")}
            />
          </section>

          <div className="flex flex-wrap gap-2">
            {["all", "requirement", "clarification", "compliance", "equipment", "standard"].map(
              (k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setKindFilter(k)}
                  className={`rounded-lg px-3 py-1.5 text-xs ${
                    kindFilter === k
                      ? "bg-zinc-100 text-zinc-900"
                      : "border border-zinc-700 text-zinc-400 hover:bg-zinc-900"
                  }`}
                >
                  {k === "all" ? "全部" : KIND_LABEL[k] ?? k}
                </button>
              ),
            )}
          </div>

          <section className="overflow-x-auto rounded-xl border border-zinc-800">
            <table className="w-full min-w-[880px] text-left text-sm">
              <thead className="border-b border-zinc-800 text-xs text-zinc-500">
                <tr>
                  <th className="px-3 py-2 font-medium">类型</th>
                  <th className="px-3 py-2 font-medium">标题</th>
                  <th className="px-3 py-2 font-medium">治理</th>
                  <th className="px-3 py-2 font-medium">信任</th>
                  <th className="px-3 py-2 font-medium">操作</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-3 py-6 text-center text-zinc-500">
                      暂无模式。完成更多 Intake 后点击「重建知识库」。
                    </td>
                  </tr>
                ) : (
                  filtered.map((p) => {
                    const g = p.governance;
                    return (
                      <tr key={p.id} className="border-b border-zinc-900/80 align-top">
                        <td className="px-3 py-2 text-zinc-400">
                          {KIND_LABEL[p.kind] ?? p.kind}
                        </td>
                        <td className="px-3 py-2">
                          <div className="font-medium text-zinc-200">{p.title}</div>
                          <div className="mt-0.5 text-xs text-zinc-500 line-clamp-2">
                            {g?.overrideSuggestion || p.suggestion}
                          </div>
                          <div className="mt-1 text-[10px] text-zinc-600">
                            频次 {p.frequency}
                          </div>
                        </td>
                        <td className="px-3 py-2 text-xs text-zinc-400">
                          <div>{g?.authority ?? "learned"}</div>
                          <div>{g?.status ?? "active"}</div>
                          <div>{FRESH_LABEL[g?.freshness ?? ""] ?? g?.freshness ?? "—"}</div>
                        </td>
                        <td className="px-3 py-2">
                          <TrustChip
                            band={g?.trustBand ?? "medium"}
                            score={g?.trustScore ?? 0}
                          />
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex flex-wrap gap-1">
                            <GovBtn
                              disabled={busy || g?.status === "archived"}
                              onClick={() => void govern("promote", p.id)}
                              label="晋升"
                            />
                            <GovBtn
                              disabled={busy}
                              onClick={() => void govern("deprecate", p.id)}
                              label="弃用"
                            />
                            <GovBtn
                              disabled={busy}
                              onClick={() => void govern("archive", p.id)}
                              label="归档"
                            />
                            <GovBtn
                              disabled={busy}
                              onClick={() => void govern("restore", p.id)}
                              label="恢复"
                            />
                            <GovBtn
                              disabled={busy || g?.status === "archived"}
                              onClick={() => void govern("override", p.id)}
                              label="覆盖"
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </section>

          {governance?.audit?.length ? (
            <section className="rounded-xl border border-zinc-800 p-4">
              <h2 className="text-sm font-semibold text-zinc-200">治理审计（最近）</h2>
              <ul className="mt-2 space-y-1 text-xs text-zinc-500">
                {governance.audit.slice(0, 8).map((a) => (
                  <li key={a.id}>
                    <span className="text-zinc-400">{a.action}</span> · {a.message} ·{" "}
                    {new Date(a.at).toLocaleString("zh-CN")}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </>
      ) : null}
    </div>
  );
}

function TrustChip({ band, score }: { band: string; score: number }) {
  const color =
    band === "high"
      ? "border-emerald-800 text-emerald-300"
      : band === "medium"
        ? "border-amber-800 text-amber-200"
        : band === "fallback"
          ? "border-sky-800 text-sky-300"
          : "border-rose-900 text-rose-300";
  return (
    <span className={`rounded border px-1.5 py-0.5 text-[10px] tabular-nums ${color}`}>
      {band} {(score * 100).toFixed(0)}%
    </span>
  );
}

function GovBtn({
  label,
  onClick,
  disabled,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="rounded border border-zinc-700 px-1.5 py-0.5 text-[10px] text-zinc-300 disabled:opacity-40"
    >
      {label}
    </button>
  );
}

function Stat({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 px-4 py-3">
      <div className="text-xs text-zinc-500">{label}</div>
      <div className={`mt-1 text-lg text-zinc-100 ${mono ? "font-mono text-sm" : ""}`}>
        {value}
      </div>
    </div>
  );
}

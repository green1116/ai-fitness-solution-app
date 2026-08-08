"use client";

import { useCallback, useEffect, useState } from "react";

import type { TenderRequirements } from "@/lib/pilot/v80";

type RankedRec = {
  id: string;
  patternId: string;
  category: string;
  kind: string;
  title: string;
  primary: string;
  alternatives: string[];
  bestPractice?: string;
  reason: string;
  relatedFieldPath?: string;
  similarity: number;
  trustScore: number;
  rankScore: number;
  confidence: number;
  status: "open" | "accepted" | "dismissed";
  trust?: {
    band: string;
    score: number;
    authority: string;
    freshness: string;
    status: string;
    labels: string[];
    fallback?: boolean;
  };
};

type Pack = {
  generatedAt: string;
  contentHash: string;
  governanceRevision?: number;
  ranking: { strategy: string };
  items: RankedRec[];
  summary: {
    total: number;
    open: number;
    accepted: number;
    dismissed: number;
  };
};

type Effectiveness = {
  totals: { shown: number; accepted: number; dismissed: number; acceptRate: number };
};

type Props = {
  sessionId: string;
  requirements: TenderRequirements;
  readOnly?: boolean;
  onRequirementsChange?: (
    req: TenderRequirements,
    meta?: { revision?: number },
  ) => void;
};

const CATEGORY_LABEL: Record<string, string> = {
  requirement_template: "需求模板",
  clarification: "澄清建议",
  compliance: "合规",
  equipment_spec: "设备规格",
  best_practice: "最佳实践",
  alternative: "备选",
};

function trustClass(band?: string): string {
  if (band === "high") return "border-emerald-800 text-emerald-300";
  if (band === "medium") return "border-amber-800 text-amber-200";
  if (band === "fallback") return "border-sky-800 text-sky-300";
  return "border-rose-900 text-rose-300";
}

export function IntakeOrgKnowledgePanel({
  sessionId,
  requirements,
  readOnly = false,
  onRequirementsChange,
}: Props) {
  const [pack, setPack] = useState<Pack | null>(null);
  const [effectiveness, setEffectiveness] = useState<Effectiveness | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(
    async (refresh = false) => {
      setBusy(true);
      setError("");
      try {
        const url = refresh
          ? `/api/pilot/v80/intake/${encodeURIComponent(sessionId)}/recommendations?refresh=1`
          : `/api/pilot/v80/intake/${encodeURIComponent(sessionId)}/recommendations`;
        const res = refresh
          ? await fetch(
              `/api/pilot/v80/intake/${encodeURIComponent(sessionId)}/recommendations`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "generate", requirements }),
              },
            )
          : await fetch(url);
        const data = await res.json();
        if (!res.ok || !data.ok) throw new Error(data.code || "LOAD_FAILED");
        setPack(data.pack);
        setEffectiveness(data.effectiveness ?? null);
      } catch (e) {
        setError(e instanceof Error ? e.message : "LOAD_FAILED");
      } finally {
        setBusy(false);
      }
    },
    [sessionId, requirements],
  );

  useEffect(() => {
    void load(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  async function feedback(action: "accept" | "dismiss", recommendationId: string) {
    setBusy(true);
    setError("");
    try {
      const res = await fetch(
        `/api/pilot/v80/intake/${encodeURIComponent(sessionId)}/recommendations`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action,
            recommendationId,
            apply: action === "accept",
            reason: action === "dismiss" ? "reviewer_dismissed" : undefined,
          }),
        },
      );
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.code || "FEEDBACK_FAILED");
      setPack(data.pack);
      setEffectiveness(data.effectiveness ?? null);
      if (data.requirements && onRequirementsChange) {
        onRequirementsChange(data.requirements);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "FEEDBACK_FAILED");
    } finally {
      setBusy(false);
    }
  }

  const openItems = pack?.items.filter((i) => i.status === "open") ?? [];
  const closedItems = pack?.items.filter((i) => i.status !== "open") ?? [];

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950/30 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-zinc-100">组织知识推荐引擎</h3>
          <p className="mt-0.5 text-xs text-zinc-500">
            基于治理知识的确定性排序 · 模板 / 澄清 / 合规 / 设备规格
            {pack ? ` · ${pack.ranking.strategy}` : ""}
            {pack?.governanceRevision != null ? ` · r${pack.governanceRevision}` : ""}
            {effectiveness
              ? ` · 接受率 ${(effectiveness.totals.acceptRate * 100).toFixed(0)}%`
              : ""}
          </p>
        </div>
        {!readOnly ? (
          <button
            type="button"
            disabled={busy}
            onClick={() => void load(true)}
            className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs text-zinc-300 disabled:opacity-50"
          >
            {busy ? "处理中…" : "重新生成"}
          </button>
        ) : null}
      </div>

      {error ? <p className="mt-2 text-xs text-rose-400">{error}</p> : null}

      {pack ? (
        <p className="mt-2 text-[10px] text-zinc-600">
          开放 {pack.summary.open} · 已接受 {pack.summary.accepted} · 已驳回{" "}
          {pack.summary.dismissed}
        </p>
      ) : null}

      {openItems.length === 0 && !busy ? (
        <p className="mt-3 text-xs text-zinc-500">
          暂无开放推荐。完成历史 Intake 后重建知识库，或点击重新生成。
        </p>
      ) : (
        <ul className="mt-3 space-y-2">
          {openItems.map((r) => (
            <li
              key={r.id}
              className="rounded-lg border border-zinc-800/80 px-3 py-2 text-xs text-zinc-300"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded border border-zinc-700 px-1.5 py-0.5 text-[10px] text-zinc-400">
                  {CATEGORY_LABEL[r.category] ?? r.category}
                </span>
                <span
                  className={`rounded border px-1.5 py-0.5 text-[10px] ${trustClass(r.trust?.band)}`}
                >
                  信任 {typeof r.trustScore === "number" ? `${(r.trustScore * 100).toFixed(0)}%` : "—"}
                </span>
                <span className="tabular-nums text-zinc-500">
                  相似 {(r.similarity * 100).toFixed(0)}% · 排名{" "}
                  {(r.rankScore * 100).toFixed(0)}
                </span>
                <span className="font-medium text-zinc-200">{r.title}</span>
              </div>
              <p className="mt-1 text-zinc-500">{r.reason}</p>
              <p className="mt-0.5 text-emerald-400/90">{r.primary}</p>
              {r.bestPractice ? (
                <p className="mt-0.5 text-sky-300/90">{r.bestPractice}</p>
              ) : null}
              {r.alternatives.length > 0 ? (
                <p className="mt-0.5 text-zinc-500">
                  备选：{r.alternatives.join(" · ")}
                </p>
              ) : null}
              {r.relatedFieldPath ? (
                <p className="mt-0.5 font-mono text-[10px] text-zinc-600">{r.relatedFieldPath}</p>
              ) : null}
              {!readOnly ? (
                <div className="mt-2 flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void feedback("accept", r.id)}
                    className="rounded border border-emerald-800 px-2 py-1 text-[10px] text-emerald-300 disabled:opacity-40"
                  >
                    接受并应用
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void feedback("dismiss", r.id)}
                    className="rounded border border-zinc-700 px-2 py-1 text-[10px] text-zinc-400 disabled:opacity-40"
                  >
                    驳回
                  </button>
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      )}

      {closedItems.length > 0 ? (
        <details className="mt-3">
          <summary className="cursor-pointer text-[10px] text-zinc-500">
            已处理 {closedItems.length} 条
          </summary>
          <ul className="mt-2 space-y-1 text-[10px] text-zinc-600">
            {closedItems.map((r) => (
              <li key={r.id}>
                [{r.status}] {r.title}
              </li>
            ))}
          </ul>
        </details>
      ) : null}
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";

import type {
  TenderResponseBlock,
  TenderResponsePackage,
} from "@/lib/tender/response/types";
import { summarizeResponsePackage } from "@/lib/tender/response/types";

export type TenderComposePayload = {
  responses: TenderResponsePackage;
  sourceName?: string | null;
};

type Props = {
  loading?: boolean;
  error?: string | null;
  data: TenderComposePayload | null;
  onRun?: () => void;
  canRun?: boolean;
};

const TYPE_TABS = [
  { key: "technical" as const, label: "技术" },
  { key: "commercial" as const, label: "商务" },
  { key: "scoring" as const, label: "评分" },
  { key: "risk" as const, label: "风险" },
  { key: "attachment" as const, label: "附件" },
];

const CONF_LABEL = {
  high: "高",
  medium: "中",
  low: "低",
} as const;

function blocksForTab(
  pkg: TenderResponsePackage,
  tab: (typeof TYPE_TABS)[number]["key"],
): TenderResponseBlock[] {
  switch (tab) {
    case "technical":
      return pkg.technicalBlocks;
    case "commercial":
      return pkg.commercialBlocks;
    case "scoring":
      return pkg.scoringBlocks;
    case "risk":
      return pkg.riskBlocks;
    case "attachment":
      return pkg.attachmentBlocks;
    default:
      return [];
  }
}

export default function TenderResponsePanel({
  loading,
  error,
  data,
  onRun,
  canRun,
}: Props) {
  const [activeTab, setActiveTab] =
    useState<(typeof TYPE_TABS)[number]["key"]>("technical");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const summary = useMemo(
    () => (data ? summarizeResponsePackage(data.responses) : null),
    [data],
  );

  const tabBlocks = useMemo(
    () => (data ? blocksForTab(data.responses, activeTab) : []),
    [data, activeTab],
  );

  const selected = useMemo(
    () => tabBlocks.find((b) => b.id === selectedId) ?? tabBlocks[0] ?? null,
    [tabBlocks, selectedId],
  );

  return (
    <div
      className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] p-4"
      data-testid="tender-response-panel"
    >
      <div>
        <div className="text-sm font-medium text-white">
          Tender Response Composer
        </div>
        <div className="mt-0.5 text-xs text-white/50">
          响应生成验证 · 招标语义图 → 可投标正文块
        </div>
      </div>

      {onRun ? (
        <button
          type="button"
          disabled={!canRun || loading}
          onClick={onRun}
          className="mt-3 rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-sm disabled:opacity-40"
        >
          {loading ? "生成响应内容…" : "运行 Response Composer"}
        </button>
      ) : null}

      {error ? <p className="mt-3 text-sm text-red-300/90">{error}</p> : null}

      {!data && !loading && !error ? (
        <p className="mt-3 text-sm text-white/50">
          先载入招标文本，再生成技术/商务/评分/风险/附件响应块。
        </p>
      ) : null}

      {data && summary ? (
        <>
          {data.sourceName ? (
            <p className="mt-3 text-xs text-white/45">来源：{data.sourceName}</p>
          ) : null}

          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            <CountChip label="技术" n={summary.technical} />
            <CountChip label="商务" n={summary.commercial} />
            <CountChip label="评分" n={summary.scoring} />
            <CountChip label="风险" n={summary.risk} />
            <CountChip label="附件" n={summary.attachment} />
            <span className="text-white/40">共 {summary.total} 块</span>
          </div>

          <div className="mt-3 flex flex-wrap gap-1">
            {TYPE_TABS.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => {
                  setActiveTab(t.key);
                  setSelectedId(null);
                }}
                className={`rounded-lg px-3 py-1 text-xs ${
                  activeTab === t.key
                    ? "bg-white/15 text-white"
                    : "border border-white/10 text-white/55"
                }`}
              >
                {t.label} ({blocksForTab(data.responses, t.key).length})
              </button>
            ))}
          </div>

          <div className="mt-3 grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
            <ul className="max-h-56 space-y-1 overflow-y-auto rounded-lg border border-white/8 p-2 text-xs">
              {tabBlocks.length === 0 ? (
                <li className="text-white/45">该类别暂无响应块</li>
              ) : (
                tabBlocks.map((b) => (
                  <li key={b.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(b.id)}
                      className={`w-full rounded px-2 py-1.5 text-left ${
                        selected?.id === b.id
                          ? "bg-white/12 text-white"
                          : "text-white/65 hover:bg-white/5"
                      }`}
                    >
                      {b.title}
                    </button>
                  </li>
                ))
              )}
            </ul>

            {selected ? (
              <article className="rounded-lg border border-white/8 bg-black/20 p-3 text-xs">
                <div className="flex flex-wrap gap-2">
                  <span className="font-medium text-white/90">{selected.title}</span>
                  <span className="text-white/45">
                    置信 {CONF_LABEL[selected.confidence]}
                  </span>
                  {selected.sectionRef ? (
                    <span className="text-white/40">{selected.sectionRef}</span>
                  ) : null}
                </div>
                <p className="mt-2 whitespace-pre-wrap leading-relaxed text-white/75">
                  {selected.content}
                </p>
                {selected.evidenceRefs?.length ? (
                  <p className="mt-2 text-white/45">
                    证据：{selected.evidenceRefs.join("、")}
                  </p>
                ) : null}
                <p className="mt-2 text-white/35">
                  追溯：
                  {selected.relatedRequirementIds?.length
                    ? ` req ${selected.relatedRequirementIds.join(",")}`
                    : ""}
                  {selected.relatedScoringItemIds?.length
                    ? ` score ${selected.relatedScoringItemIds.join(",")}`
                    : ""}
                  {selected.relatedRiskIds?.length
                    ? ` risk ${selected.relatedRiskIds.join(",")}`
                    : ""}
                </p>
              </article>
            ) : (
              <p className="text-xs text-white/45">选择左侧条目查看正文</p>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}

function CountChip({ label, n }: { label: string; n: number }) {
  return (
    <span className="rounded-full border border-white/10 px-3 py-1 text-white/75">
      {label} {n}
    </span>
  );
}

"use client";

import type {
  TenderParseMetadata,
  TenderRequirement,
  TenderRequirementCounts,
} from "@/lib/tender/types";

export type TenderAnalyzePayload = {
  metadata: TenderParseMetadata;
  requirements: TenderRequirement[];
  counts: TenderRequirementCounts;
  sourceName?: string | null;
  rawTextLength?: number;
};

type Props = {
  loading?: boolean;
  error?: string | null;
  data: TenderAnalyzePayload | null;
  onAnalyze?: () => void;
  canAnalyze?: boolean;
};

const CATEGORY_LABEL: Record<TenderRequirement["category"], string> = {
  technical: "技术",
  commercial: "商务",
  qualification: "资质",
  scoring: "评分",
  attachment: "附件",
};

const IMPORTANCE_LABEL: Record<TenderRequirement["importance"], string> = {
  mandatory: "强制",
  preferred: "优选",
  scored: "计分",
};

export default function TenderAnalysisPanel({
  loading,
  error,
  data,
  onAnalyze,
  canAnalyze,
}: Props) {
  return (
    <div
      className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] p-4"
      data-testid="tender-analysis-panel"
    >
      <div>
        <div className="text-sm font-medium text-white">Tender Intelligence</div>
        <div className="mt-0.5 text-xs text-white/50">
          招标文件理解 · 验证面板（V2）
        </div>
      </div>

      {onAnalyze ? (
        <button
          type="button"
          disabled={!canAnalyze || loading}
          onClick={onAnalyze}
          className="mt-3 rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-sm disabled:opacity-40"
        >
          {loading ? "分析中…" : "运行 Intelligence 分析"}
        </button>
      ) : null}

      {error ? <p className="mt-3 text-sm text-red-300/90">{error}</p> : null}

      {!data && !loading && !error ? (
        <p className="mt-3 text-sm text-white/50">
          上传 PDF 招标文件后点击分析，查看结构化 requirements。
        </p>
      ) : null}

      {data ? (
        <>
          <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
            <MetaItem label="项目名称" value={data.metadata.projectName} />
            <MetaItem label="招标单位" value={data.metadata.tenderCompany} />
            <MetaItem label="项目编号" value={data.metadata.projectCode} />
            <MetaItem label="截止时间" value={data.metadata.deadline} />
            <MetaItem label="来源文件" value={data.sourceName || "—"} />
            <MetaItem
              label="解析规模"
              value={`${data.counts.total} 条要求 · ${data.rawTextLength ?? 0} 字`}
            />
          </dl>

          <CountsRow counts={data.counts} />

          <div className="mt-4 max-h-[320px] overflow-y-auto rounded-lg border border-white/8">
            <table className="w-full text-left text-xs">
              <thead className="sticky top-0 bg-[#1a1f2e] text-white/60">
                <tr>
                  <th className="px-3 py-2 font-medium">类别</th>
                  <th className="px-3 py-2 font-medium">重要度</th>
                  <th className="px-3 py-2 font-medium">条款</th>
                  <th className="px-3 py-2 font-medium">页</th>
                </tr>
              </thead>
              <tbody>
                {data.requirements.slice(0, 80).map((r) => (
                  <tr key={r.id} className="border-t border-white/5 text-white/80">
                    <td className="whitespace-nowrap px-3 py-2">
                      {CATEGORY_LABEL[r.category]}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2">
                      {IMPORTANCE_LABEL[r.importance]}
                    </td>
                    <td className="px-3 py-2">{r.requirement}</td>
                    <td className="whitespace-nowrap px-3 py-2 text-white/45">
                      {r.sourcePage ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {data.requirements.length > 80 ? (
              <p className="border-t border-white/5 px-3 py-2 text-xs text-white/45">
                仅展示前 80 条，共 {data.requirements.length} 条
              </p>
            ) : null}
          </div>
        </>
      ) : null}
    </div>
  );
}

function MetaItem({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <dt className="text-white/45">{label}</dt>
      <dd className="text-white/85">{value?.trim() || "—"}</dd>
    </div>
  );
}

function CountsRow({ counts }: { counts: TenderRequirementCounts }) {
  const items = [
    ["技术", counts.technical],
    ["商务", counts.commercial],
    ["资质", counts.qualification],
    ["评分", counts.scoring],
    ["附件", counts.attachment],
  ] as const;
  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {items.map(([label, n]) => (
        <span
          key={label}
          className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/70"
        >
          {label} {n}
        </span>
      ))}
    </div>
  );
}

"use client";

import type { SemanticOverview, TenderSemanticGraph } from "@/lib/tender/semantic/types";

export type TenderSemanticPayload = {
  graph: TenderSemanticGraph;
  overview: SemanticOverview;
  sourceName?: string | null;
};

type Props = {
  loading?: boolean;
  error?: string | null;
  data: TenderSemanticPayload | null;
  onRun?: () => void;
  canRun?: boolean;
};

const ROLE_LABEL: Record<string, string> = {
  overview: "概述",
  requirement: "需求",
  planning: "规划",
  configuration: "配置",
  implementation: "实施",
  response: "响应",
  scoring: "评分",
  risk: "风险",
  appendix: "附件",
};

const STATUS_LABEL = {
  covered: "已覆盖",
  partial: "部分",
  missing: "缺失",
} as const;

export default function TenderSemanticPanel({
  loading,
  error,
  data,
  onRun,
  canRun,
}: Props) {
  return (
    <div
      className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] p-4"
      data-testid="tender-semantic-panel"
    >
      <div>
        <div className="text-sm font-medium text-white">
          Tender Semantic Analysis
        </div>
        <div className="mt-0.5 text-xs text-white/50">
          语义图 · sections / requirements / scoring / risks / compliance
        </div>
      </div>

      {onRun ? (
        <button
          type="button"
          disabled={!canRun || loading}
          onClick={onRun}
          className="mt-3 rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-sm disabled:opacity-40"
        >
          {loading ? "构建语义图…" : "运行 Semantic 分析"}
        </button>
      ) : null}

      {error ? <p className="mt-3 text-sm text-red-300/90">{error}</p> : null}

      {!data && !loading && !error ? (
        <p className="mt-3 text-sm text-white/50">
          先载入招标文本，再运行语义分析以查看覆盖度与风险摘要。
        </p>
      ) : null}

      {data ? (
        <>
          <OverviewGrid overview={data.overview} sourceName={data.sourceName} />

          <ComplianceBar overview={data.overview} />

          <RiskSummary overview={data.overview} />

          <SectionList sections={data.graph.sections.slice(0, 12)} />

          <RequirementTable
            requirements={data.graph.requirements.slice(0, 40)}
            compliance={data.graph.compliance}
          />
        </>
      ) : null}
    </div>
  );
}

function OverviewGrid({
  overview,
  sourceName,
}: {
  overview: SemanticOverview;
  sourceName?: string | null;
}) {
  const items = [
    ["章节", overview.sectionCount],
    ["要求", overview.requirementCount],
    ["评分项", overview.scoringCount],
    ["风险", overview.riskCount],
  ] as const;
  return (
    <div className="mt-4">
      {sourceName ? (
        <p className="mb-2 text-xs text-white/45">来源：{sourceName}</p>
      ) : null}
      <div className="flex flex-wrap gap-2">
        {items.map(([label, n]) => (
          <span
            key={label}
            className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/75"
          >
            {label} {n}
          </span>
        ))}
      </div>
    </div>
  );
}

function ComplianceBar({ overview }: { overview: SemanticOverview }) {
  const total =
    overview.complianceCovered +
    overview.compliancePartial +
    overview.complianceMissing || 1;
  return (
    <div className="mt-4 rounded-lg border border-white/8 p-3 text-xs text-white/70">
      <div className="font-medium text-white/85">Requirement Coverage</div>
      <div className="mt-2 flex h-2 overflow-hidden rounded-full bg-white/10">
        <div
          className="bg-emerald-500/70"
          style={{ width: `${(overview.complianceCovered / total) * 100}%` }}
        />
        <div
          className="bg-amber-500/60"
          style={{ width: `${(overview.compliancePartial / total) * 100}%` }}
        />
        <div
          className="bg-red-500/50"
          style={{ width: `${(overview.complianceMissing / total) * 100}%` }}
        />
      </div>
      <div className="mt-2 flex flex-wrap gap-3">
        <span>已覆盖 {overview.complianceCovered}</span>
        <span>部分 {overview.compliancePartial}</span>
        <span>缺失 {overview.complianceMissing}</span>
      </div>
    </div>
  );
}

function RiskSummary({ overview }: { overview: SemanticOverview }) {
  const entries = Object.entries(overview.risksByType).filter(([, n]) => n > 0);
  if (!entries.length) return null;
  return (
    <div className="mt-4 text-xs text-white/70">
      <div className="font-medium text-white/85">Risk Summary</div>
      <ul className="mt-2 list-inside list-disc space-y-1">
        {entries.map(([type, n]) => (
          <li key={type}>
            {type}：{n}
          </li>
        ))}
      </ul>
    </div>
  );
}

function SectionList({
  sections,
}: {
  sections: TenderSemanticGraph["sections"];
}) {
  return (
    <div className="mt-4 max-h-40 overflow-y-auto rounded-lg border border-white/8 p-2 text-xs">
      <div className="mb-2 font-medium text-white/80">Semantic Sections</div>
      <ul className="space-y-1 text-white/65">
        {sections.map((s) => (
          <li key={s.id}>
            <span className="text-white/45">{ROLE_LABEL[s.semanticRole] || s.semanticRole}</span>
            {" · "}
            {s.title}
            {s.linkedRequirements.length > 0
              ? ` · req ${s.linkedRequirements.length}`
              : ""}
          </li>
        ))}
      </ul>
    </div>
  );
}

function RequirementTable({
  requirements,
  compliance,
}: {
  requirements: TenderSemanticGraph["requirements"];
  compliance: TenderSemanticGraph["compliance"];
}) {
  const statusByReq = new Map(compliance.map((c) => [c.requirementId, c.responseStatus]));
  return (
    <div className="mt-4 max-h-[280px] overflow-auto rounded-lg border border-white/8">
      <table className="w-full text-left text-xs">
        <thead className="sticky top-0 bg-[#1a1f2e] text-white/55">
          <tr>
            <th className="px-2 py-2">类别</th>
            <th className="px-2 py-2">条款</th>
            <th className="px-2 py-2">可量化</th>
            <th className="px-2 py-2">证据</th>
            <th className="px-2 py-2">覆盖</th>
          </tr>
        </thead>
        <tbody>
          {requirements.map((r) => (
            <tr key={r.id} className="border-t border-white/5 text-white/75">
              <td className="whitespace-nowrap px-2 py-1.5">{r.category}</td>
              <td className="max-w-[240px] px-2 py-1.5">{r.requirement}</td>
              <td className="px-2 py-1.5">{r.measurable ? "是" : "—"}</td>
              <td className="px-2 py-1.5">{r.evidenceRequired ? "是" : "—"}</td>
              <td className="whitespace-nowrap px-2 py-1.5">
                {STATUS_LABEL[statusByReq.get(r.id) || "missing"]}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

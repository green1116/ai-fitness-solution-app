"use client";

import type { ReactNode } from "react";
import { useMemo, useState } from "react";

import type { TechnicalCompliancePackage } from "@/lib/tender/compliance/types";
import { getSkuById } from "@/lib/tender/sku/skuDatabase";

export type TenderCompliancePayload = {
  compliance: TechnicalCompliancePackage;
  sourceName?: string | null;
};

type Props = {
  loading?: boolean;
  error?: string | null;
  data: TenderCompliancePayload | null;
  onRun?: () => void;
  canRun?: boolean;
};

export default function TenderCompliancePanel({
  loading,
  error,
  data,
  onRun,
  canRun,
}: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const rows = useMemo(() => {
    if (!data) return [];
    return data.compliance.requirements.map((req) => {
      const result = data.compliance.complianceResults.find(
        (r) => r.requirementId === req.id,
      );
      const matrixRow = data.compliance.matrix.find(
        (m) => m.requirementText === req.requirementText,
      );
      const deviation = data.compliance.deviations.find(
        (d) => d.requirementId === req.id,
      );
      const sku = result?.skuId ? getSkuById(result.skuId) : undefined;
      return { req, result, matrixRow, deviation, sku };
    });
  }, [data]);

  const selected = selectedId
    ? rows.find((r) => r.req.id === selectedId)
    : rows[0];

  return (
    <div
      className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] p-4"
      data-testid="tender-compliance-panel"
    >
      <div>
        <div className="text-sm font-medium text-white">
          Technical Compliance
        </div>
        <div className="mt-0.5 text-xs text-white/50">
          参数解析 → SKU 匹配 → 符合性矩阵 → 偏离 → 证据
        </div>
      </div>

      {onRun ? (
        <button
          type="button"
          disabled={!canRun || loading}
          onClick={onRun}
          className="mt-3 rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-sm disabled:opacity-40"
        >
          {loading ? "分析符合性…" : "运行 Compliance Engine"}
        </button>
      ) : null}

      {error ? <p className="mt-3 text-sm text-red-300/90">{error}</p> : null}

      {!data && !loading && !error ? (
        <p className="mt-3 text-sm text-white/50">
          先载入招标文本，再运行技术符合性分析。
        </p>
      ) : null}

      {data ? (
        <>
          {data.sourceName ? (
            <p className="mt-3 text-xs text-white/45">来源：{data.sourceName}</p>
          ) : null}

          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            <Chip
              label="covered"
              n={
                data.compliance.complianceResults.filter(
                  (r) => r.status === "covered",
                ).length
              }
            />
            <Chip
              label="partial/failed"
              n={
                data.compliance.complianceResults.filter((r) =>
                  ["partial", "failed", "risky"].includes(r.status),
                ).length
              }
            />
            <Chip label="偏离" n={data.compliance.deviations.length} />
            <span className="text-white/45">
              risk: {data.compliance.riskLevel}
            </span>
          </div>

          <div className="mt-3 grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
            <ul className="max-h-56 space-y-1 overflow-y-auto rounded-lg border border-white/8 p-2 text-xs">
              {rows.length === 0 ? (
                <li className="text-white/45">未提取到可度量技术要求</li>
              ) : (
                rows.map(({ req }) => (
                  <li key={req.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(req.id)}
                      className={`w-full rounded px-2 py-1.5 text-left ${
                        selected?.req.id === req.id
                          ? "bg-white/12 text-white"
                          : "text-white/65 hover:bg-white/5"
                      }`}
                    >
                      {req.requirementText.slice(0, 42)}
                    </button>
                  </li>
                ))
              )}
            </ul>

            {selected ? (
              <article className="rounded-lg border border-white/8 bg-black/20 p-3 text-xs text-white/75">
                <Row label="requirement">{selected.req.requirementText}</Row>
                <Row label="matched sku">
                  {selected.sku
                    ? `${selected.sku.brand} ${selected.sku.model}`
                    : "—"}
                </Row>
                <Row label="actual">
                  {selected.matrixRow?.actualValue ||
                    selected.result?.matchedParameters[0]?.actual ||
                    "—"}
                </Row>
                <Row label="result">
                  {selected.result?.status || selected.matrixRow?.result || "—"}
                </Row>
                <Row label="deviation">
                  {selected.deviation?.description || "none"}
                </Row>
                <Row label="risk">{data.compliance.riskLevel}</Row>
                {selected.result && data.compliance.responses.length > 0 ? (
                  <p className="mt-2 whitespace-pre-wrap leading-relaxed text-white/65">
                    {
                      data.compliance.responses[
                        rows.indexOf(selected)
                      ]?.slice(0, 280)
                    }
                    …
                  </p>
                ) : null}
              </article>
            ) : (
              <p className="text-xs text-white/45">选择左侧条款查看符合性</p>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}

function Chip({ label, n }: { label: string; n: number }) {
  return (
    <span className="rounded-full border border-white/10 px-3 py-1 text-white/75">
      {label} {n}
    </span>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <p className="mt-1.5">
      <span className="text-white/45">{label}：</span>
      <span className="text-white/80">{children}</span>
    </p>
  );
}

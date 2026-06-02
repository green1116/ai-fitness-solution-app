"use client";

import type { ReactNode } from "react";
import { useMemo, useState } from "react";

import type { SemanticRequirement } from "@/lib/tender/semantic/types";
import type { SKUIntelligenceResult, SkuMatchResult } from "@/lib/tender/sku/skuTypes";

export type TenderSkuPayload = {
  skuResult: SKUIntelligenceResult;
  requirements?: SemanticRequirement[];
  sourceName?: string | null;
};

type Props = {
  loading?: boolean;
  error?: string | null;
  data: TenderSkuPayload | null;
  onRun?: () => void;
  canRun?: boolean;
};

const COMPLIANCE_LABEL = {
  covered: "covered",
  partial: "partial",
  missing: "missing",
  risky: "risky",
} as const;

export default function TenderSkuPanel({
  loading,
  error,
  data,
  onRun,
  canRun,
}: Props) {
  const [selectedReqId, setSelectedReqId] = useState<string | null>(null);

  const reqById = useMemo(() => {
    const map = new Map<string, SemanticRequirement>();
    for (const r of data?.requirements || []) map.set(r.id, r);
    return map;
  }, [data?.requirements]);

  const matchByReq = useMemo(() => {
    const map = new Map<string, SkuMatchResult>();
    for (const m of data?.skuResult.matchResults || []) {
      map.set(m.requirementId, m);
    }
    return map;
  }, [data?.skuResult.matchResults]);

  const rows = data?.skuResult.matchResults ?? [];
  const selected = selectedReqId
    ? matchByReq.get(selectedReqId)
    : rows[0];
  const selectedReq = selected
    ? reqById.get(selected.requirementId)
    : undefined;

  return (
    <div
      className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] p-4"
      data-testid="tender-sku-panel"
    >
      <div>
        <div className="text-sm font-medium text-white">SKU Intelligence</div>
        <div className="mt-0.5 text-xs text-white/50">
          requirement → SKU → compliance → alternatives
        </div>
      </div>

      {onRun ? (
        <button
          type="button"
          disabled={!canRun || loading}
          onClick={onRun}
          className="mt-3 rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-sm disabled:opacity-40"
        >
          {loading ? "匹配 SKU…" : "运行 SKU Intelligence"}
        </button>
      ) : null}

      {error ? <p className="mt-3 text-sm text-red-300/90">{error}</p> : null}

      {!data && !loading && !error ? (
        <p className="mt-3 text-sm text-white/50">
          先载入招标文本，再运行 SKU 匹配查看品牌型号与合规状态。
        </p>
      ) : null}

      {data ? (
        <>
          {data.sourceName ? (
            <p className="mt-3 text-xs text-white/45">来源：{data.sourceName}</p>
          ) : null}

          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            <Chip label="covered" n={data.skuResult.complianceSummary.covered} />
            <Chip label="partial" n={data.skuResult.complianceSummary.partial} />
            <Chip label="missing" n={data.skuResult.complianceSummary.missing} />
            <Chip label="risky" n={data.skuResult.complianceSummary.risky} />
            <span className="text-white/40">
              推荐 {data.skuResult.recommendedSkus.length} SKU
            </span>
          </div>

          <div className="mt-3 grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
            <ul className="max-h-56 space-y-1 overflow-y-auto rounded-lg border border-white/8 p-2 text-xs">
              {rows.length === 0 ? (
                <li className="text-white/45">暂无可匹配的设备类要求</li>
              ) : (
                rows.map((m) => {
                  const req = reqById.get(m.requirementId);
                  return (
                    <li key={m.requirementId}>
                      <button
                        type="button"
                        onClick={() => setSelectedReqId(m.requirementId)}
                        className={`w-full rounded px-2 py-1.5 text-left ${
                          selected?.requirementId === m.requirementId
                            ? "bg-white/12 text-white"
                            : "text-white/65 hover:bg-white/5"
                        }`}
                      >
                        {req
                          ? req.requirement.slice(0, 40)
                          : m.requirementId}
                      </button>
                    </li>
                  );
                })
              )}
            </ul>

            {selected ? (
              <article className="rounded-lg border border-white/8 bg-black/20 p-3 text-xs text-white/75">
                <Row label="requirement">
                  {selectedReq?.requirement || selected.requirementId}
                </Row>
                <Row label="matched sku">
                  {selected.sku
                    ? `${selected.sku.brand} ${selected.sku.model}`
                    : "—"}
                </Row>
                <Row label="compliance">
                  {COMPLIANCE_LABEL[selected.compliance] || selected.compliance}
                </Row>
                <Row label="alternatives">
                  {selected.alternatives?.length
                    ? selected.alternatives
                        .map((s) => `${s.brand} ${s.model}`)
                        .join("；")
                    : "—"}
                </Row>
                <Row label="risk">
                  {selected.riskNotes?.length
                    ? selected.riskNotes.join("；")
                    : "—"}
                </Row>
                {selected.matchedFields?.length ? (
                  <p className="mt-2 text-white/45">
                    匹配字段：{selected.matchedFields.join("、")}
                  </p>
                ) : null}
              </article>
            ) : (
              <p className="text-xs text-white/45">选择左侧 requirement 查看匹配</p>
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

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <p className="mt-1.5">
      <span className="text-white/45">{label}：</span>
      <span className="text-white/80">{children}</span>
    </p>
  );
}

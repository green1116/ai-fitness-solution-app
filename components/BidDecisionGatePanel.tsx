"use client";

import type {
  BidDecisionGateResult,
  BidRiskItem,
} from "@/lib/tender/gate/types";
import BidRiskList from "@/components/BidRiskList";
import BidRiskFixPanel from "@/components/BidRiskFixPanel";

type Props = {
  gate: BidDecisionGateResult;
  loading?: boolean;
  activeRiskId?: string | null;
  fixingRiskId?: string | null;
  fixResult?: string | null;
  onSelectRisk?: (riskId: string) => void;
  onJumpToRisk?: (risk: BidRiskItem) => void;
  onAutoFixRisk?: (risk: BidRiskItem) => void;
  onProceed?: () => void;
  onForceProceed?: () => void;
  onBackToFix?: () => void;
  onClose?: () => void;
  onGoFix: (riskId?: string | null) => void;
};

export default function BidDecisionGatePanel({
  gate,
  loading = false,
  activeRiskId,
  fixingRiskId,
  fixResult,
  onSelectRisk,
  onJumpToRisk,
  onAutoFixRisk,
  onProceed,
  onForceProceed,
  onClose,
  onGoFix,
}: Props) {
  const isBlock = gate.action === "block";
  const isWarn = gate.action === "warn";
  const isAllow = gate.action === "allow";

  const activeRisk =
    gate.risks.find((item) => item.id === activeRiskId) ?? gate.risks[0] ?? null;

  const handleLocateRisk = (risk: BidRiskItem) => {
    onSelectRisk?.(risk.id);
    onGoFix(risk.id);
  };

  return (
    <div className="rounded-2xl border border-amber-500/30 bg-neutral-950 p-5 text-white shadow-2xl">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs uppercase tracking-[0.18em] text-white/45">
            Bid Decision Gate
          </div>

          <div className="mt-2 text-xl font-semibold">
            {isBlock
              ? "暂不建议投标"
              : isWarn
                ? "风险提示"
                : "可继续下载"}
          </div>

          <div className="mt-2 text-sm leading-6 text-white/70">
            {gate.summary}
          </div>

          {typeof gate.score === "number" ? (
            <div className="mt-2 text-xs text-white/45">
              评估分数：{gate.score}
            </div>
          ) : null}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="rounded-md border border-white/15 px-2.5 py-1 text-sm text-white/60 hover:bg-white/10"
        >
          关闭
        </button>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-[1.1fr_0.9fr]">
        <div>
          <div className="mb-2 text-xs text-white/45">风险清单</div>
          <BidRiskList
            risks={gate.risks}
            activeRiskId={activeRisk?.id ?? null}
            onSelectRisk={(risk) => onSelectRisk?.(risk.id)}
            onLocateRisk={handleLocateRisk}
          />
        </div>

        <div>
          <div className="mb-2 text-xs text-white/45">补强建议</div>
          <BidRiskFixPanel
            risk={activeRisk}
            fixing={fixingRiskId === activeRisk?.id}
            fixResult={fixResult}
            onJump={onJumpToRisk}
            onAutoFix={onAutoFixRisk}
          />
        </div>
      </div>

      <div className="mt-5 flex flex-wrap justify-end gap-2">
        <button
          type="button"
          className="rounded-md border border-white/20 px-3 py-1.5 text-white/70 hover:bg-white/10"
          onClick={onClose}
        >
          关闭
        </button>

        {!isAllow ? (
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-black hover:bg-amber-400"
            onClick={() => onGoFix(activeRiskId)}
          >
            先去补强
          </button>
        ) : null}

        {isWarn ? (
          <button
            type="button"
            className="rounded-md border border-amber-500 px-3 py-1.5 text-amber-300 hover:bg-amber-500/10"
            onClick={onProceed || onForceProceed}
            disabled={loading}
          >
            {loading ? "处理中..." : "仍要继续下载"}
          </button>
        ) : null}

        {isAllow ? (
          <button
            type="button"
            className="rounded-md border border-emerald-500 px-3 py-1.5 text-emerald-300 hover:bg-emerald-500/10"
            onClick={onProceed}
            disabled={loading}
          >
            {loading ? "处理中..." : "继续下载"}
          </button>
        ) : null}
      </div>
    </div>
  );
}

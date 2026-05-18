"use client";

import type { BidRiskItem } from "@/lib/tender/gate/types";

type Props = {
  risk: BidRiskItem | null;
  fixing?: boolean;
  fixResult?: string | null;
  onJump?: (risk: BidRiskItem) => void;
  onAutoFix?: (risk: BidRiskItem) => void;
  /** 与 Gate「去补强」联动：先选中再收起并滚到分析区（不传则走 onJump） */
  onLocatePrimary?: (risk: BidRiskItem) => void;
};

export default function BidRiskFixPanel({
  risk,
  fixing = false,
  fixResult,
  onJump,
  onAutoFix,
  onLocatePrimary,
}: Props) {
  console.log("[BidRiskFixPanel] render", {
    hasRisk: !!risk,
    risk,
    fixing,
    fixResult,
  });

  if (!risk) {
    return (
      <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-200">
        当前未选中风险项（risk is null）
      </div>
    );
  }

  const showAutoFix = !!risk.canAutoFix;

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-xs text-white/50">{risk.id}</div>
          <div className="mt-1 text-base font-semibold text-white">
            {risk.title}
          </div>
        </div>

        <span
          className={[
            "rounded-md border px-2 py-1 text-xs",
            risk.level === "block"
              ? "border-red-500/40 bg-red-500/10 text-red-300"
              : "border-amber-500/40 bg-amber-500/10 text-amber-300",
          ].join(" ")}
        >
          {risk.level === "block" ? "暂不建议投标" : "建议补强"}
        </span>
      </div>

      <div className="mt-4 space-y-3 text-sm">
        <div>
          <div className="mb-1 text-xs text-white/45">风险原因</div>
          <div className="rounded-lg bg-black/20 p-3 leading-6 text-white/80">
            {risk.reason}
          </div>
        </div>

        <div>
          <div className="mb-1 text-xs text-white/45">补强建议</div>
          <div className="rounded-lg bg-black/20 p-3 leading-6 text-white/80">
            {risk.suggestion || "建议补充明确响应文字、证明材料或人工确认信息。"}
          </div>
        </div>

        {fixResult ? (
          <div>
            <div className="mb-1 text-xs text-white/45">自动补强结果</div>
            <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 leading-6 text-emerald-200">
              {fixResult}
            </div>
          </div>
        ) : null}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => {
            if (onLocatePrimary) {
              onLocatePrimary(risk);
              return;
            }
            onJump?.(risk);
          }}
          className={
            onLocatePrimary
              ? "rounded-lg border border-white/15 px-3 py-2 text-sm text-white/85 hover:bg-white/10"
              : "rounded-md border border-white/20 px-3 py-1.5 text-sm text-white/80 hover:bg-white/10"
          }
        >
          定位到问题
        </button>

        {showAutoFix ? (
          <button
            type="button"
            onClick={() => onAutoFix?.(risk)}
            disabled={fixing}
            className="rounded-md border border-amber-500 px-3 py-1.5 text-sm text-amber-300 hover:bg-amber-500/10 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {fixing ? "补强中..." : "一键补强"}
          </button>
        ) : null}
      </div>
    </div>
  );
}
"use client";

import type { BidRiskItem } from "@/lib/tender/gate/types";

type Props = {
  risks: BidRiskItem[];
  activeRiskId?: string | null;
  onSelectRisk?: (risk: BidRiskItem) => void;
  /** 每条风险卡上的「定位到问题」（不传则不显示） */
  onLocateRisk?: (risk: BidRiskItem) => void;
};

function levelBadgeClass(level: BidRiskItem["level"]) {
  switch (level) {
    case "block":
      return "border-red-500/40 bg-red-500/10 text-red-300";
    case "warn":
      return "border-amber-500/40 bg-amber-500/10 text-amber-300";
    default:
      return "border-white/15 bg-white/5 text-white/70";
  }
}

export default function BidRiskList({
  risks,
  activeRiskId,
  onSelectRisk,
  onLocateRisk,
}: Props) {
  if (!risks?.length) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white/60">
        当前没有可展示的风险项。
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {risks.map((risk) => {
        const isActive = activeRiskId === risk.id;

        return (
          <div
            key={risk.id}
            className={[
              "overflow-hidden rounded-xl border transition",
              isActive
                ? "border-amber-400/60 bg-amber-500/10"
                : "border-white/10 bg-white/5",
            ].join(" ")}
          >
            <button
              type="button"
              onClick={() => onSelectRisk?.(risk)}
              className="w-full p-3 text-left hover:bg-white/5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-white">
                      {risk.id}
                    </span>
                    <span
                      className={[
                        "rounded-md border px-2 py-0.5 text-xs",
                        levelBadgeClass(risk.level),
                      ].join(" ")}
                    >
                      {risk.level === "block"
                        ? "阻断"
                        : risk.level === "warn"
                          ? "警告"
                          : "提示"}
                    </span>
                  </div>

                  <div className="mt-1 text-sm font-medium text-white">
                    {risk.title}
                  </div>

                  <div className="mt-1 text-xs leading-5 text-white/65">
                    {risk.reason}
                  </div>
                </div>

                <div className="shrink-0 text-xs text-amber-300">查看</div>
              </div>
            </button>

            {onLocateRisk ? (
              <div className="border-t border-white/10 px-3 py-2">
                <button
                  type="button"
                  onClick={() => onLocateRisk(risk)}
                  className="rounded-lg border border-white/15 px-3 py-2 text-sm text-white/85 hover:bg-white/10"
                >
                  定位到问题
                </button>
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

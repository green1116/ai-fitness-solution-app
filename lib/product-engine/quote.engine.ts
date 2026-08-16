/**
 * V59 Product Engine — Quote (V58 Lifecycle + Job + Async)
 */

import { buildPlan } from "@/lib/plan/builder";
import {
  createQuoteOrchestrator,
  type QuoteOrchestrationResult,
} from "@/lib/quote-lifecycle";

import type { CompanyInfoInput, QuoteProposal } from "./types";

export type QuoteEngineInput = {
  quoteId: string;
  workspaceId: string;
  action?: string;
  companyInfo: CompanyInfoInput;
};

export type QuoteEngineResult = {
  proposal: QuoteProposal;
  runtime: QuoteOrchestrationResult;
};

function joinLines(lines: Array<string | null | undefined>): string {
  return lines.filter((line): line is string => Boolean(line && line.trim())).join(" · ");
}

function buildProposalFromOrchestration(
  input: QuoteEngineInput,
  runtime: QuoteOrchestrationResult,
): QuoteProposal {
  const company = input.companyInfo.companyName;
  const industry = input.companyInfo.industry?.trim() || "互联网";
  const companySize =
    typeof input.companyInfo.targetUsers === "number" &&
    Number.isFinite(input.companyInfo.targetUsers) &&
    input.companyInfo.targetUsers > 0
      ? input.companyInfo.targetUsers
      : 200;
  const areaSize =
    typeof input.companyInfo.areaM2 === "number" &&
    Number.isFinite(input.companyInfo.areaM2) &&
    input.companyInfo.areaM2 > 0
      ? input.companyInfo.areaM2
      : 120;
  const plan = buildPlan(
    {
      planId: input.quoteId,
      industry,
      companySize,
      areaSize,
      budgetRange: "10-20万",
    },
    "standard",
  );

  const lifecycleStep = runtime.steps.find((s) => s.step === "lifecycle");
  const jobStep = runtime.steps.find((s) => s.step === "job");
  const equipmentBody = Object.entries(plan.equipments)
    .flatMap(([zone, items]) =>
      items.map(
        (item) => `${zone}：${item.name} ×${item.qty}（${item.rationale}）`,
      ),
    )
    .join(" ");

  return {
    summary: `${company} ${plan.positioning}`,
    sections: [
      {
        title: "企业概况",
        body: joinLines([
          `企业：${company}`,
          `行业：${industry}`,
          input.companyInfo.city ? `城市：${input.companyInfo.city}` : null,
          `目标用户：${companySize} 人`,
          `面积：${areaSize}㎡`,
        ]),
      },
      {
        title: "方案定位",
        body: `${plan.title}。${plan.positioning}`,
      },
      {
        title: "执行摘要",
        body: plan.executiveSummary.join(" "),
      },
      {
        title: "推荐说明",
        body: plan.recommendation,
      },
      {
        title: "使用模型",
        body: joinLines([
          `同时使用：${plan.usage.concurrentUsers}`,
          `参与率：${plan.usage.participationRate}`,
          `高峰：${plan.usage.peakHours}`,
          `人群：${plan.usage.mainUsers}`,
        ]),
      },
      {
        title: "器材配置",
        body: equipmentBody,
      },
      {
        title: "实施路径",
        body: plan.implementation
          .map((step) => `${step.name}（${step.duration}）：${step.desc}`)
          .join(" "),
      },
      {
        title: "增值模块",
        body: plan.addOnModules
          .map(
            (mod) =>
              `${mod.name}${mod.enabled ? "（启用）" : "（未启用）"}：${mod.value}`,
          )
          .join(" "),
      },
      {
        title: "方案卖点",
        body: `${plan.salesCopy.oneLine} ${plan.salesCopy.hrPitch} ${plan.salesCopy.objectionHandling.join(" ")}`,
      },
      {
        title: "风险与前提",
        body: [
          `前提：${plan.risks.prerequisites.join(" ")}`,
          `不适用：${plan.risks.notSuitable.join(" ")}`,
          `缓解：${plan.risks.mitigations.join(" ")}`,
          plan.risks.disclaimer,
        ].join(" "),
      },
      {
        title: "方案生成状态",
        body: `Lifecycle=${lifecycleStep?.status ?? "unknown"}, Job=${jobStep?.status ?? "unknown"}`,
      },
      {
        title: "编排轨迹",
        body: runtime.steps.map((s) => `${s.step}:${s.status}`).join(" → "),
      },
    ],
    generatedAt: runtime.completedAt,
  };
}

export function runQuoteEngine(input: QuoteEngineInput): QuoteEngineResult {
  const orchestrator = createQuoteOrchestrator();
  const runtime = orchestrator.run({
    context: {
      quoteId: input.quoteId,
      workspaceId: input.workspaceId,
    },
    action: input.action ?? "generate",
    payload: input.companyInfo,
    observedAt: new Date().toISOString(),
  });

  return {
    proposal: buildProposalFromOrchestration(input, runtime),
    runtime,
  };
}

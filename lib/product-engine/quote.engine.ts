/**
 * V59 Product Engine — Quote (V58 Lifecycle + Job + Async)
 */

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

function buildProposalFromOrchestration(
  input: QuoteEngineInput,
  runtime: QuoteOrchestrationResult,
): QuoteProposal {
  const company = input.companyInfo.companyName;
  const lifecycleStep = runtime.steps.find((s) => s.step === "lifecycle");
  const jobStep = runtime.steps.find((s) => s.step === "job");

  return {
    summary: `${company} 企业健身空间方案（V58 编排 ${runtime.orchestrationId}）`,
    sections: [
      {
        title: "企业概况",
        body: [
          `企业：${company}`,
          input.companyInfo.industry ? `行业：${input.companyInfo.industry}` : null,
          input.companyInfo.city ? `城市：${input.companyInfo.city}` : null,
          input.companyInfo.targetUsers
            ? `目标用户：${input.companyInfo.targetUsers} 人`
            : null,
        ]
          .filter(Boolean)
          .join(" · "),
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

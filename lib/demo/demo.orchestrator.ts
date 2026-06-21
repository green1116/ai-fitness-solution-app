/**
 * V64 P1 — Demo orchestrator
 */

import type { DemoCompanyInput, DemoOrchestratorResult } from "./demo.types";
import { generateDemoQuote } from "./quote.demo.engine";
import { generateDemoBudget } from "./budget.demo.engine";
import { generateDemoTender } from "./tender.demo.engine";
import { fallbackDemoResponse } from "./demo.fallback";
import { getDemoRuntimeStubLabel } from "./demo.v58-stub";
import { trackDemoStart, trackDemoComplete } from "@/lib/landing/conversion/conversion.tracker";
import { trackFunnelStage } from "@/lib/landing/conversion/funnel.tracker";

const UPSELL_PROMPTS = [
  "Unlock full PDF",
  "Generate full tender",
  "Save your project",
  "Get enterprise version",
] as const;

function createSessionId(): string {
  return `demo-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function runDemoOrchestrator(input: DemoCompanyInput): DemoOrchestratorResult {
  const sessionId = createSessionId();

  trackDemoStart({ companyName: input.companyName, sessionId });
  trackFunnelStage("demo_click", { sessionId });

  let quote;
  let budget;
  let tender;

  try {
    quote = generateDemoQuote(input);
    budget = generateDemoBudget(input, quote);
    tender = generateDemoTender(input);
  } catch {
    const fallback = fallbackDemoResponse(input);
    quote = fallback.quote;
    budget = fallback.budget;
    tender = fallback.tender;
  }

  trackDemoComplete({ sessionId, hasQuote: true, hasBudget: true, hasTender: true });
  trackFunnelStage("demo_result", { sessionId });

  return {
    sessionId,
    company: input,
    quote,
    budget,
    tender,
    upsellPrompts: [...UPSELL_PROMPTS],
    generatedAt: new Date().toISOString(),
    runtimeStub: getDemoRuntimeStubLabel(),
  };
}

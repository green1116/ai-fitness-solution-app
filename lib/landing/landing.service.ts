/**
 * V64 P1 — Landing + Demo public API
 */

export { trackLandingView, trackDemoStart, trackDemoComplete, trackSignupClick, trackConversion } from "./conversion/conversion.tracker";
export { trackFunnelStage, getFunnelStageOrder, describeFunnel } from "./conversion/funnel.tracker";
export { resolveSignupRedirect, resolveLoginRedirect, resolvePostSignupPath } from "./conversion/signup.redirect";

export { runDemoOrchestrator } from "../demo/demo.orchestrator";
export { fallbackDemoResponse } from "../demo/demo.fallback";
export { generateDemoQuote } from "../demo/quote.demo.engine";
export { generateDemoBudget } from "../demo/budget.demo.engine";
export { generateDemoTender } from "../demo/tender.demo.engine";

export type { DemoCompanyInput, DemoOrchestratorResult } from "../demo/demo.types";

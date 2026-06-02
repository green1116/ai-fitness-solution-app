import { buildExecutiveApprovalGate } from "../runtime/buildExecutiveApprovalGate";
import type {
  ExecutiveApprovalGateRuntimeInput,
  ExecutiveApprovalGateRuntimeResult,
} from "../types";
import { toBuildExecutiveApprovalGateInput } from "../types";
import { appendGateEvent, createExecutiveGateTrace } from "./gateTrace";

/**
 * V3.4-E10 Executive Approval Gate Runtime
 *
 * Executive Oversight → Gate Reasons → Tender Release Decision
 */
export function runExecutiveApprovalGateRuntime(
  input: ExecutiveApprovalGateRuntimeInput,
): ExecutiveApprovalGateRuntimeResult {
  const started = Date.now();
  const ranAt = new Date().toISOString();
  let trace = createExecutiveGateTrace(input.runId);

  trace = appendGateEvent(trace, "collect_reasons", "收集放行阻断原因");
  const gateInput = toBuildExecutiveApprovalGateInput(input);

  trace = appendGateEvent(trace, "evaluate_oversight", "评估高管监管结论", {
    recommendation: input.executiveOversight.recommendation,
    executiveScore: input.executiveOversight.executiveScore,
  });

  const pkg = buildExecutiveApprovalGate(gateInput, input.policy);

  trace = appendGateEvent(trace, "resolve_gate", `gate=${pkg.status}`, {
    reasons: pkg.reasons,
    releasable: pkg.releasable,
  });
  trace = appendGateEvent(
    trace,
    "tender_release_decision",
    pkg.tenderReleaseDecision,
    { recommendation: pkg.recommendation },
  );
  trace = appendGateEvent(trace, "debug", "生成 gate debug");

  return {
    ...pkg,
    runId: input.runId,
    ranAt,
    durationMs: Date.now() - started,
    documentId: input.documentId,
    trace,
  };
}

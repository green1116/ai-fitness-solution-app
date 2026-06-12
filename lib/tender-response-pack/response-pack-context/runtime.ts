import { finalizeRuntime, runStage } from "../shared/runtime";
import type { ResponsePackRuntimeResult, ResponsePackStageResult } from "../shared/types";
import { TENDER_RESPONSE_PACK_VERSION } from "../shared/types";
import { buildResponsePackContextBundle } from "./builders";
import type { ResponsePackContextRuntimePayload } from "./types";
import { RESPONSE_PACK_CONTEXT_RUNTIME_VERSION } from "./types";

export function validateResponsePackContextRuntime(input?: {
  deploymentId?: string;
  bidderBrand?: import("../shared/types").ResponsePackBidderBrand;
}): { valid: boolean } {
  const bundle = buildResponsePackContextBundle(input);
  return { valid: bundle.contextReadiness >= 80 };
}

export function runResponsePackContextRuntime(input?: {
  deploymentId?: string;
  bidderBrand?: import("../shared/types").ResponsePackBidderBrand;
}): ResponsePackRuntimeResult<ResponsePackContextRuntimePayload> {
  const deploymentId = input?.deploymentId ?? "response-pack-context-default";
  const stages: ResponsePackStageResult[] = [];

  const bundle = runStage("response-pack-context-build", "Response Pack Context", () => buildResponsePackContextBundle(input), stages);
  const validation = runStage("response-pack-context-validate", "Context Validation", () => validateResponsePackContextRuntime(input), stages);
  if (!validation.valid) throw new Error("Response pack context validation failed");

  const payload: ResponsePackContextRuntimePayload = {
    version: RESPONSE_PACK_CONTEXT_RUNTIME_VERSION,
    packVersion: TENDER_RESPONSE_PACK_VERSION,
    context: bundle.context,
    contextReadiness: bundle.contextReadiness,
    summary: `response-pack-context ${bundle.context.packLabel} readiness=${bundle.contextReadiness}%`,
  };

  return finalizeRuntime({ domain: "response-pack-context", deploymentId, stages, payload, summary: payload.summary });
}

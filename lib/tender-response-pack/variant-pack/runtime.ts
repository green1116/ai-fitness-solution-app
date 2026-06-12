import { finalizeRuntime, runStage } from "../shared/runtime";
import type { ResponsePackRuntimeResult, ResponsePackStageResult } from "../shared/types";
import { TENDER_RESPONSE_PACK_VERSION } from "../shared/types";
import { buildAllVariantPacks } from "./builders";
import type { VariantPackRuntimePayload } from "./types";
import { VARIANT_PACK_RUNTIME_VERSION } from "./types";

export function validateVariantPackRuntime(input?: {
  deploymentId?: string;
}): { valid: boolean } {
  const { responsePacks, variantSpreadScore } = buildAllVariantPacks(input);
  return {
    valid:
      responsePacks.length === 4 &&
      new Set(responsePacks.map((p) => p.bidderBrand)).size === 4 &&
      variantSpreadScore > 20 &&
      responsePacks.every((p) => p.assemblyReadiness >= 85),
  };
}

export function runVariantPackRuntime(input?: {
  deploymentId?: string;
}): ResponsePackRuntimeResult<VariantPackRuntimePayload> {
  const deploymentId = input?.deploymentId ?? "variant-pack-default";
  const stages: ResponsePackStageResult[] = [];

  const result = runStage("variant-pack-build", "Variant Pack", () => buildAllVariantPacks(input), stages);
  const validation = runStage("variant-pack-validate", "Variant Validation", () => validateVariantPackRuntime(input), stages);
  if (!validation.valid) throw new Error("Variant pack validation failed");

  const payload: VariantPackRuntimePayload = {
    version: VARIANT_PACK_RUNTIME_VERSION,
    packVersion: TENDER_RESPONSE_PACK_VERSION,
    responsePacks: result.responsePacks,
    variantCount: result.responsePacks.length,
    variantSpreadScore: result.variantSpreadScore,
    summary: `variant-pack count=${result.responsePacks.length} spread=${result.variantSpreadScore}%`,
  };

  return finalizeRuntime({ domain: "variant-pack", deploymentId, stages, payload, summary: payload.summary });
}

import { finalizeRuntime, runStage } from "../shared/runtime";
import type { ResponsePackRuntimeResult, ResponsePackStageResult } from "../shared/types";
import { TENDER_RESPONSE_PACK_VERSION } from "../shared/types";
import { buildTenderResponsePack } from "./builders";
import type { ResponsePackAssemblyRuntimePayload } from "./types";
import { RESPONSE_PACK_ASSEMBLY_RUNTIME_VERSION } from "./types";

export function validateResponsePackAssemblyRuntime(input?: {
  deploymentId?: string;
  bidderBrand?: import("../shared/types").ResponsePackBidderBrand;
}): { valid: boolean } {
  const pack = buildTenderResponsePack({
    deploymentId: input?.deploymentId ?? "response-pack-assembly-default",
    bidderBrand: input?.bidderBrand ?? "Technogym",
  });
  return { valid: pack.assemblyReadiness >= 85 };
}

export function runResponsePackAssemblyRuntime(input?: {
  deploymentId?: string;
  bidderBrand?: import("../shared/types").ResponsePackBidderBrand;
}): ResponsePackRuntimeResult<ResponsePackAssemblyRuntimePayload> {
  const deploymentId = input?.deploymentId ?? "response-pack-assembly-default";
  const bidderBrand = input?.bidderBrand ?? "Technogym";
  const stages: ResponsePackStageResult[] = [];

  const responsePack = runStage("response-pack-assembly-build", "Response Pack Assembly", () => buildTenderResponsePack({ deploymentId, bidderBrand }), stages);
  const validation = runStage("response-pack-assembly-validate", "Assembly Validation", () => validateResponsePackAssemblyRuntime(input), stages);
  if (!validation.valid) throw new Error("Response pack assembly validation failed");

  const payload: ResponsePackAssemblyRuntimePayload = {
    version: RESPONSE_PACK_ASSEMBLY_RUNTIME_VERSION,
    packVersion: TENDER_RESPONSE_PACK_VERSION,
    responsePack,
    assemblyReadiness: responsePack.assemblyReadiness,
    summary: `response-pack-assembly ${responsePack.packLabel} readiness=${responsePack.assemblyReadiness}%`,
  };

  return finalizeRuntime({ domain: "response-pack-assembly", deploymentId, stages, payload, summary: payload.summary });
}

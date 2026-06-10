import { finalizeRuntime, runStage } from "../shared/runtime";
import type {
  TenderIntelligenceRuntimeResult,
  TenderIntelligenceStageResult,
} from "../shared/types";
import { TENDER_INTELLIGENCE_VERSION } from "../shared/types";
import {
  buildTenderIntelligenceProfile,
  collectTenderIntelligence,
} from "./builders";
import type { TenderIntelligenceAssemblyRuntimePayload } from "./types";
import { TENDER_INTELLIGENCE_ASSEMBLY_RUNTIME_VERSION } from "./types";

export function validateTenderIntelligenceAssembly(input?: {
  deploymentId?: string;
}): { valid: boolean } {
  const deploymentId = input?.deploymentId ?? "assembly-default";
  const collected = collectTenderIntelligence(deploymentId);
  const profile = buildTenderIntelligenceProfile({ deploymentId, collected });
  return {
    valid:
      profile.completeness === 100 &&
      profile.classification.length > 0 &&
      profile.riskLevel.length > 0 &&
      profile.complianceCoverage > 0,
  };
}

export function runTenderIntelligenceAssemblyRuntime(input?: {
  deploymentId?: string;
}): TenderIntelligenceRuntimeResult<TenderIntelligenceAssemblyRuntimePayload> {
  const deploymentId = input?.deploymentId ?? "assembly-default";
  const stages: TenderIntelligenceStageResult[] = [];

  const collected = runStage(
    "tender-intel-collect",
    "Collect Intelligence Domains",
    () => collectTenderIntelligence(deploymentId),
    stages,
  );
  const profile = runStage(
    "tender-intel-profile",
    "Tender Intelligence Profile",
    () => buildTenderIntelligenceProfile({ deploymentId, collected }),
    stages,
  );
  const validation = runStage(
    "tender-intel-validate",
    "Assembly Validation",
    () => validateTenderIntelligenceAssembly({ deploymentId }),
    stages,
  );
  if (!validation.valid) throw new Error("Tender intelligence assembly validation failed");

  const payload: TenderIntelligenceAssemblyRuntimePayload = {
    version: TENDER_INTELLIGENCE_ASSEMBLY_RUNTIME_VERSION,
    intelligenceVersion: TENDER_INTELLIGENCE_VERSION,
    classification: collected.classification.payload,
    scale: collected.scale.payload,
    risk: collected.risk.payload,
    equipment: collected.equipment.payload,
    budget: collected.budget.payload,
    compliance: collected.compliance.payload,
    profile,
    summary: `tender-intelligence-assembly profile=${profile.profileId} type=${profile.classification} scale=${profile.scale} risk=${profile.riskLevel}`,
  };

  return finalizeRuntime({
    domain: "tender-intelligence",
    deploymentId,
    stages,
    payload,
    summary: payload.summary,
  });
}

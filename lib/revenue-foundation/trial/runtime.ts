import { finalizeRuntime, runStage } from "../shared/runtime";
import type { RevenueRuntimeResult, RevenueStageResult } from "../shared/types";
import { REVENUE_FOUNDATION_VERSION } from "../shared/types";
import {
  buildTrialConversion,
  buildTrialExpiration,
  buildTrialLimits,
  buildTrialPlan,
} from "./builders";
import type { TrialRuntimePayload } from "./types";
import { TRIAL_RUNTIME_VERSION } from "./types";

export function validateTrialRuntime(input?: { deploymentId?: string }): {
  planValid: boolean;
  limitsValid: boolean;
  expirationValid: boolean;
  conversionValid: boolean;
} {
  const deploymentId = input?.deploymentId ?? "trial-default";
  const plan = buildTrialPlan({ deploymentId });
  const limits = buildTrialLimits({ deploymentId });
  const expiration = buildTrialExpiration({ deploymentId });
  const conversion = buildTrialConversion({ deploymentId, expiration });

  return {
    planValid:
      plan.planId.length > 0 &&
      plan.durationDays === 14 &&
      plan.tier === "pro-preview",
    limitsValid:
      limits.planGeneration > 0 &&
      limits.enterpriseZip === 0 &&
      limits.userLimit > 0,
    expirationValid:
      expiration.expirationId.length > 0 &&
      expiration.expiresAt > expiration.startedAt,
    conversionValid:
      conversion.conversionId.length > 0 &&
      conversion.nextStep.length > 0 &&
      (expiration.isExpired ? !conversion.eligible : conversion.eligible),
  };
}

export function runTrialRuntime(input?: {
  deploymentId?: string;
}): RevenueRuntimeResult<TrialRuntimePayload> {
  const deploymentId = input?.deploymentId ?? "trial-default";
  const stages: RevenueStageResult[] = [];

  const plan = runStage("trial-plan", "Trial Plan", () => buildTrialPlan({ deploymentId }), stages);
  const limits = runStage("trial-limits", "Trial Limits", () => buildTrialLimits({ deploymentId }), stages);
  const expiration = runStage(
    "trial-expiration",
    "Trial Expiration",
    () => buildTrialExpiration({ deploymentId }),
    stages,
  );
  const conversion = runStage(
    "trial-conversion",
    "Trial Conversion",
    () => buildTrialConversion({ deploymentId, expiration }),
    stages,
  );

  const validation = runStage(
    "trial-validate",
    "Trial Validation",
    () => validateTrialRuntime({ deploymentId }),
    stages,
  );

  const allValid = Object.values(validation).every(Boolean);
  if (!allValid) {
    throw new Error("Trial runtime validation failed");
  }

  const payload: TrialRuntimePayload = {
    version: TRIAL_RUNTIME_VERSION,
    foundationVersion: REVENUE_FOUNDATION_VERSION,
    plan,
    limits,
    expiration,
    conversion,
    summary: `trial-runtime plan=${plan.planId} status=${expiration.status} conversionEligible=${conversion.eligible}`,
  };

  return finalizeRuntime({
    domain: "trial",
    deploymentId,
    stages,
    payload,
    summary: payload.summary,
  });
}

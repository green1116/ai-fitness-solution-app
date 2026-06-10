import { finalizeRuntime, runStage } from "../shared/runtime";
import type {
  AiIntegrationRuntimeResult,
  AiIntegrationStageResult,
} from "../shared/types";
import { AI_INTEGRATION_VERSION } from "../shared/types";
import { runSafetyChecks } from "./builders";
import type { SafetyRuntimePayload } from "./types";
import { AI_SAFETY_RUNTIME_VERSION } from "./types";

export function validateAiSafetyRuntime(input?: { deploymentId?: string }): { valid: boolean } {
  const checks = runSafetyChecks(input);
  return { valid: checks.every((c) => c.passed) };
}

export function runAiSafetyRuntime(input?: {
  deploymentId?: string;
}): AiIntegrationRuntimeResult<SafetyRuntimePayload> {
  const deploymentId = input?.deploymentId ?? "safety-default";
  const stages: AiIntegrationStageResult[] = [];

  const checks = runStage(
    "ai-safety-checks",
    "AI Safety Checks",
    () => runSafetyChecks({ deploymentId }),
    stages,
  );
  const validation = runStage(
    "ai-safety-validate",
    "Safety Validation",
    () => validateAiSafetyRuntime({ deploymentId }),
    stages,
  );
  if (!validation.valid) throw new Error("AI safety validation failed");

  const allPassed = checks.every((c) => c.passed);
  const payload: SafetyRuntimePayload = {
    version: AI_SAFETY_RUNTIME_VERSION,
    integrationVersion: AI_INTEGRATION_VERSION,
    checks,
    allPassed,
    summary: `ai-safety checks=${checks.length} passed=${allPassed}`,
  };

  return finalizeRuntime({
    domain: "ai-safety",
    deploymentId,
    stages,
    payload,
    summary: payload.summary,
  });
}

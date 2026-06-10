import { finalizeRuntime, runStage } from "../shared/runtime";
import type { CustomerSuccessRuntimeResult, CustomerSuccessStageResult } from "../shared/types";
import { CUSTOMER_SUCCESS_VERSION } from "../shared/types";
import { buildSuccessPlaybooks } from "./builders";
import type { SuccessPlaybookRuntimePayload } from "./types";
import { SUCCESS_PLAYBOOK_RUNTIME_VERSION } from "./types";

export function validateSuccessPlaybookRuntime(input?: { deploymentId?: string }): { valid: boolean } {
  const playbooks = buildSuccessPlaybooks(input);
  return { valid: playbooks.length === 4 && playbooks.every((p) => p.steps.length >= 3) };
}

export function runSuccessPlaybookRuntime(input?: {
  deploymentId?: string;
}): CustomerSuccessRuntimeResult<SuccessPlaybookRuntimePayload> {
  const deploymentId = input?.deploymentId ?? "playbook-default";
  const stages: CustomerSuccessStageResult[] = [];

  const playbooks = runStage("playbook-build", "Success Playbooks", () => buildSuccessPlaybooks({ deploymentId }), stages);
  const validation = runStage("playbook-validate", "Playbook Validation", () => validateSuccessPlaybookRuntime({ deploymentId }), stages);
  if (!validation.valid) throw new Error("Success playbook validation failed");

  const payload: SuccessPlaybookRuntimePayload = {
    version: SUCCESS_PLAYBOOK_RUNTIME_VERSION,
    successVersion: CUSTOMER_SUCCESS_VERSION,
    playbooks,
    summary: `success-playbook count=${playbooks.length} types=onboarding,adoption,renewal,expansion`,
  };

  return finalizeRuntime({ domain: "success-playbook", deploymentId, stages, payload, summary: payload.summary });
}

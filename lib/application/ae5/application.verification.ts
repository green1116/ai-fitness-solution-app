/**
 * AE-5 — Application verification plan over AE-4 integration.
 * Verification catalogue only — does not redesign AE-4 or invent business logic.
 */
import { AE4_INTEGRATION_ID } from "../ae4/integration.definition";
import { resolveApplicationIntegrationPlan } from "../ae4/application.integration";
import {
  AE5_VERIFICATION_CHECKS,
  type Ae5VerificationCheck,
} from "./verification.check";
import {
  APPLICATION_VERIFICATION_DEFINITION,
  AE5_BASE_FREEZE_REF,
  AE5_INTEGRATION_REF,
  AE5_VERIFICATION_ID,
} from "./verification.definition";
import {
  APPLICATION_VERIFICATION_POLICY,
  type ApplicationVerificationPolicy,
} from "./verification.policy";
import {
  AE5_VERIFICATION_REGISTRY,
  type Ae5VerificationRegistryEntry,
} from "./verification.registry";
import {
  buildApplicationVerificationReportModel,
  type ApplicationVerificationReportModel,
} from "./verification.report";

export type ApplicationVerificationPlan = Readonly<{
  verificationId: typeof AE5_VERIFICATION_ID;
  baseFreezeRef: typeof AE5_BASE_FREEZE_REF;
  definition: typeof APPLICATION_VERIFICATION_DEFINITION;
  registry: typeof AE5_VERIFICATION_REGISTRY;
  checks: typeof AE5_VERIFICATION_CHECKS;
  report: ApplicationVerificationReportModel;
  policy: ApplicationVerificationPolicy;
  matchesIntegration: boolean;
  verificationOnly: boolean;
}>;

/**
 * Resolve declarative AE-5 verification plan bound to AE-4 integration.
 */
export function resolveApplicationVerificationPlan(): ApplicationVerificationPlan {
  const integration = resolveApplicationIntegrationPlan();

  const matchesIntegration =
    AE5_INTEGRATION_REF === AE4_INTEGRATION_ID &&
    integration.integrationId === AE4_INTEGRATION_ID &&
    integration.matchesWorkflow &&
    integration.integrationOnly &&
    APPLICATION_VERIFICATION_DEFINITION.integrationRef === AE4_INTEGRATION_ID;

  const verificationOnly =
    APPLICATION_VERIFICATION_POLICY.hasBusinessLogic === false &&
    APPLICATION_VERIFICATION_POLICY.hasWorkflow === false &&
    APPLICATION_VERIFICATION_POLICY.hasIntegrationChanges === false &&
    APPLICATION_VERIFICATION_POLICY.hasDeployment === false &&
    APPLICATION_VERIFICATION_DEFINITION.nonGoals.includes("business-logic") &&
    APPLICATION_VERIFICATION_DEFINITION.nonGoals.includes("workflow") &&
    APPLICATION_VERIFICATION_DEFINITION.nonGoals.includes(
      "integration-changes",
    ) &&
    APPLICATION_VERIFICATION_DEFINITION.nonGoals.includes("deployment");

  const report = buildApplicationVerificationReportModel(
    AE5_VERIFICATION_CHECKS.map((c) => ({
      checkId: c.checkId,
      status: "PENDING" as const,
      evidence: c.title,
    })),
  );

  return {
    verificationId: AE5_VERIFICATION_ID,
    baseFreezeRef: AE5_BASE_FREEZE_REF,
    definition: APPLICATION_VERIFICATION_DEFINITION,
    registry: AE5_VERIFICATION_REGISTRY,
    checks: AE5_VERIFICATION_CHECKS,
    report,
    policy: APPLICATION_VERIFICATION_POLICY,
    matchesIntegration,
    verificationOnly,
  };
}

export type { Ae5VerificationCheck, Ae5VerificationRegistryEntry };

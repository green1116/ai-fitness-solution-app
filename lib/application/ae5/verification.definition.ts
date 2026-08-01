/**
 * AE-5 — Application verification definition.
 * Verification catalogue over AE-4 integration — invents no business / workflow / deployment.
 */
import {
  AE4_INTEGRATION_ID,
  AE4_MODULE_PATH,
  AE4_PACKAGE_ID,
} from "../ae4/integration.definition";

export const AE5_VERIFICATION_ID = "application-verification-ae5-v1" as const;

export const AE5_VERIFICATION_GATE =
  "application-verification-ae5-gate" as const;

export const AE5_PACKAGE_ID = "AE-5" as const;

/** Frozen base — AE-4 Application Integration. */
export const AE5_BASE_FREEZE_REF = "ae-4-application-integration-v1" as const;

export const AE5_INTEGRATION_REF = AE4_INTEGRATION_ID;

export const AE5_INTEGRATION_PACKAGE_REF = AE4_PACKAGE_ID;

export const AE5_INTEGRATION_MODULE_REF = AE4_MODULE_PATH;

export const AE5_MODULE_PATH = "lib/application/ae5" as const;

export const AE5_PURPOSE =
  "Declare application verification checks and reports over AE-1…AE-4" as const;

export const AE5_NON_GOALS = [
  "business-logic",
  "workflow",
  "integration-changes",
  "deployment",
  "product-definition-redesign",
  "governance-redesign",
  "pi-redesign",
  "ae1-redesign",
  "ae2-redesign",
  "ae3-redesign",
  "ae4-redesign",
  "new-architecture",
] as const;

export type Ae5NonGoal = (typeof AE5_NON_GOALS)[number];

export type ApplicationVerificationDefinition = Readonly<{
  verificationId: typeof AE5_VERIFICATION_ID;
  packageId: typeof AE5_PACKAGE_ID;
  baseFreezeRef: typeof AE5_BASE_FREEZE_REF;
  integrationRef: typeof AE5_INTEGRATION_REF;
  purpose: typeof AE5_PURPOSE;
  nonGoals: readonly Ae5NonGoal[];
  modulePath: typeof AE5_MODULE_PATH;
}>;

export const APPLICATION_VERIFICATION_DEFINITION = {
  verificationId: AE5_VERIFICATION_ID,
  packageId: AE5_PACKAGE_ID,
  baseFreezeRef: AE5_BASE_FREEZE_REF,
  integrationRef: AE5_INTEGRATION_REF,
  purpose: AE5_PURPOSE,
  nonGoals: AE5_NON_GOALS,
  modulePath: AE5_MODULE_PATH,
} as const satisfies ApplicationVerificationDefinition;

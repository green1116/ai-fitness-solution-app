/**
 * AE-6 — Application freeze definition.
 * Freeze catalogue over AE-5 verification — invents no runtime / workflow / deployment.
 */
import {
  AE5_MODULE_PATH,
  AE5_PACKAGE_ID,
  AE5_VERIFICATION_ID,
} from "../ae5/verification.definition";

export const AE6_FREEZE_ID = "application-freeze-ae6-v1" as const;

export const AE6_FREEZE_GATE = "application-freeze-ae6-gate" as const;

export const AE6_PACKAGE_ID = "AE-6" as const;

/** Frozen base — AE-5 Application Verification. */
export const AE6_BASE_FREEZE_REF = "ae-5-application-verification-v1" as const;

export const AE6_VERIFICATION_REF = AE5_VERIFICATION_ID;

export const AE6_VERIFICATION_PACKAGE_REF = AE5_PACKAGE_ID;

export const AE6_VERIFICATION_MODULE_REF = AE5_MODULE_PATH;

export const AE6_MODULE_PATH = "lib/application/ae6" as const;

export const AE6_PURPOSE =
  "Lock AE-1…AE-5 application assembly stack as a freeze / baseline / rollback catalogue" as const;

export const AE6_NON_GOALS = [
  "business-logic",
  "runtime",
  "workflow",
  "integration",
  "deployment",
  "product-definition-redesign",
  "governance-redesign",
  "pi-redesign",
  "ae1-redesign",
  "ae2-redesign",
  "ae3-redesign",
  "ae4-redesign",
  "ae5-redesign",
  "new-architecture",
] as const;

export type Ae6NonGoal = (typeof AE6_NON_GOALS)[number];

export type ApplicationFreezeDefinition = Readonly<{
  freezeId: typeof AE6_FREEZE_ID;
  packageId: typeof AE6_PACKAGE_ID;
  baseFreezeRef: typeof AE6_BASE_FREEZE_REF;
  verificationRef: typeof AE6_VERIFICATION_REF;
  purpose: typeof AE6_PURPOSE;
  nonGoals: readonly Ae6NonGoal[];
  modulePath: typeof AE6_MODULE_PATH;
}>;

export const APPLICATION_FREEZE_DEFINITION = {
  freezeId: AE6_FREEZE_ID,
  packageId: AE6_PACKAGE_ID,
  baseFreezeRef: AE6_BASE_FREEZE_REF,
  verificationRef: AE6_VERIFICATION_REF,
  purpose: AE6_PURPOSE,
  nonGoals: AE6_NON_GOALS,
  modulePath: AE6_MODULE_PATH,
} as const satisfies ApplicationFreezeDefinition;

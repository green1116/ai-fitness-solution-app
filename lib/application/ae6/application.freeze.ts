/**
 * AE-6 — Application freeze plan over AE-5 verification.
 * Freeze catalogue only — no runtime / workflow / integration / deployment actions.
 */
import { AE5_VERIFICATION_ID } from "../ae5/verification.definition";
import { resolveApplicationVerificationPlan } from "../ae5/application.verification";
import {
  AE6_APPLICATION_BASELINE_ID,
  AE6_BASELINE_CATALOGUE,
  AE6_TAG_REF,
} from "./freeze.baseline";
import {
  APPLICATION_FREEZE_DEFINITION,
  AE6_BASE_FREEZE_REF,
  AE6_FREEZE_ID,
  AE6_VERIFICATION_REF,
} from "./freeze.definition";
import { AE6_FREEZE_LOCKS } from "./freeze.lock";
import {
  resolveApplicationFreezeManifest,
  type ApplicationFreezeManifest,
} from "./freeze.manifest";
import { AE6_ROLLBACK_CATALOGUE } from "./freeze.rollback";

export type ApplicationFreezePlan = Readonly<{
  freezeId: typeof AE6_FREEZE_ID;
  baseFreezeRef: typeof AE6_BASE_FREEZE_REF;
  definition: typeof APPLICATION_FREEZE_DEFINITION;
  manifest: ApplicationFreezeManifest;
  locks: typeof AE6_FREEZE_LOCKS;
  rollbacks: typeof AE6_ROLLBACK_CATALOGUE;
  baselines: typeof AE6_BASELINE_CATALOGUE;
  baselineId: typeof AE6_APPLICATION_BASELINE_ID;
  tagRef: typeof AE6_TAG_REF;
  matchesVerification: boolean;
  freezeOnly: boolean;
}>;

/**
 * Resolve declarative AE-6 freeze plan bound to AE-5 verification.
 */
export function resolveApplicationFreezePlan(): ApplicationFreezePlan {
  const verification = resolveApplicationVerificationPlan();
  const manifest = resolveApplicationFreezeManifest();

  const matchesVerification =
    AE6_VERIFICATION_REF === AE5_VERIFICATION_ID &&
    verification.verificationId === AE5_VERIFICATION_ID &&
    verification.matchesIntegration &&
    verification.verificationOnly &&
    APPLICATION_FREEZE_DEFINITION.verificationRef === AE5_VERIFICATION_ID;

  const freezeOnly =
    APPLICATION_FREEZE_DEFINITION.nonGoals.includes("business-logic") &&
    APPLICATION_FREEZE_DEFINITION.nonGoals.includes("runtime") &&
    APPLICATION_FREEZE_DEFINITION.nonGoals.includes("workflow") &&
    APPLICATION_FREEZE_DEFINITION.nonGoals.includes("integration") &&
    APPLICATION_FREEZE_DEFINITION.nonGoals.includes("deployment") &&
    manifest.chain === "AE-1→AE-2→AE-3→AE-4→AE-5→AE-6";

  return {
    freezeId: AE6_FREEZE_ID,
    baseFreezeRef: AE6_BASE_FREEZE_REF,
    definition: APPLICATION_FREEZE_DEFINITION,
    manifest,
    locks: AE6_FREEZE_LOCKS,
    rollbacks: AE6_ROLLBACK_CATALOGUE,
    baselines: AE6_BASELINE_CATALOGUE,
    baselineId: AE6_APPLICATION_BASELINE_ID,
    tagRef: AE6_TAG_REF,
    matchesVerification,
    freezeOnly,
  };
}

/**
 * AE-5 — Declarative verification report shape.
 * Report catalogue / builder only — no deployment or business scoring.
 */
import {
  AE5_VERIFICATION_CHECKS,
  type Ae5CheckId,
  type Ae5VerificationCheck,
} from "./verification.check";
import {
  AE5_BASE_FREEZE_REF,
  AE5_VERIFICATION_ID,
} from "./verification.definition";
import {
  AE5_VERIFICATION_REGISTRY,
  type Ae5VerificationRegistryEntry,
} from "./verification.registry";

export type Ae5CheckOutcome = Readonly<{
  checkId: Ae5CheckId;
  status: "PASS" | "PENDING";
  evidence: string;
}>;

export type ApplicationVerificationReportModel = Readonly<{
  verificationId: typeof AE5_VERIFICATION_ID;
  baseFreezeRef: typeof AE5_BASE_FREEZE_REF;
  chain: string;
  registry: typeof AE5_VERIFICATION_REGISTRY;
  checks: typeof AE5_VERIFICATION_CHECKS;
  outcomes: readonly Ae5CheckOutcome[];
  packageCount: number;
  checkCount: number;
}>;

/**
 * Build a declarative verification report model (catalogue outcomes).
 * Does not execute nested gates — gate runner owns execution evidence.
 */
export function buildApplicationVerificationReportModel(
  outcomes: readonly Ae5CheckOutcome[] = AE5_VERIFICATION_CHECKS.map((c) => ({
    checkId: c.checkId,
    status: "PENDING" as const,
    evidence: c.title,
  })),
): ApplicationVerificationReportModel {
  return {
    verificationId: AE5_VERIFICATION_ID,
    baseFreezeRef: AE5_BASE_FREEZE_REF,
    chain: "AE-1→AE-2→AE-3→AE-4",
    registry: AE5_VERIFICATION_REGISTRY,
    checks: AE5_VERIFICATION_CHECKS,
    outcomes,
    packageCount: AE5_VERIFICATION_REGISTRY.length,
    checkCount: AE5_VERIFICATION_CHECKS.length,
  };
}

export type { Ae5VerificationCheck, Ae5VerificationRegistryEntry };

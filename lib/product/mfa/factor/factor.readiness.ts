/**
 * Product MFA — readiness
 */

import { PRODUCT_SESSION_CONTROL_ID } from "../../session/control/control.constants";
import { listAssertions } from "../assertion/assertion.registry";
import { listChallenges } from "../challenge/challenge.registry";
import { listEnrollments } from "../enrollment/enrollment.registry";
import { listRecoveryCodes } from "../recovery/recovery.registry";
import { PRODUCT_MFA_SECURITY_BASE } from "./factor.constants";
import type {
  MfaReadinessCheck,
  MfaReadinessResult,
} from "./factor.types";

function nowIso(): string {
  return new Date().toISOString();
}

function check(
  id: string,
  component: string,
  label: string,
  ok: boolean,
  detail: string,
): MfaReadinessCheck {
  return { id, component, label, ok, detail };
}

export function evaluateMfaSecurityReadiness(): MfaReadinessResult {
  const checks: MfaReadinessCheck[] = [];

  checks.push(
    check(
      "MFA-BASE",
      "foundation",
      "Session control baseline aligned",
      PRODUCT_MFA_SECURITY_BASE === PRODUCT_SESSION_CONTROL_ID,
      `base=${PRODUCT_MFA_SECURITY_BASE}`,
    ),
  );

  const enrollments = listEnrollments();
  checks.push(
    check(
      "MFA-ENR",
      "enrollment",
      "Active factor enrollments present",
      enrollments.some((e) => e.status === "ACTIVE"),
      `enrollments=${enrollments.length}`,
    ),
  );

  const challenges = listChallenges();
  checks.push(
    check(
      "MFA-CHL",
      "challenge",
      "Satisfied challenges present",
      challenges.some((c) => c.status === "SATISFIED"),
      `challenges=${challenges.length}`,
    ),
  );

  const assertions = listAssertions();
  checks.push(
    check(
      "MFA-AST",
      "assertion",
      "Passing assertions present",
      assertions.some((a) => a.result === "PASS"),
      `assertions=${assertions.length}`,
    ),
  );

  const recovery = listRecoveryCodes();
  checks.push(
    check(
      "MFA-REC",
      "recovery",
      "Recovery codes issued",
      recovery.length >= 1,
      `recovery=${recovery.length}`,
    ),
  );

  const passCount = checks.filter((c) => c.ok).length;
  const failCount = checks.filter((c) => !c.ok).length;
  const verdict =
    failCount === 0 ? "READY" : passCount === 0 ? "NOT_READY" : "BLOCKED";

  return {
    verdict,
    passCount,
    failCount,
    checks,
    summary: `product-mfa readiness ${verdict.toLowerCase()}: pass=${passCount} fail=${failCount}`,
    evaluatedAt: nowIso(),
  };
}

export function assertMfaSecurityReadinessReady(
  result: MfaReadinessResult,
): asserts result is MfaReadinessResult & { verdict: "READY" } {
  if (result.verdict !== "READY") {
    throw new Error(`product mfa security not ready: ${result.summary}`);
  }
}

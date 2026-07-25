/**
 * Product MFA — Multi-Factor Authentication Release Gate
 * MODULE: MFA
 * BASE: enterprise-product-session-control-v1
 */

import { buildPlatformV1Manifest } from "../../../platform/v1/platform.manifest";
import { E12_PRODUCTIZATION_COMPLETE_ID } from "../../e12/signoff/governance.freeze.lock";
import { ENTERPRISE_LAUNCH_COMPLETE_ID } from "../../../launch/signoff/governance.freeze.lock";
import { ENTERPRISE_EVOLUTION_COMPLETE_ID } from "../../../evolution/signoff/governance.freeze.lock";
import { ENTERPRISE_COMMERCIALIZATION_COMPLETE_ID } from "../../../commercialization/p8/freeze/freeze.lock";
import { ENTERPRISE_LAUNCH_READINESS_COMPLETE_ID } from "../../../launch/readiness/l5/freeze/freeze.lock";
import { ENTERPRISE_OPERATIONS_COMPLETE_ID } from "../../../operations/o5/freeze/freeze.lock";
import { ENTERPRISE_PRODUCT_COMPLETE_ID } from "../../complete/freeze/freeze.lock";
import { PRODUCT_AUTHORIZATION_RBAC_ID } from "../../authorization/rbac/rbac.constants";
import { PRODUCT_IDENTITY_FOUNDATION_ID } from "../../identity/authentication/authentication.constants";
import { PRODUCT_ITERATION_FOUNDATION_ID } from "../../iteration/cycle/cycle.constants";
import { PRODUCT_SESSION_CONTROL_ID } from "../../session/control/control.constants";
import {
  MFA_ASSERTION_RESULTS,
  MFA_CHALLENGE_STATUSES,
  MFA_ENROLLMENT_STATUSES,
  MFA_FACTOR_KINDS,
  MFA_MANAGER_STATUSES,
  MFA_READINESS_VERDICTS,
  PRODUCT_MFA_FREEZE_VERSION,
  PRODUCT_MFA_SECURITY_BASE,
  PRODUCT_MFA_SECURITY_FREEZE_VERSION,
  PRODUCT_MFA_SECURITY_ID,
  PRODUCT_MFA_SECURITY_VERSION,
} from "../factor/factor.constants";
import {
  assertMfaSecurityReadinessReady,
  clearMfaSecurityLayer,
  createMfaManager,
  getMfaRegistryManifest,
} from "../mfa.manager";

export type GateVerdict = "PASS" | "FAIL";

export type GateCheckItem = {
  id: string;
  component: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type ReleaseGateResult = {
  result: GateVerdict;
  passCount: number;
  failCount: number;
  checks: GateCheckItem[];
  summary: string;
};

export const PRODUCT_MFA_SIGNOFF_VERSION =
  "product-mfa-signoff-1" as const;

function check(
  id: string,
  component: string,
  label: string,
  ok: boolean,
  detail: string,
): GateCheckItem {
  return { id, component, label, ok, detail };
}

function cleanup(): void {
  clearMfaSecurityLayer();
}

export function checkProductMfaReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];

  checks.push(
    check(
      "MFA-CONSTANTS",
      "factor",
      "Product MFA security version constants",
      PRODUCT_MFA_SECURITY_ID === "enterprise-product-mfa-security-v1" &&
        PRODUCT_MFA_SECURITY_VERSION === "product-mfa-1" &&
        PRODUCT_MFA_SECURITY_BASE === PRODUCT_SESSION_CONTROL_ID &&
        PRODUCT_MFA_SECURITY_FREEZE_VERSION ===
          "product-mfa-security-freeze-1" &&
        PRODUCT_MFA_FREEZE_VERSION === "product-mfa-security-freeze-1" &&
        MFA_FACTOR_KINDS.length === 4 &&
        MFA_ENROLLMENT_STATUSES.length === 3 &&
        MFA_CHALLENGE_STATUSES.length === 4 &&
        MFA_ASSERTION_RESULTS.length === 2 &&
        MFA_READINESS_VERDICTS.length === 3 &&
        MFA_MANAGER_STATUSES.length === 4,
      `id=${PRODUCT_MFA_SECURITY_ID} base=${PRODUCT_MFA_SECURITY_BASE}`,
    ),
  );

  const platform = buildPlatformV1Manifest();
  checks.push(
    check(
      "MFA-PLATFORM",
      "platform-v1",
      "Platform v1 baseline aligned",
      platform.aligned === true,
      platform.summary,
    ),
  );

  checks.push(
    check(
      "MFA-SC-BASE",
      "product-session",
      "Session control BASE preserved",
      PRODUCT_MFA_SECURITY_BASE ===
        "enterprise-product-session-control-v1" &&
        PRODUCT_SESSION_CONTROL_ID ===
          "enterprise-product-session-control-v1" &&
        PRODUCT_AUTHORIZATION_RBAC_ID ===
          "enterprise-product-authorization-rbac-v1" &&
        PRODUCT_IDENTITY_FOUNDATION_ID ===
          "enterprise-product-identity-foundation-v1" &&
        PRODUCT_ITERATION_FOUNDATION_ID ===
          "enterprise-product-iteration-foundation-v1" &&
        ENTERPRISE_PRODUCT_COMPLETE_ID === "enterprise-product-complete-v1" &&
        ENTERPRISE_OPERATIONS_COMPLETE_ID ===
          "enterprise-operations-complete-v1" &&
        ENTERPRISE_LAUNCH_READINESS_COMPLETE_ID ===
          "enterprise-launch-readiness-complete-v1" &&
        ENTERPRISE_COMMERCIALIZATION_COMPLETE_ID ===
          "enterprise-commercialization-complete-v1",
      `base=${PRODUCT_MFA_SECURITY_BASE}`,
    ),
  );

  checks.push(
    check(
      "MFA-UPSTREAM",
      "baselines",
      "Evolution / launch / E12 baselines preserved",
      ENTERPRISE_EVOLUTION_COMPLETE_ID ===
        "enterprise-evolution-complete-v1" &&
        ENTERPRISE_LAUNCH_COMPLETE_ID === "enterprise-launch-complete-v1" &&
        E12_PRODUCTIZATION_COMPLETE_ID ===
          "enterprise-e12-productization-complete-v1",
      `evolution=${ENTERPRISE_EVOLUTION_COMPLETE_ID}`,
    ),
  );

  try {
    cleanup();
    const mgr = createMfaManager({ managerId: "prod-mfa-gate" });
    mgr.initialize();
    mgr.start();

    const enrollment = mgr.enrollFactor({
      id: "mfa.gate.enr",
      principalId: "id.gate.prn",
      kind: "TOTP",
      label: "Authenticator app",
    });
    mgr.activateEnrollment({ enrollmentId: enrollment.id });
    const challenge = mgr.issueChallenge({
      id: "mfa.gate.chl",
      principalId: enrollment.principalId,
      enrollmentId: enrollment.id,
      sessionId: "sc.gate.ses",
    });
    const assertion = mgr.assertFactor({
      id: "mfa.gate.ast",
      challengeId: challenge.id,
      code: "123456",
      expectedCode: "123456",
    });
    const recovery = mgr.issueRecoveryCodes({
      principalId: enrollment.principalId,
      count: 3,
    });

    const readiness = mgr.evaluateReadiness();
    const registry = getMfaRegistryManifest();

    const ok =
      assertion.result === "PASS" &&
      recovery.length === 3 &&
      readiness.verdict === "READY" &&
      registry.foundationId === PRODUCT_MFA_SECURITY_ID &&
      registry.base === PRODUCT_MFA_SECURITY_BASE &&
      registry.enrollmentCount >= 1 &&
      registry.challengeCount >= 1 &&
      registry.assertionCount >= 1 &&
      registry.recoveryCount >= 3;

    try {
      assertMfaSecurityReadinessReady(readiness);
      checks.push(
        check(
          "MFA-STACK",
          "factor",
          "Enrollment / challenge / assertion / recovery",
          ok,
          `readiness=${readiness.verdict} assertion=${assertion.result}`,
        ),
      );
    } catch (error) {
      checks.push(
        check(
          "MFA-STACK",
          "factor",
          "Enrollment / challenge / assertion / recovery",
          false,
          error instanceof Error
            ? error.message
            : "product mfa not ready",
        ),
      );
    }

    mgr.stop();
    cleanup();
  } catch (error) {
    checks.push(
      check(
        "MFA-STACK",
        "factor",
        "Enrollment / challenge / assertion / recovery",
        false,
        error instanceof Error
          ? error.message
          : "product mfa probe failed",
      ),
    );
    cleanup();
  }

  const passCount = checks.filter((c) => c.ok).length;
  const failCount = checks.filter((c) => !c.ok).length;
  const result: GateVerdict = failCount === 0 ? "PASS" : "FAIL";

  return {
    result,
    passCount,
    failCount,
    checks,
    summary: [
      `product-mfa-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertProductMfaReleaseGatePass(
  gate: ReleaseGateResult = checkProductMfaReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(`Product MFA release gate failed: ${gate.summary}`);
  }
}

/**
 * Product Session — Session Control Release Gate
 * MODULE: Session
 * BASE: enterprise-product-authorization-rbac-v1
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
import {
  SESSION_LIFECYCLE_STATUSES,
  SESSION_MANAGER_STATUSES,
  SESSION_READINESS_VERDICTS,
  TOKEN_FLOW_KINDS,
  TOKEN_FLOW_STATUSES,
  VALIDATION_RESULTS,
  PRODUCT_SESSION_CONTROL_BASE,
  PRODUCT_SESSION_CONTROL_FREEZE_VERSION,
  PRODUCT_SESSION_CONTROL_ID,
  PRODUCT_SESSION_CONTROL_VERSION,
  PRODUCT_SESSION_FREEZE_VERSION,
} from "../control/control.constants";
import {
  assertSessionControlReadinessReady,
  clearSessionControlLayer,
  createSessionManager,
  getSessionRegistryManifest,
} from "../session.manager";

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

export const PRODUCT_SESSION_SIGNOFF_VERSION =
  "product-session-signoff-1" as const;

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
  clearSessionControlLayer();
}

export function checkProductSessionReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];

  checks.push(
    check(
      "SC-CONSTANTS",
      "control",
      "Product session control version constants",
      PRODUCT_SESSION_CONTROL_ID ===
        "enterprise-product-session-control-v1" &&
        PRODUCT_SESSION_CONTROL_VERSION === "product-session-1" &&
        PRODUCT_SESSION_CONTROL_BASE === PRODUCT_AUTHORIZATION_RBAC_ID &&
        PRODUCT_SESSION_CONTROL_FREEZE_VERSION ===
          "product-session-control-freeze-1" &&
        PRODUCT_SESSION_FREEZE_VERSION ===
          "product-session-control-freeze-1" &&
        SESSION_LIFECYCLE_STATUSES.length === 4 &&
        TOKEN_FLOW_KINDS.length === 3 &&
        TOKEN_FLOW_STATUSES.length === 4 &&
        VALIDATION_RESULTS.length === 3 &&
        SESSION_READINESS_VERDICTS.length === 3 &&
        SESSION_MANAGER_STATUSES.length === 4,
      `id=${PRODUCT_SESSION_CONTROL_ID} base=${PRODUCT_SESSION_CONTROL_BASE}`,
    ),
  );

  const platform = buildPlatformV1Manifest();
  checks.push(
    check(
      "SC-PLATFORM",
      "platform-v1",
      "Platform v1 baseline aligned",
      platform.aligned === true,
      platform.summary,
    ),
  );

  checks.push(
    check(
      "SC-AZ-BASE",
      "product-authorization",
      "Authorization RBAC BASE preserved",
      PRODUCT_SESSION_CONTROL_BASE ===
        "enterprise-product-authorization-rbac-v1" &&
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
      `base=${PRODUCT_SESSION_CONTROL_BASE}`,
    ),
  );

  checks.push(
    check(
      "SC-UPSTREAM",
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
    const mgr = createSessionManager({ managerId: "prod-sc-gate" });
    mgr.initialize();
    mgr.start();

    const session = mgr.openSession({
      id: "sc.gate.ses",
      principalId: "id.gate.prn",
      authId: "id.gate.auth",
    });
    const access = mgr.issueToken({
      id: "sc.gate.access",
      sessionId: session.id,
      kind: "ACCESS",
    });
    const refresh = mgr.issueToken({
      id: "sc.gate.refresh",
      sessionId: session.id,
      kind: "REFRESH",
    });
    mgr.recordRefresh({
      id: "sc.gate.ref",
      sessionId: session.id,
      accessTokenId: access.id,
      refreshTokenId: refresh.id,
    });
    const validation = mgr.validateSession({
      id: "sc.gate.val",
      sessionId: session.id,
      tokenId: access.id,
    });

    const readiness = mgr.evaluateReadiness();
    const registry = getSessionRegistryManifest();

    const ok =
      validation.result === "VALID" &&
      readiness.verdict === "READY" &&
      registry.foundationId === PRODUCT_SESSION_CONTROL_ID &&
      registry.base === PRODUCT_SESSION_CONTROL_BASE &&
      registry.sessionCount >= 1 &&
      registry.tokenCount >= 2 &&
      registry.refreshCount >= 1 &&
      registry.validationCount >= 1;

    try {
      assertSessionControlReadinessReady(readiness);
      checks.push(
        check(
          "SC-STACK",
          "control",
          "Lifecycle / token / refresh / validation",
          ok,
          `readiness=${readiness.verdict} validation=${validation.result}`,
        ),
      );
    } catch (error) {
      checks.push(
        check(
          "SC-STACK",
          "control",
          "Lifecycle / token / refresh / validation",
          false,
          error instanceof Error
            ? error.message
            : "product session not ready",
        ),
      );
    }

    mgr.stop();
    cleanup();
  } catch (error) {
    checks.push(
      check(
        "SC-STACK",
        "control",
        "Lifecycle / token / refresh / validation",
        false,
        error instanceof Error
          ? error.message
          : "product session probe failed",
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
      `product-session-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertProductSessionReleaseGatePass(
  gate: ReleaseGateResult = checkProductSessionReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(
      `Product session release gate failed: ${gate.summary}`,
    );
  }
}

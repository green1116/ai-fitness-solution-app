/**
 * Product Authorization — RBAC Release Gate
 * MODULE: Authorization
 * BASE: enterprise-product-identity-foundation-v1
 */

import { buildPlatformV1Manifest } from "../../../platform/v1/platform.manifest";
import { E12_PRODUCTIZATION_COMPLETE_ID } from "../../e12/signoff/governance.freeze.lock";
import { ENTERPRISE_LAUNCH_COMPLETE_ID } from "../../../launch/signoff/governance.freeze.lock";
import { ENTERPRISE_EVOLUTION_COMPLETE_ID } from "../../../evolution/signoff/governance.freeze.lock";
import { ENTERPRISE_COMMERCIALIZATION_COMPLETE_ID } from "../../../commercialization/p8/freeze/freeze.lock";
import { ENTERPRISE_LAUNCH_READINESS_COMPLETE_ID } from "../../../launch/readiness/l5/freeze/freeze.lock";
import { ENTERPRISE_OPERATIONS_COMPLETE_ID } from "../../../operations/o5/freeze/freeze.lock";
import { ENTERPRISE_PRODUCT_COMPLETE_ID } from "../../complete/freeze/freeze.lock";
import { PRODUCT_IDENTITY_FOUNDATION_ID } from "../../identity/authentication/authentication.constants";
import { PRODUCT_ITERATION_FOUNDATION_ID } from "../../iteration/cycle/cycle.constants";
import {
  assertAuthorizationRbacReadinessReady,
  clearAuthorizationRbacLayer,
  createAuthorizationManager,
  getAuthorizationRegistryManifest,
} from "../authorization.manager";
import {
  ASSIGNMENT_STATUSES,
  AUTHORIZATION_MANAGER_STATUSES,
  AUTHORIZATION_READINESS_VERDICTS,
  DECISION_RESULTS,
  PERMISSION_EFFECTS,
  PRODUCT_AUTHORIZATION_FREEZE_VERSION,
  PRODUCT_AUTHORIZATION_RBAC_BASE,
  PRODUCT_AUTHORIZATION_RBAC_FREEZE_VERSION,
  PRODUCT_AUTHORIZATION_RBAC_ID,
  PRODUCT_AUTHORIZATION_RBAC_VERSION,
  ROLE_KINDS,
} from "../rbac/rbac.constants";

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

export const PRODUCT_AUTHORIZATION_SIGNOFF_VERSION =
  "product-authorization-signoff-1" as const;

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
  clearAuthorizationRbacLayer();
}

export function checkProductAuthorizationReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];

  checks.push(
    check(
      "AZ-CONSTANTS",
      "rbac",
      "Product authorization RBAC version constants",
      PRODUCT_AUTHORIZATION_RBAC_ID ===
        "enterprise-product-authorization-rbac-v1" &&
        PRODUCT_AUTHORIZATION_RBAC_VERSION === "product-authorization-1" &&
        PRODUCT_AUTHORIZATION_RBAC_BASE === PRODUCT_IDENTITY_FOUNDATION_ID &&
        PRODUCT_AUTHORIZATION_RBAC_FREEZE_VERSION ===
          "product-authorization-rbac-freeze-1" &&
        PRODUCT_AUTHORIZATION_FREEZE_VERSION ===
          "product-authorization-rbac-freeze-1" &&
        ROLE_KINDS.length === 4 &&
        PERMISSION_EFFECTS.length === 2 &&
        ASSIGNMENT_STATUSES.length === 3 &&
        DECISION_RESULTS.length === 2 &&
        AUTHORIZATION_READINESS_VERDICTS.length === 3 &&
        AUTHORIZATION_MANAGER_STATUSES.length === 4,
      `id=${PRODUCT_AUTHORIZATION_RBAC_ID} base=${PRODUCT_AUTHORIZATION_RBAC_BASE}`,
    ),
  );

  const platform = buildPlatformV1Manifest();
  checks.push(
    check(
      "AZ-PLATFORM",
      "platform-v1",
      "Platform v1 baseline aligned",
      platform.aligned === true,
      platform.summary,
    ),
  );

  checks.push(
    check(
      "AZ-ID-BASE",
      "product-identity",
      "Identity foundation BASE preserved",
      PRODUCT_AUTHORIZATION_RBAC_BASE ===
        "enterprise-product-identity-foundation-v1" &&
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
      `base=${PRODUCT_AUTHORIZATION_RBAC_BASE}`,
    ),
  );

  checks.push(
    check(
      "AZ-UPSTREAM",
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
    const mgr = createAuthorizationManager({ managerId: "prod-az-gate" });
    mgr.initialize();
    mgr.start();

    const role = mgr.registerRole({
      id: "az.gate.role",
      kind: "OPERATOR",
      name: "Workspace Operator",
    });
    const permission = mgr.registerPermission({
      id: "az.gate.perm",
      key: "workspace:read",
      resource: "workspace",
      action: "read",
      effect: "ALLOW",
    });
    mgr.grantPermission({
      id: "az.gate.grant",
      roleId: role.id,
      permissionId: permission.id,
    });
    mgr.assignRole({
      id: "az.gate.asn",
      principalId: "id.gate.prn",
      roleId: role.id,
    });
    const decision = mgr.authorize({
      id: "az.gate.dec",
      principalId: "id.gate.prn",
      resource: "workspace",
      action: "read",
    });

    const readiness = mgr.evaluateReadiness();
    const registry = getAuthorizationRegistryManifest();

    const ok =
      decision.result === "ALLOW" &&
      readiness.verdict === "READY" &&
      registry.foundationId === PRODUCT_AUTHORIZATION_RBAC_ID &&
      registry.base === PRODUCT_AUTHORIZATION_RBAC_BASE &&
      registry.roleCount >= 1 &&
      registry.permissionCount >= 1 &&
      registry.grantCount >= 1 &&
      registry.assignmentCount >= 1 &&
      registry.decisionCount >= 1;

    try {
      assertAuthorizationRbacReadinessReady(readiness);
      checks.push(
        check(
          "AZ-STACK",
          "rbac",
          "Role / permission / grant / assignment / decision",
          ok,
          `readiness=${readiness.verdict} decision=${decision.result}`,
        ),
      );
    } catch (error) {
      checks.push(
        check(
          "AZ-STACK",
          "rbac",
          "Role / permission / grant / assignment / decision",
          false,
          error instanceof Error
            ? error.message
            : "product authorization not ready",
        ),
      );
    }

    mgr.stop();
    cleanup();
  } catch (error) {
    checks.push(
      check(
        "AZ-STACK",
        "rbac",
        "Role / permission / grant / assignment / decision",
        false,
        error instanceof Error
          ? error.message
          : "product authorization probe failed",
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
      `product-authorization-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertProductAuthorizationReleaseGatePass(
  gate: ReleaseGateResult = checkProductAuthorizationReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(
      `Product authorization release gate failed: ${gate.summary}`,
    );
  }
}

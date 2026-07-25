/**
 * Product Identity — Identity Foundation Release Gate
 * MODULE: Authentication
 * BASE: enterprise-product-iteration-foundation-v1
 */

import { buildPlatformV1Manifest } from "../../../platform/v1/platform.manifest";
import { E12_PRODUCTIZATION_COMPLETE_ID } from "../../e12/signoff/governance.freeze.lock";
import { ENTERPRISE_LAUNCH_COMPLETE_ID } from "../../../launch/signoff/governance.freeze.lock";
import { ENTERPRISE_EVOLUTION_COMPLETE_ID } from "../../../evolution/signoff/governance.freeze.lock";
import { ENTERPRISE_COMMERCIALIZATION_COMPLETE_ID } from "../../../commercialization/p8/freeze/freeze.lock";
import { ENTERPRISE_LAUNCH_READINESS_COMPLETE_ID } from "../../../launch/readiness/l5/freeze/freeze.lock";
import { ENTERPRISE_OPERATIONS_COMPLETE_ID } from "../../../operations/o5/freeze/freeze.lock";
import { ENTERPRISE_PRODUCT_COMPLETE_ID } from "../../complete/freeze/freeze.lock";
import { PRODUCT_ITERATION_FOUNDATION_ID } from "../../iteration/cycle/cycle.constants";
import {
  ACCESS_DECISIONS,
  AUTH_STATUSES,
  CREDENTIAL_KINDS,
  IDENTITY_MANAGER_STATUSES,
  IDENTITY_READINESS_VERDICTS,
  PRINCIPAL_KINDS,
  PRODUCT_IDENTITY_FOUNDATION_BASE,
  PRODUCT_IDENTITY_FOUNDATION_FREEZE_VERSION,
  PRODUCT_IDENTITY_FOUNDATION_ID,
  PRODUCT_IDENTITY_FOUNDATION_VERSION,
  PRODUCT_IDENTITY_FREEZE_VERSION,
  SESSION_STATUSES,
  TOKEN_KINDS,
} from "../authentication/authentication.constants";
import {
  assertIdentityFoundationReadinessReady,
  clearIdentityFoundationLayer,
  createIdentityManager,
  getIdentityRegistryManifest,
} from "../identity.manager";

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

export const PRODUCT_IDENTITY_SIGNOFF_VERSION =
  "product-identity-signoff-1" as const;

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
  clearIdentityFoundationLayer();
}

export function checkProductIdentityReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];

  checks.push(
    check(
      "ID-CONSTANTS",
      "authentication",
      "Product identity foundation version constants",
      PRODUCT_IDENTITY_FOUNDATION_ID ===
        "enterprise-product-identity-foundation-v1" &&
        PRODUCT_IDENTITY_FOUNDATION_VERSION === "product-identity-1" &&
        PRODUCT_IDENTITY_FOUNDATION_BASE === PRODUCT_ITERATION_FOUNDATION_ID &&
        PRODUCT_IDENTITY_FOUNDATION_FREEZE_VERSION ===
          "product-identity-foundation-freeze-1" &&
        PRODUCT_IDENTITY_FREEZE_VERSION ===
          "product-identity-foundation-freeze-1" &&
        AUTH_STATUSES.length === 5 &&
        PRINCIPAL_KINDS.length === 4 &&
        CREDENTIAL_KINDS.length === 4 &&
        SESSION_STATUSES.length === 3 &&
        TOKEN_KINDS.length === 3 &&
        ACCESS_DECISIONS.length === 3 &&
        IDENTITY_READINESS_VERDICTS.length === 3 &&
        IDENTITY_MANAGER_STATUSES.length === 4,
      `id=${PRODUCT_IDENTITY_FOUNDATION_ID} base=${PRODUCT_IDENTITY_FOUNDATION_BASE}`,
    ),
  );

  const platform = buildPlatformV1Manifest();
  checks.push(
    check(
      "ID-PLATFORM",
      "platform-v1",
      "Platform v1 baseline aligned",
      platform.aligned === true,
      platform.summary,
    ),
  );

  checks.push(
    check(
      "ID-ITER-BASE",
      "product-iteration",
      "Iteration foundation BASE preserved",
      PRODUCT_IDENTITY_FOUNDATION_BASE ===
        "enterprise-product-iteration-foundation-v1" &&
        ENTERPRISE_PRODUCT_COMPLETE_ID === "enterprise-product-complete-v1" &&
        ENTERPRISE_OPERATIONS_COMPLETE_ID ===
          "enterprise-operations-complete-v1" &&
        ENTERPRISE_LAUNCH_READINESS_COMPLETE_ID ===
          "enterprise-launch-readiness-complete-v1" &&
        ENTERPRISE_COMMERCIALIZATION_COMPLETE_ID ===
          "enterprise-commercialization-complete-v1",
      `base=${PRODUCT_IDENTITY_FOUNDATION_BASE}`,
    ),
  );

  checks.push(
    check(
      "ID-UPSTREAM",
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
    const mgr = createIdentityManager({ managerId: "prod-id-gate" });
    mgr.initialize();
    mgr.start();

    const principal = mgr.registerPrincipal({
      id: "id.gate.prn",
      kind: "USER",
      subject: "ae.sam@acme.example",
      displayName: "Sam AE",
    });
    mgr.issueCredential({
      id: "id.gate.crd",
      principalId: principal.id,
      kind: "PASSWORD",
      label: "primary password",
    });
    const auth = mgr.authenticate({
      id: "id.gate.auth",
      principalId: principal.id,
      method: "PASSWORD",
    });
    const session = mgr.openSession({
      id: "id.gate.ses",
      principalId: principal.id,
      authId: auth.id,
    });
    mgr.issueToken({
      id: "id.gate.tok",
      sessionId: session.id,
      kind: "ACCESS",
    });
    mgr.evaluateAccess({
      id: "id.gate.acc",
      principalId: principal.id,
      resource: "workspace",
      action: "read",
      decision: "ALLOW",
    });

    const readiness = mgr.evaluateReadiness();
    const registry = getIdentityRegistryManifest();

    const ok =
      readiness.verdict === "READY" &&
      registry.foundationId === PRODUCT_IDENTITY_FOUNDATION_ID &&
      registry.base === PRODUCT_IDENTITY_FOUNDATION_BASE &&
      registry.principalCount >= 1 &&
      registry.credentialCount >= 1 &&
      registry.authCount >= 1 &&
      registry.sessionCount >= 1 &&
      registry.tokenCount >= 1 &&
      registry.accessCount >= 1;

    try {
      assertIdentityFoundationReadinessReady(readiness);
      checks.push(
        check(
          "ID-STACK",
          "authentication",
          "Principal / credential / auth / session / token / access",
          ok,
          `readiness=${readiness.verdict} sessions=${registry.sessionCount}`,
        ),
      );
    } catch (error) {
      checks.push(
        check(
          "ID-STACK",
          "authentication",
          "Principal / credential / auth / session / token / access",
          false,
          error instanceof Error
            ? error.message
            : "product identity not ready",
        ),
      );
    }

    mgr.stop();
    cleanup();
  } catch (error) {
    checks.push(
      check(
        "ID-STACK",
        "authentication",
        "Principal / credential / auth / session / token / access",
        false,
        error instanceof Error
          ? error.message
          : "product identity probe failed",
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
      `product-identity-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertProductIdentityReleaseGatePass(
  gate: ReleaseGateResult = checkProductIdentityReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(
      `Product identity release gate failed: ${gate.summary}`,
    );
  }
}

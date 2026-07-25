/**
 * Product SSO — Enterprise SSO Federation Release Gate
 * MODULE: SSO
 * BASE: enterprise-product-mfa-security-v1
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
import { PRODUCT_MFA_SECURITY_ID } from "../../mfa/factor/factor.constants";
import { PRODUCT_SESSION_CONTROL_ID } from "../../session/control/control.constants";
import {
  PRODUCT_SSO_FEDERATION_BASE,
  PRODUCT_SSO_FEDERATION_FREEZE_VERSION,
  PRODUCT_SSO_FEDERATION_ID,
  PRODUCT_SSO_FEDERATION_VERSION,
  PRODUCT_SSO_FREEZE_VERSION,
  SSO_ASSERTION_RESULTS,
  SSO_CONNECTION_STATUSES,
  SSO_MANAGER_STATUSES,
  SSO_PROVIDER_PROTOCOLS,
  SSO_PROVIDER_STATUSES,
  SSO_READINESS_VERDICTS,
} from "../federation/federation.constants";
import {
  assertSsoFederationReadinessReady,
  clearSsoFederationLayer,
  createSsoManager,
  getSsoRegistryManifest,
} from "../sso.manager";

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

export const PRODUCT_SSO_SIGNOFF_VERSION =
  "product-sso-signoff-1" as const;

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
  clearSsoFederationLayer();
}

export function checkProductSsoReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];

  checks.push(
    check(
      "SSO-CONSTANTS",
      "federation",
      "Product SSO federation version constants",
      PRODUCT_SSO_FEDERATION_ID ===
        "enterprise-product-sso-federation-v1" &&
        PRODUCT_SSO_FEDERATION_VERSION === "product-sso-1" &&
        PRODUCT_SSO_FEDERATION_BASE === PRODUCT_MFA_SECURITY_ID &&
        PRODUCT_SSO_FEDERATION_FREEZE_VERSION ===
          "product-sso-federation-freeze-1" &&
        PRODUCT_SSO_FREEZE_VERSION === "product-sso-federation-freeze-1" &&
        SSO_PROVIDER_PROTOCOLS.length === 3 &&
        SSO_PROVIDER_STATUSES.length === 3 &&
        SSO_CONNECTION_STATUSES.length === 3 &&
        SSO_ASSERTION_RESULTS.length === 2 &&
        SSO_READINESS_VERDICTS.length === 3 &&
        SSO_MANAGER_STATUSES.length === 4,
      `id=${PRODUCT_SSO_FEDERATION_ID} base=${PRODUCT_SSO_FEDERATION_BASE}`,
    ),
  );

  const platform = buildPlatformV1Manifest();
  checks.push(
    check(
      "SSO-PLATFORM",
      "platform-v1",
      "Platform v1 baseline aligned",
      platform.aligned === true,
      platform.summary,
    ),
  );

  checks.push(
    check(
      "SSO-MFA-BASE",
      "product-mfa",
      "MFA security BASE preserved",
      PRODUCT_SSO_FEDERATION_BASE ===
        "enterprise-product-mfa-security-v1" &&
        PRODUCT_MFA_SECURITY_ID === "enterprise-product-mfa-security-v1" &&
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
      `base=${PRODUCT_SSO_FEDERATION_BASE}`,
    ),
  );

  checks.push(
    check(
      "SSO-UPSTREAM",
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
    const mgr = createSsoManager({ managerId: "prod-sso-gate" });
    mgr.initialize();
    mgr.start();

    const provider = mgr.registerProvider({
      id: "sso.gate.prv",
      name: "Acme IdP",
      protocol: "OIDC",
      issuer: "https://idp.acme.example",
    });
    mgr.activateProvider({ providerId: provider.id });
    mgr.linkConnection({
      id: "sso.gate.conn",
      principalId: "id.gate.prn",
      providerId: provider.id,
      externalSubject: "sam@acme.example",
    });
    const assertion = mgr.federateAssertion({
      id: "sso.gate.ast",
      providerId: provider.id,
      externalSubject: "sam@acme.example",
      accept: true,
    });
    const exchange = mgr.exchangeSession({
      id: "sso.gate.xch",
      assertionId: assertion.id,
      sessionId: "sc.gate.ses",
    });

    const readiness = mgr.evaluateReadiness();
    const registry = getSsoRegistryManifest();

    const ok =
      assertion.result === "ACCEPT" &&
      exchange.sessionId === "sc.gate.ses" &&
      readiness.verdict === "READY" &&
      registry.foundationId === PRODUCT_SSO_FEDERATION_ID &&
      registry.base === PRODUCT_SSO_FEDERATION_BASE &&
      registry.providerCount >= 1 &&
      registry.connectionCount >= 1 &&
      registry.assertionCount >= 1 &&
      registry.exchangeCount >= 1;

    try {
      assertSsoFederationReadinessReady(readiness);
      checks.push(
        check(
          "SSO-STACK",
          "federation",
          "Provider / connection / assertion / exchange",
          ok,
          `readiness=${readiness.verdict} assertion=${assertion.result}`,
        ),
      );
    } catch (error) {
      checks.push(
        check(
          "SSO-STACK",
          "federation",
          "Provider / connection / assertion / exchange",
          false,
          error instanceof Error
            ? error.message
            : "product sso not ready",
        ),
      );
    }

    mgr.stop();
    cleanup();
  } catch (error) {
    checks.push(
      check(
        "SSO-STACK",
        "federation",
        "Provider / connection / assertion / exchange",
        false,
        error instanceof Error
          ? error.message
          : "product sso probe failed",
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
      `product-sso-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertProductSsoReleaseGatePass(
  gate: ReleaseGateResult = checkProductSsoReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(`Product SSO release gate failed: ${gate.summary}`);
  }
}

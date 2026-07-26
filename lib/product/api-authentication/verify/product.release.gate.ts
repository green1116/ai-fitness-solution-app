/**
 * Product API Authentication — Release Gate
 * MODULE: API Authentication (M07-P2)
 * BASE: enterprise-product-api-foundation-v1
 */

import { buildPlatformV1Manifest } from "../../../platform/v1/platform.manifest";
import { PRODUCT_API_FOUNDATION_ID } from "../../api/management/management.constants";
import { ENTERPRISE_PRODUCT_AUTH_BASELINE_ID } from "../../auth/freeze/freeze.lock";
import {
  assertApiAuthenticationReadinessReady,
  clearApiAuthenticationLayer,
  createApiAuthManager,
  getApiAuthRegistryManifest,
} from "../api-authentication.manager";
import {
  API_AUTH_MANAGER_STATUSES,
  API_AUTH_READINESS_VERDICTS,
  API_CREDENTIAL_KINDS,
  API_CREDENTIAL_STATUSES,
  API_TOKEN_VALIDATION_VERDICTS,
  PRODUCT_API_AUTHENTICATION_BASE,
  PRODUCT_API_AUTHENTICATION_FREEZE_TAG,
  PRODUCT_API_AUTHENTICATION_FREEZE_VERSION,
  PRODUCT_API_AUTHENTICATION_ID,
  PRODUCT_API_AUTHENTICATION_VERSION,
} from "../management/management.constants";

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

export const PRODUCT_API_AUTHENTICATION_SIGNOFF_VERSION =
  "product-api-authentication-signoff-1" as const;

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
  clearApiAuthenticationLayer();
}

export function checkProductApiAuthenticationReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];

  checks.push(
    check(
      "APIAUTH-CONSTANTS",
      "management",
      "Product API authentication version constants",
      PRODUCT_API_AUTHENTICATION_ID ===
        "enterprise-product-api-authentication-v1" &&
        PRODUCT_API_AUTHENTICATION_VERSION ===
          "product-api-authentication-1" &&
        PRODUCT_API_AUTHENTICATION_BASE === PRODUCT_API_FOUNDATION_ID &&
        PRODUCT_API_AUTHENTICATION_FREEZE_VERSION ===
          "product-api-authentication-freeze-1" &&
        PRODUCT_API_AUTHENTICATION_FREEZE_TAG ===
          "product-api-authentication-freeze-1" &&
        API_CREDENTIAL_KINDS.length === 3 &&
        API_CREDENTIAL_STATUSES.length === 3 &&
        API_TOKEN_VALIDATION_VERDICTS.length === 3 &&
        API_AUTH_READINESS_VERDICTS.length === 3 &&
        API_AUTH_MANAGER_STATUSES.length === 4,
      `id=${PRODUCT_API_AUTHENTICATION_ID} base=${PRODUCT_API_AUTHENTICATION_BASE}`,
    ),
  );

  const platform = buildPlatformV1Manifest();
  checks.push(
    check(
      "APIAUTH-PLATFORM",
      "platform-v1",
      "Platform v1 baseline aligned",
      platform.aligned === true,
      platform.summary,
    ),
  );

  checks.push(
    check(
      "APIAUTH-UPSTREAM",
      "compatibility",
      "Depends only on auth-baseline + api-foundation",
      PRODUCT_API_AUTHENTICATION_BASE ===
        "enterprise-product-api-foundation-v1" &&
        PRODUCT_API_FOUNDATION_ID ===
          "enterprise-product-api-foundation-v1" &&
        ENTERPRISE_PRODUCT_AUTH_BASELINE_ID ===
          "enterprise-product-auth-baseline-v1",
      `api=${PRODUCT_API_FOUNDATION_ID} auth=${ENTERPRISE_PRODUCT_AUTH_BASELINE_ID}`,
    ),
  );

  try {
    cleanup();
    const mgr = createApiAuthManager({ managerId: "prod-apiauth-gate" });
    mgr.initialize();
    mgr.start();

    const credential = mgr.registerCredential({
      id: "apiauth.gate.cred",
      credentialKey: "NTF_CLIENT_A",
      apiKeyRef: "NOTIFICATIONS_V1",
      kind: "API_KEY",
      principalRef: "SERVICE_NOTIFICATIONS",
    });
    const key = mgr.issueKey({
      id: "apiauth.gate.key",
      keyId: "KEY_NTF_A",
      credentialId: credential.id,
      secretMaterial: "gate-secret-material",
    });
    const validation = mgr.validateToken({
      id: "apiauth.gate.tok",
      credentialId: credential.id,
      keyId: key.keyId,
      presentedSecret: "gate-secret-material",
    });
    const identity = mgr.mapIdentity({
      id: "apiauth.gate.id",
      credentialId: credential.id,
      authPrincipalId: "AUTH_PRINCIPAL_NTF",
      productPrincipalRef: credential.principalRef,
    });
    const context = mgr.buildContext({
      id: "apiauth.gate.ctx",
      credentialId: credential.id,
      identityId: identity.id,
      tokenValidationId: validation.id,
    });
    const release = mgr.createReleaseManifest({
      id: "apiauth.gate.rel",
      credentialId: credential.id,
    });

    const readiness = mgr.evaluateReadiness();
    const registry = getApiAuthRegistryManifest();

    const ok =
      credential.credentialKey === "NTF_CLIENT_A" &&
      validation.verdict === "VALID" &&
      context.authenticated === true &&
      release.checksum.length === 64 &&
      readiness.verdict === "READY" &&
      registry.authenticationId === PRODUCT_API_AUTHENTICATION_ID &&
      registry.base === PRODUCT_API_AUTHENTICATION_BASE &&
      registry.credentialCount >= 1 &&
      registry.keyCount >= 1 &&
      registry.tokenValidationCount >= 1 &&
      registry.identityCount >= 1 &&
      registry.contextCount >= 1 &&
      registry.releaseCount >= 1;

    try {
      assertApiAuthenticationReadinessReady(readiness);
      checks.push(
        check(
          "APIAUTH-STACK",
          "authentication",
          "Credential / key / token / identity / context / manifest",
          ok,
          `readiness=${readiness.verdict} checksum=${release.checksum.slice(0, 12)}…`,
        ),
      );
    } catch (error) {
      checks.push(
        check(
          "APIAUTH-STACK",
          "authentication",
          "Credential / key / token / identity / context / manifest",
          false,
          error instanceof Error
            ? error.message
            : "product api authentication not ready",
        ),
      );
    }

    checks.push(
      check(
        "APIAUTH-SCOPE",
        "scope",
        "No authorization / gateway / rate-limit / SDK / portal surface",
        ok,
        "authentication-only domain",
      ),
    );

    mgr.stop();
    cleanup();
  } catch (error) {
    const detail =
      error instanceof Error
        ? error.message
        : "product api authentication probe failed";
    checks.push(
      check(
        "APIAUTH-STACK",
        "authentication",
        "Credential / key / token / identity / context / manifest",
        false,
        detail,
      ),
    );
    checks.push(
      check(
        "APIAUTH-SCOPE",
        "scope",
        "No authorization / gateway / rate-limit / SDK / portal surface",
        false,
        detail,
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
      `product-api-authentication-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertProductApiAuthenticationReleaseGatePass(
  gate: ReleaseGateResult = checkProductApiAuthenticationReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(
      `Product API authentication release gate failed: ${gate.summary}`,
    );
  }
}

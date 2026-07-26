/**
 * Product API Authentication — readiness
 */

import { ENTERPRISE_PRODUCT_AUTH_BASELINE_ID } from "../../auth/freeze/freeze.lock";
import { PRODUCT_API_FOUNDATION_ID } from "../../api/management/management.constants";
import { listApiAuthenticationContexts } from "../context/context.registry";
import { listApiCredentials } from "../credential/credential.registry";
import { listApiIdentityMappings } from "../identity/identity.registry";
import { listApiAuthKeys } from "../key/key.registry";
import { listApiAuthenticationReleaseManifests } from "../manifest/manifest.registry";
import { PRODUCT_API_AUTHENTICATION_BASE } from "./management.constants";
import type {
  ApiAuthReadinessCheck,
  ApiAuthReadinessResult,
} from "./management.types";
import { listApiTokenValidations } from "../token/token.registry";

function nowIso(): string {
  return new Date().toISOString();
}

function check(
  id: string,
  component: string,
  label: string,
  ok: boolean,
  detail: string,
): ApiAuthReadinessCheck {
  return { id, component, label, ok, detail };
}

export function evaluateApiAuthenticationReadiness(): ApiAuthReadinessResult {
  const checks: ApiAuthReadinessCheck[] = [];

  checks.push(
    check(
      "APIAUTH-BASE",
      "management",
      "API foundation + auth baseline aligned",
      PRODUCT_API_AUTHENTICATION_BASE === PRODUCT_API_FOUNDATION_ID &&
        PRODUCT_API_FOUNDATION_ID ===
          "enterprise-product-api-foundation-v1" &&
        ENTERPRISE_PRODUCT_AUTH_BASELINE_ID ===
          "enterprise-product-auth-baseline-v1",
      `base=${PRODUCT_API_AUTHENTICATION_BASE}`,
    ),
  );

  const credentials = listApiCredentials();
  checks.push(
    check(
      "APIAUTH-CRED",
      "credential",
      "Active credentials present",
      credentials.some((c) => c.status === "ACTIVE"),
      `credentials=${credentials.length}`,
    ),
  );

  const keys = listApiAuthKeys();
  checks.push(
    check(
      "APIAUTH-KEY",
      "key",
      "API keys present",
      keys.length >= 1,
      `keys=${keys.length}`,
    ),
  );

  const validations = listApiTokenValidations();
  checks.push(
    check(
      "APIAUTH-TOK",
      "token",
      "Valid token validations present",
      validations.some((v) => v.verdict === "VALID"),
      `validations=${validations.length}`,
    ),
  );

  const identities = listApiIdentityMappings();
  checks.push(
    check(
      "APIAUTH-ID",
      "identity",
      "Identity mappings present",
      identities.length >= 1,
      `identities=${identities.length}`,
    ),
  );

  const contexts = listApiAuthenticationContexts();
  checks.push(
    check(
      "APIAUTH-CTX",
      "context",
      "Authenticated contexts present",
      contexts.some((c) => c.authenticated === true),
      `contexts=${contexts.length}`,
    ),
  );

  const releases = listApiAuthenticationReleaseManifests();
  checks.push(
    check(
      "APIAUTH-REL",
      "manifest",
      "Release manifests present",
      releases.length >= 1 && releases.every((r) => r.checksum.length === 64),
      `releases=${releases.length}`,
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
    summary: `product-api-authentication readiness ${verdict.toLowerCase()}: pass=${passCount} fail=${failCount}`,
    evaluatedAt: nowIso(),
  };
}

export function assertApiAuthenticationReadinessReady(
  result: ApiAuthReadinessResult,
): asserts result is ApiAuthReadinessResult & { verdict: "READY" } {
  if (result.verdict !== "READY") {
    throw new Error(
      `product api authentication not ready: ${result.summary}`,
    );
  }
}

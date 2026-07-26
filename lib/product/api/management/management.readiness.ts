/**
 * Product API — readiness
 */

import { ENTERPRISE_PRODUCT_NOTIFICATION_BASELINE_ID } from "../../notification-baseline/freeze/freeze.lock";
import { listApiDefinitions } from "../definition/definition.registry";
import { listApiLifecycles } from "../lifecycle/lifecycle.registry";
import { listApiReleaseManifests } from "../manifest/manifest.registry";
import { PRODUCT_API_FOUNDATION_BASE } from "./management.constants";
import type {
  ApiReadinessCheck,
  ApiReadinessResult,
} from "./management.types";
import { listApiPolicies } from "../policy/policy.registry";
import { listApis } from "../registry/api.registry";
import { listApiVersions } from "../version/version.registry";

function nowIso(): string {
  return new Date().toISOString();
}

function check(
  id: string,
  component: string,
  label: string,
  ok: boolean,
  detail: string,
): ApiReadinessCheck {
  return { id, component, label, ok, detail };
}

export function evaluateApiFoundationReadiness(): ApiReadinessResult {
  const checks: ApiReadinessCheck[] = [];

  checks.push(
    check(
      "API-BASE",
      "management",
      "Notification baseline aligned",
      PRODUCT_API_FOUNDATION_BASE ===
        ENTERPRISE_PRODUCT_NOTIFICATION_BASELINE_ID &&
        ENTERPRISE_PRODUCT_NOTIFICATION_BASELINE_ID ===
          "enterprise-product-notification-baseline-v1",
      `base=${PRODUCT_API_FOUNDATION_BASE}`,
    ),
  );

  const apis = listApis();
  checks.push(
    check(
      "API-REG",
      "registry",
      "APIs registered",
      apis.length >= 1,
      `apis=${apis.length}`,
    ),
  );

  const definitions = listApiDefinitions();
  checks.push(
    check(
      "API-DEF",
      "definition",
      "Definitions present",
      definitions.length >= 1,
      `definitions=${definitions.length}`,
    ),
  );

  const versions = listApiVersions();
  checks.push(
    check(
      "API-VER",
      "version",
      "Versions present",
      versions.length >= 1,
      `versions=${versions.length}`,
    ),
  );

  const lifecycles = listApiLifecycles();
  checks.push(
    check(
      "API-LC",
      "lifecycle",
      "Published lifecycles present",
      lifecycles.some((l) => l.state === "PUBLISHED"),
      `lifecycles=${lifecycles.length}`,
    ),
  );

  const policies = listApiPolicies();
  checks.push(
    check(
      "API-POL",
      "policy",
      "Policies present",
      policies.length >= 1,
      `policies=${policies.length}`,
    ),
  );

  const releases = listApiReleaseManifests();
  checks.push(
    check(
      "API-REL",
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
    summary: `product-api readiness ${verdict.toLowerCase()}: pass=${passCount} fail=${failCount}`,
    evaluatedAt: nowIso(),
  };
}

export function assertApiFoundationReadinessReady(
  result: ApiReadinessResult,
): asserts result is ApiReadinessResult & { verdict: "READY" } {
  if (result.verdict !== "READY") {
    throw new Error(`product api foundation not ready: ${result.summary}`);
  }
}

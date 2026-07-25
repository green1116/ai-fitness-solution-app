/**
 * Product P11 — Commercial Release readiness
 */

import { PRODUCT_P10_SUBSCRIPTION_BILLING_ID } from "../../p10/subscription/subscription.constants";
import { listDeployments } from "../deployment/deployment.registry";
import { listEnvironments } from "../environment/environment.registry";
import { listFeatures } from "../feature/feature.registry";
import { listLicenses } from "../license/license.registry";
import { listTenants } from "../tenant/tenant.registry";
import { listVersions } from "../version/version.registry";
import { PRODUCT_P11_COMMERCIAL_RELEASE_BASE } from "./release.constants";
import { listReleases } from "./release.registry";
import type { P11ReadinessCheck, P11ReadinessResult } from "./release.types";

function nowIso(): string {
  return new Date().toISOString();
}

function check(
  id: string,
  component: string,
  label: string,
  ok: boolean,
  detail: string,
): P11ReadinessCheck {
  return { id, component, label, ok, detail };
}

export function evaluateP11CommercialReleaseReadiness(): P11ReadinessResult {
  const checks: P11ReadinessCheck[] = [];

  checks.push(
    check(
      "P11-BASE",
      "foundation",
      "P10 subscription & billing baseline aligned",
      PRODUCT_P11_COMMERCIAL_RELEASE_BASE ===
        PRODUCT_P10_SUBSCRIPTION_BILLING_ID,
      `base=${PRODUCT_P11_COMMERCIAL_RELEASE_BASE}`,
    ),
  );

  const releases = listReleases();
  checks.push(
    check(
      "P11-REL",
      "release",
      "Releases present",
      releases.length >= 1,
      `releases=${releases.length}`,
    ),
  );

  const features = listFeatures();
  checks.push(
    check(
      "P11-FT",
      "feature",
      "Features GA or beta",
      features.some((f) => f.flag === "GA" || f.flag === "BETA"),
      `features=${features.length}`,
    ),
  );

  const versions = listVersions();
  checks.push(
    check(
      "P11-VER",
      "version",
      "Versions published",
      versions.length >= 1,
      `versions=${versions.length}`,
    ),
  );

  const tenants = listTenants();
  checks.push(
    check(
      "P11-TNT",
      "tenant",
      "Tenants active",
      tenants.some((t) => t.status === "ACTIVE"),
      `tenants=${tenants.length}`,
    ),
  );

  const environments = listEnvironments();
  checks.push(
    check(
      "P11-ENV",
      "environment",
      "Environments present",
      environments.length >= 1,
      `environments=${environments.length}`,
    ),
  );

  const deployments = listDeployments();
  checks.push(
    check(
      "P11-DEP",
      "deployment",
      "Deployments succeeded",
      deployments.some((d) => d.status === "SUCCEEDED"),
      `deployments=${deployments.length}`,
    ),
  );

  const licenses = listLicenses();
  checks.push(
    check(
      "P11-LIC",
      "license",
      "Licenses active",
      licenses.some((l) => l.status === "ACTIVE" || l.status === "ISSUED"),
      `licenses=${licenses.length}`,
    ),
  );

  const live = releases.some(
    (r) => r.status === "LIVE" || r.status === "STAGED",
  );
  checks.push(
    check(
      "P11-LIFE",
      "release",
      "Release lifecycle advanced",
      live,
      `live=${live}`,
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
    summary: `p11-commercial-release readiness ${verdict.toLowerCase()}: pass=${passCount} fail=${failCount}`,
    evaluatedAt: nowIso(),
  };
}

export function assertP11CommercialReleaseReadinessReady(
  result: P11ReadinessResult,
): asserts result is P11ReadinessResult & { verdict: "READY" } {
  if (result.verdict !== "READY") {
    throw new Error(`p11 commercial release not ready: ${result.summary}`);
  }
}

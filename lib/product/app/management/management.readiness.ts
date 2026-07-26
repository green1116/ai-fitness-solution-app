/**
 * Product App — readiness
 */

import { PRODUCT_PARTNER_MANAGEMENT_ID } from "../../partner/management/management.constants";
import { listAppDefinitions } from "../definition/definition.registry";
import { listAppReleaseManifests } from "../manifest/manifest.registry";
import { listAppOwnerships } from "../ownership/ownership.registry";
import { listApps } from "../registry/app.registry";
import { listAppVersions } from "../version/version.registry";
import { PRODUCT_APP_REGISTRY_BASE } from "./management.constants";
import type {
  AppReadinessCheck,
  AppReadinessResult,
} from "./management.types";

function nowIso(): string {
  return new Date().toISOString();
}

function check(
  id: string,
  component: string,
  label: string,
  ok: boolean,
  detail: string,
): AppReadinessCheck {
  return { id, component, label, ok, detail };
}

export function evaluateAppRegistryReadiness(): AppReadinessResult {
  const checks: AppReadinessCheck[] = [];

  checks.push(
    check(
      "APP-BASE",
      "management",
      "partner management base aligned",
      PRODUCT_APP_REGISTRY_BASE === PRODUCT_PARTNER_MANAGEMENT_ID &&
        PRODUCT_PARTNER_MANAGEMENT_ID ===
          "enterprise-product-partner-management-v1",
      `base=${PRODUCT_APP_REGISTRY_BASE}`,
    ),
  );

  const apps = listApps();
  checks.push(
    check(
      "APP-REG",
      "registry",
      "Active apps present",
      apps.some((a) => a.status === "ACTIVE"),
      `apps=${apps.length}`,
    ),
  );

  const definitions = listAppDefinitions();
  checks.push(
    check(
      "APP-DEF",
      "definition",
      "App definitions present",
      definitions.length >= 1,
      `definitions=${definitions.length}`,
    ),
  );

  const versions = listAppVersions();
  checks.push(
    check(
      "APP-VER",
      "version",
      "Published versions present",
      versions.some((v) => v.status === "PUBLISHED"),
      `versions=${versions.length}`,
    ),
  );

  const ownerships = listAppOwnerships();
  checks.push(
    check(
      "APP-OWN",
      "ownership",
      "Assigned ownerships present",
      ownerships.some((o) => o.status === "ASSIGNED"),
      `ownerships=${ownerships.length}`,
    ),
  );

  const releases = listAppReleaseManifests();
  checks.push(
    check(
      "APP-REL",
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
    summary: `product-app readiness ${verdict.toLowerCase()}: pass=${passCount} fail=${failCount}`,
    evaluatedAt: nowIso(),
  };
}

export function assertAppRegistryReadinessReady(
  result: AppReadinessResult,
): asserts result is AppReadinessResult & { verdict: "READY" } {
  if (result.verdict !== "READY") {
    throw new Error(`product app registry not ready: ${result.summary}`);
  }
}

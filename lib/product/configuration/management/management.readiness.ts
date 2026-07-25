/**
 * Product Configuration — readiness
 */

import { PRODUCT_USER_ADMINISTRATION_ID } from "../../user/administration/administration.constants";
import { listConfigNamespaces } from "../namespace/namespace.registry";
import { listConfigOverrides } from "../override/override.registry";
import { listConfigParameters } from "../parameter/parameter.registry";
import { listConfigReleases } from "../release/release.registry";
import { PRODUCT_SYSTEM_CONFIGURATION_BASE } from "./management.constants";
import type {
  ConfigurationReadinessCheck,
  ConfigurationReadinessResult,
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
): ConfigurationReadinessCheck {
  return { id, component, label, ok, detail };
}

export function evaluateSystemConfigurationReadiness(): ConfigurationReadinessResult {
  const checks: ConfigurationReadinessCheck[] = [];

  checks.push(
    check(
      "CFG-BASE",
      "management",
      "User administration aligned",
      PRODUCT_SYSTEM_CONFIGURATION_BASE === PRODUCT_USER_ADMINISTRATION_ID,
      `base=${PRODUCT_SYSTEM_CONFIGURATION_BASE}`,
    ),
  );

  const namespaces = listConfigNamespaces();
  checks.push(
    check(
      "CFG-NS",
      "namespace",
      "Active namespaces present",
      namespaces.some((n) => n.status === "ACTIVE"),
      `namespaces=${namespaces.length}`,
    ),
  );

  const parameters = listConfigParameters();
  checks.push(
    check(
      "CFG-PRM",
      "parameter",
      "Parameters present",
      parameters.length >= 1,
      `parameters=${parameters.length}`,
    ),
  );

  const overrides = listConfigOverrides();
  checks.push(
    check(
      "CFG-OVR",
      "override",
      "Overrides present",
      overrides.length >= 1,
      `overrides=${overrides.length}`,
    ),
  );

  const releases = listConfigReleases();
  checks.push(
    check(
      "CFG-RLS",
      "release",
      "Active releases present",
      releases.some((r) => r.status === "ACTIVE"),
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
    summary: `product-configuration readiness ${verdict.toLowerCase()}: pass=${passCount} fail=${failCount}`,
    evaluatedAt: nowIso(),
  };
}

export function assertSystemConfigurationReadinessReady(
  result: ConfigurationReadinessResult,
): asserts result is ConfigurationReadinessResult & { verdict: "READY" } {
  if (result.verdict !== "READY") {
    throw new Error(
      `product system configuration not ready: ${result.summary}`,
    );
  }
}

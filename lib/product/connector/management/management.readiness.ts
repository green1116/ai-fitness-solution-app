/**
 * Product Connector — readiness
 */

import { PRODUCT_MARKETPLACE_FOUNDATION_ID } from "../../marketplace/management/management.constants";
import { ENTERPRISE_PRODUCT_API_BASELINE_ID } from "../../api-baseline/freeze/freeze.lock";
import { listConnectorBindings } from "../binding/binding.registry";
import { listConnectorContracts } from "../contract/contract.registry";
import { listConnectorDefinitions } from "../definition/definition.registry";
import { listConnectorReleaseManifests } from "../manifest/manifest.registry";
import { listConnectors } from "../registry/connector.registry";
import { PRODUCT_CONNECTOR_FRAMEWORK_BASE } from "./management.constants";
import type {
  ConnectorReadinessCheck,
  ConnectorReadinessResult,
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
): ConnectorReadinessCheck {
  return { id, component, label, ok, detail };
}

export function evaluateConnectorFrameworkReadiness(): ConnectorReadinessResult {
  const checks: ConnectorReadinessCheck[] = [];

  checks.push(
    check(
      "CONN-BASE",
      "management",
      "marketplace foundation + api-baseline aligned",
      PRODUCT_CONNECTOR_FRAMEWORK_BASE === PRODUCT_MARKETPLACE_FOUNDATION_ID &&
        PRODUCT_MARKETPLACE_FOUNDATION_ID ===
          "enterprise-product-marketplace-foundation-v1" &&
        ENTERPRISE_PRODUCT_API_BASELINE_ID ===
          "enterprise-product-api-baseline-v1",
      `base=${PRODUCT_CONNECTOR_FRAMEWORK_BASE}`,
    ),
  );

  const connectors = listConnectors();
  checks.push(
    check(
      "CONN-REG",
      "registry",
      "Declared connectors present",
      connectors.some(
        (c) => c.status === "DECLARED" || c.status === "DRAFT",
      ) && connectors.length >= 1,
      `connectors=${connectors.length}`,
    ),
  );

  const definitions = listConnectorDefinitions();
  checks.push(
    check(
      "CONN-DEF",
      "definition",
      "Connector definitions present",
      definitions.length >= 1,
      `definitions=${definitions.length}`,
    ),
  );

  const contracts = listConnectorContracts();
  checks.push(
    check(
      "CONN-CTR",
      "contract",
      "Connector contracts present",
      contracts.length >= 1,
      `contracts=${contracts.length}`,
    ),
  );

  const bindings = listConnectorBindings();
  checks.push(
    check(
      "CONN-BIND",
      "binding",
      "Bound connector bindings present",
      bindings.some((b) => b.status === "BOUND"),
      `bindings=${bindings.length}`,
    ),
  );

  const releases = listConnectorReleaseManifests();
  checks.push(
    check(
      "CONN-REL",
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
    summary: `product-connector readiness ${verdict.toLowerCase()}: pass=${passCount} fail=${failCount}`,
    evaluatedAt: nowIso(),
  };
}

export function assertConnectorFrameworkReadinessReady(
  result: ConnectorReadinessResult,
): asserts result is ConnectorReadinessResult & { verdict: "READY" } {
  if (result.verdict !== "READY") {
    throw new Error(
      `product connector framework not ready: ${result.summary}`,
    );
  }
}

/**
 * Product Connector — Framework Release Gate
 * MODULE: Connector Framework (M08-P2)
 * BASE: enterprise-product-marketplace-foundation-v1
 */

import { buildPlatformV1Manifest } from "../../../platform/v1/platform.manifest";
import { ENTERPRISE_PRODUCT_API_BASELINE_ID } from "../../api-baseline/freeze/freeze.lock";
import { PRODUCT_MARKETPLACE_FOUNDATION_ID } from "../../marketplace/management/management.constants";
import {
  assertConnectorFrameworkReadinessReady,
  clearConnectorFrameworkLayer,
  createConnectorManager,
  getConnectorRegistryManifest,
} from "../connector.manager";
import {
  CONNECTOR_BINDING_STATUSES,
  CONNECTOR_CONTRACT_KINDS,
  CONNECTOR_KINDS,
  CONNECTOR_MANAGER_STATUSES,
  CONNECTOR_READINESS_VERDICTS,
  CONNECTOR_STATUSES,
  PRODUCT_CONNECTOR_FRAMEWORK_BASE,
  PRODUCT_CONNECTOR_FRAMEWORK_FREEZE_VERSION,
  PRODUCT_CONNECTOR_FRAMEWORK_ID,
  PRODUCT_CONNECTOR_FRAMEWORK_VERSION,
  PRODUCT_CONNECTOR_FREEZE_TAG,
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

export const PRODUCT_CONNECTOR_SIGNOFF_VERSION =
  "product-connector-signoff-1" as const;

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
  clearConnectorFrameworkLayer();
}

export function checkProductConnectorReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];

  checks.push(
    check(
      "CONN-CONSTANTS",
      "management",
      "Product connector framework version constants",
      PRODUCT_CONNECTOR_FRAMEWORK_ID ===
        "enterprise-product-connector-framework-v1" &&
        PRODUCT_CONNECTOR_FRAMEWORK_VERSION === "product-connector-1" &&
        PRODUCT_CONNECTOR_FRAMEWORK_BASE ===
          PRODUCT_MARKETPLACE_FOUNDATION_ID &&
        PRODUCT_CONNECTOR_FRAMEWORK_FREEZE_VERSION ===
          "product-connector-framework-freeze-1" &&
        PRODUCT_CONNECTOR_FREEZE_TAG ===
          "product-connector-framework-freeze-1" &&
        CONNECTOR_KINDS.length === 4 &&
        CONNECTOR_STATUSES.length === 4 &&
        CONNECTOR_CONTRACT_KINDS.length === 3 &&
        CONNECTOR_BINDING_STATUSES.length === 3 &&
        CONNECTOR_READINESS_VERDICTS.length === 3 &&
        CONNECTOR_MANAGER_STATUSES.length === 4,
      `id=${PRODUCT_CONNECTOR_FRAMEWORK_ID} base=${PRODUCT_CONNECTOR_FRAMEWORK_BASE}`,
    ),
  );

  const platform = buildPlatformV1Manifest();
  checks.push(
    check(
      "CONN-PLATFORM",
      "platform-v1",
      "Platform v1 baseline aligned",
      platform.aligned === true,
      platform.summary,
    ),
  );

  checks.push(
    check(
      "CONN-UPSTREAM",
      "compatibility",
      "Depends on marketplace foundation (+ api-baseline preserved)",
      PRODUCT_CONNECTOR_FRAMEWORK_BASE ===
        "enterprise-product-marketplace-foundation-v1" &&
        PRODUCT_MARKETPLACE_FOUNDATION_ID ===
          "enterprise-product-marketplace-foundation-v1" &&
        ENTERPRISE_PRODUCT_API_BASELINE_ID ===
          "enterprise-product-api-baseline-v1",
      `marketplace=${PRODUCT_MARKETPLACE_FOUNDATION_ID}`,
    ),
  );

  try {
    cleanup();
    const mgr = createConnectorManager({ managerId: "prod-conn-gate" });
    mgr.initialize();
    mgr.start();

    const connector = mgr.registerConnector({
      id: "conn.gate.reg",
      connectorKey: "WEARABLE_SYNC",
      name: "Wearable Sync Connector",
      kind: "HTTP",
    });
    const declared = mgr.updateConnectorStatus({
      connectorId: connector.id,
      status: "DECLARED",
    });
    const definition = mgr.defineDefinition({
      id: "conn.gate.def",
      connectorId: connector.id,
      operationKey: "SYNC_ACTIVITY",
      direction: "INBOUND",
      summary: "Sync wearable activity declaration",
    });
    const contract = mgr.registerContract({
      id: "conn.gate.ctr",
      definitionId: definition.id,
      contractKey: "SYNC_ACTIVITY_REQUEST",
      kind: "REQUEST",
      shapeRef: "WEARABLE_ACTIVITY_INPUT_V1",
    });
    const binding = mgr.bindConnector({
      id: "conn.gate.bind",
      connectorId: connector.id,
      bindingKey: "FITNESS_COACH_BIND",
      listingKeyRef: "FITNESS_COACH_APP",
    });
    const release = mgr.createReleaseManifest({
      id: "conn.gate.rel",
      connectorId: connector.id,
    });

    const readiness = mgr.evaluateReadiness();
    const registry = getConnectorRegistryManifest();

    const ok =
      connector.connectorKey === "WEARABLE_SYNC" &&
      declared.status === "DECLARED" &&
      definition.operationKey === "SYNC_ACTIVITY" &&
      contract.kind === "REQUEST" &&
      binding.status === "BOUND" &&
      release.checksum.length === 64 &&
      readiness.verdict === "READY" &&
      registry.frameworkId === PRODUCT_CONNECTOR_FRAMEWORK_ID &&
      registry.base === PRODUCT_CONNECTOR_FRAMEWORK_BASE &&
      registry.connectorCount >= 1 &&
      registry.definitionCount >= 1 &&
      registry.contractCount >= 1 &&
      registry.bindingCount >= 1 &&
      registry.releaseCount >= 1;

    try {
      assertConnectorFrameworkReadinessReady(readiness);
      checks.push(
        check(
          "CONN-STACK",
          "connector",
          "Registry / definition / contract / binding / manifest",
          ok,
          `readiness=${readiness.verdict} checksum=${release.checksum.slice(0, 12)}…`,
        ),
      );
    } catch (error) {
      checks.push(
        check(
          "CONN-STACK",
          "connector",
          "Registry / definition / contract / binding / manifest",
          false,
          error instanceof Error
            ? error.message
            : "product connector framework not ready",
        ),
      );
    }

    checks.push(
      check(
        "CONN-SCOPE",
        "scope",
        "No connector-runtime / provider-SDK / business-execution surface",
        ok,
        "connector-framework-declaration-only domain",
      ),
    );

    mgr.stop();
    cleanup();
  } catch (error) {
    const detail =
      error instanceof Error
        ? error.message
        : "product connector framework probe failed";
    checks.push(
      check(
        "CONN-STACK",
        "connector",
        "Registry / definition / contract / binding / manifest",
        false,
        detail,
      ),
    );
    checks.push(
      check(
        "CONN-SCOPE",
        "scope",
        "No connector-runtime / provider-SDK / business-execution surface",
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
      `product-connector-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertProductConnectorReleaseGatePass(
  gate: ReleaseGateResult = checkProductConnectorReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(
      `Product connector release gate failed: ${gate.summary}`,
    );
  }
}

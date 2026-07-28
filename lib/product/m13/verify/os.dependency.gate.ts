/**
 * Product M13 — OS Dependency Release Gate
 * MODULE: OS Dependency (M13-P3)
 * BASE: enterprise-product-os-catalog-v1
 */

import { buildPlatformV1Manifest } from "../../../platform/v1/platform.manifest";
import { PRODUCT_OS_CATALOG_ID } from "../catalog-runtime/catalog.constants";
import {
  OS_DEPENDENCY_EDGE_STATUSES,
  OS_DEPENDENCY_GRAPH_KINDS,
  OS_DEPENDENCY_GRAPH_STATUSES,
  OS_DEPENDENCY_IMPACTS,
  OS_DEPENDENCY_NODE_STATUSES,
  OS_DEPENDENCY_READINESS_VERDICTS,
  PRODUCT_OS_DEPENDENCY_BASE,
  PRODUCT_OS_DEPENDENCY_FREEZE_TAG,
  PRODUCT_OS_DEPENDENCY_FREEZE_VERSION,
  PRODUCT_OS_DEPENDENCY_ID,
  PRODUCT_OS_DEPENDENCY_VERSION,
} from "../dependency-runtime/dependency.constants";
import {
  assertOsDependencyReadinessReady,
  buildOsDependencyManifest,
  clearOsDependencyLayer,
  evaluateOsDependencyReadiness,
} from "../dependency-runtime/dependency.manifest";
import {
  getOsDependencyMetadata,
  isOsDependencyMetadataIntact,
} from "../dependency-runtime/dependency.metadata";
import { bindOsDependencyEdge } from "../dependency-runtime/edge.registry";
import {
  registerOsDependencyGraph,
  updateOsDependencyGraphStatus,
} from "../dependency-runtime/graph.registry";
import {
  registerOsDependencyNode,
  updateOsDependencyNodeStatus,
} from "../dependency-runtime/node.registry";

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

export const PRODUCT_OS_DEPENDENCY_SIGNOFF_VERSION =
  "product-os-dependency-signoff-1" as const;

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
  clearOsDependencyLayer();
}

export function checkProductOsDependencyReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];
  const metadata = getOsDependencyMetadata();

  checks.push(
    check(
      "OSDEP-CONSTANTS",
      "dependency-runtime",
      "Product OS dependency version constants",
      PRODUCT_OS_DEPENDENCY_ID === "enterprise-product-os-dependency-v1" &&
        PRODUCT_OS_DEPENDENCY_VERSION === "product-os-dependency-1" &&
        PRODUCT_OS_DEPENDENCY_BASE === PRODUCT_OS_CATALOG_ID &&
        PRODUCT_OS_DEPENDENCY_FREEZE_VERSION ===
          "product-os-dependency-freeze-1" &&
        PRODUCT_OS_DEPENDENCY_FREEZE_TAG === "product-os-dependency-freeze-1" &&
        OS_DEPENDENCY_GRAPH_KINDS.length === 4 &&
        OS_DEPENDENCY_GRAPH_STATUSES.length === 4 &&
        OS_DEPENDENCY_NODE_STATUSES.length === 4 &&
        OS_DEPENDENCY_EDGE_STATUSES.length === 3 &&
        OS_DEPENDENCY_IMPACTS.length === 4 &&
        OS_DEPENDENCY_READINESS_VERDICTS.length === 3 &&
        isOsDependencyMetadataIntact(metadata),
      `id=${PRODUCT_OS_DEPENDENCY_ID} base=${PRODUCT_OS_DEPENDENCY_BASE}`,
    ),
  );

  const platform = buildPlatformV1Manifest();
  checks.push(
    check(
      "OSDEP-PLATFORM",
      "platform-v1",
      "Platform v1 baseline aligned",
      platform.aligned === true,
      platform.summary,
    ),
  );

  checks.push(
    check(
      "OSDEP-UPSTREAM",
      "compatibility",
      "Depends on OS catalog chain",
      PRODUCT_OS_DEPENDENCY_BASE === "enterprise-product-os-catalog-v1" &&
        PRODUCT_OS_CATALOG_ID === "enterprise-product-os-catalog-v1",
      `catalog=${PRODUCT_OS_CATALOG_ID}`,
    ),
  );

  try {
    cleanup();

    const graph = registerOsDependencyGraph({
      id: "osdep.gate.graph",
      graphKey: "DOMAIN_CONTROL_GRAPH",
      kind: "DOMAIN",
      title: "Domain control OS dependency graph",
      summary: "Declared dependency graph for catalog reuse",
    });
    const active = updateOsDependencyGraphStatus({
      graphId: graph.id,
      status: "ACTIVE",
    });
    const upstream = registerOsDependencyNode({
      id: "osdep.gate.up",
      graphId: graph.id,
      nodeKey: "FLEET_ROOT",
      sequence: 1,
      catalogKeyRef: "DOMAIN_CONTROL_FLEET",
      summary: "Soft-ref upstream catalog node",
    });
    const downstream = registerOsDependencyNode({
      id: "osdep.gate.down",
      graphId: graph.id,
      nodeKey: "CONTROL_LEAF",
      sequence: 2,
      catalogKeyRef: "DOMAIN_CONTROL_FLEET",
      summary: "Soft-ref downstream catalog node",
    });
    const declaredUp = updateOsDependencyNodeStatus({
      nodeId: upstream.id,
      status: "DECLARED",
    });
    const declaredDown = updateOsDependencyNodeStatus({
      nodeId: downstream.id,
      status: "DECLARED",
    });
    const edge = bindOsDependencyEdge({
      id: "osdep.gate.edge",
      graphId: graph.id,
      edgeKey: "FLEET_REQUIRES_CONTROL",
      upstreamNodeId: upstream.id,
      downstreamNodeId: downstream.id,
      impact: "HIGH",
      required: true,
    });
    const manifest = buildOsDependencyManifest();
    const readiness = evaluateOsDependencyReadiness();

    const ok =
      graph.graphKey === "DOMAIN_CONTROL_GRAPH" &&
      active.status === "ACTIVE" &&
      declaredUp.status === "DECLARED" &&
      declaredDown.status === "DECLARED" &&
      declaredUp.catalogKeyRef === "DOMAIN_CONTROL_FLEET" &&
      edge.status === "BOUND" &&
      edge.impact === "HIGH" &&
      manifest.acyclic === true &&
      manifest.checksum.length === 64 &&
      readiness.verdict === "READY";

    try {
      assertOsDependencyReadinessReady(readiness);
      checks.push(
        check(
          "OSDEP-STACK",
          "os-dependency",
          "Graph / node / edge / manifest",
          ok,
          `readiness=${readiness.verdict} checksum=${manifest.checksum.slice(0, 12)}…`,
        ),
      );
    } catch (error) {
      checks.push(
        check(
          "OSDEP-STACK",
          "os-dependency",
          "Graph / node / edge / manifest",
          false,
          error instanceof Error
            ? error.message
            : "product os dependency not ready",
        ),
      );
    }

    checks.push(
      check(
        "OSDEP-SCOPE",
        "scope",
        "No DB / vector / RAG / embedding / OS execution / tool runtime",
        ok && metadata.declarationOnly === true,
        "os-dependency-declaration-only domain",
      ),
    );

    cleanup();
  } catch (error) {
    const detail =
      error instanceof Error
        ? error.message
        : "product os dependency probe failed";
    checks.push(
      check(
        "OSDEP-STACK",
        "os-dependency",
        "Graph / node / edge / manifest",
        false,
        detail,
      ),
    );
    checks.push(
      check(
        "OSDEP-SCOPE",
        "scope",
        "No DB / vector / RAG / embedding / OS execution / tool runtime",
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
      `product-os-dependency-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertProductOsDependencyReleaseGatePass(
  gate: ReleaseGateResult = checkProductOsDependencyReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(
      `Product OS dependency release gate failed: ${gate.summary}`,
    );
  }
}

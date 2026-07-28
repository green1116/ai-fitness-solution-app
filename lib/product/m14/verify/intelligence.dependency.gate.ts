/**
 * Product M14 — Intelligence Dependency Release Gate
 * MODULE: Enterprise Intelligence Dependency (M14-P3)
 * BASE: enterprise-product-intelligence-catalog-v1
 */

import { buildPlatformV1Manifest } from "../../../platform/v1/platform.manifest";
import { PRODUCT_INTELLIGENCE_CATALOG_ID } from "../catalog-runtime/catalog.constants";
import {
  INTELLIGENCE_DEPENDENCY_EDGE_STATUSES,
  INTELLIGENCE_DEPENDENCY_GRAPH_KINDS,
  INTELLIGENCE_DEPENDENCY_GRAPH_STATUSES,
  INTELLIGENCE_DEPENDENCY_IMPACTS,
  INTELLIGENCE_DEPENDENCY_NODE_STATUSES,
  INTELLIGENCE_DEPENDENCY_READINESS_VERDICTS,
  PRODUCT_INTELLIGENCE_DEPENDENCY_BASE,
  PRODUCT_INTELLIGENCE_DEPENDENCY_FREEZE_TAG,
  PRODUCT_INTELLIGENCE_DEPENDENCY_FREEZE_VERSION,
  PRODUCT_INTELLIGENCE_DEPENDENCY_ID,
  PRODUCT_INTELLIGENCE_DEPENDENCY_VERSION,
} from "../dependency-runtime/dependency.constants";
import {
  assertIntelligenceDependencyReadinessReady,
  buildIntelligenceDependencyManifest,
  clearIntelligenceDependencyLayer,
  evaluateIntelligenceDependencyReadiness,
} from "../dependency-runtime/dependency.manifest";
import {
  getIntelligenceDependencyMetadata,
  isIntelligenceDependencyMetadataIntact,
} from "../dependency-runtime/dependency.metadata";
import { bindIntelligenceDependencyEdge } from "../dependency-runtime/edge.registry";
import {
  registerIntelligenceDependencyGraph,
  updateIntelligenceDependencyGraphStatus,
} from "../dependency-runtime/graph.registry";
import {
  registerIntelligenceDependencyNode,
  updateIntelligenceDependencyNodeStatus,
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

export const PRODUCT_INTELLIGENCE_DEPENDENCY_SIGNOFF_VERSION =
  "product-intelligence-dependency-signoff-1" as const;

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
  clearIntelligenceDependencyLayer();
}

export function checkProductIntelligenceDependencyReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];
  const metadata = getIntelligenceDependencyMetadata();

  checks.push(
    check(
      "INTDEP-CONSTANTS",
      "dependency-runtime",
      "Product intelligence dependency version constants",
      PRODUCT_INTELLIGENCE_DEPENDENCY_ID ===
        "enterprise-product-intelligence-dependency-v1" &&
        PRODUCT_INTELLIGENCE_DEPENDENCY_VERSION ===
          "product-intelligence-dependency-1" &&
        PRODUCT_INTELLIGENCE_DEPENDENCY_BASE === PRODUCT_INTELLIGENCE_CATALOG_ID &&
        PRODUCT_INTELLIGENCE_DEPENDENCY_FREEZE_VERSION ===
          "product-intelligence-dependency-freeze-1" &&
        PRODUCT_INTELLIGENCE_DEPENDENCY_FREEZE_TAG ===
          "product-intelligence-dependency-freeze-1" &&
        INTELLIGENCE_DEPENDENCY_GRAPH_KINDS.length === 4 &&
        INTELLIGENCE_DEPENDENCY_GRAPH_STATUSES.length === 4 &&
        INTELLIGENCE_DEPENDENCY_NODE_STATUSES.length === 4 &&
        INTELLIGENCE_DEPENDENCY_EDGE_STATUSES.length === 3 &&
        INTELLIGENCE_DEPENDENCY_IMPACTS.length === 4 &&
        INTELLIGENCE_DEPENDENCY_READINESS_VERDICTS.length === 3 &&
        isIntelligenceDependencyMetadataIntact(metadata),
      `id=${PRODUCT_INTELLIGENCE_DEPENDENCY_ID} base=${PRODUCT_INTELLIGENCE_DEPENDENCY_BASE}`,
    ),
  );

  const platform = buildPlatformV1Manifest();
  checks.push(
    check(
      "INTDEP-PLATFORM",
      "platform-v1",
      "Platform v1 baseline aligned",
      platform.aligned === true,
      platform.summary,
    ),
  );

  checks.push(
    check(
      "INTDEP-UPSTREAM",
      "compatibility",
      "Depends on intelligence catalog chain",
      PRODUCT_INTELLIGENCE_DEPENDENCY_BASE ===
        "enterprise-product-intelligence-catalog-v1" &&
        PRODUCT_INTELLIGENCE_CATALOG_ID ===
          "enterprise-product-intelligence-catalog-v1",
      `catalog=${PRODUCT_INTELLIGENCE_CATALOG_ID}`,
    ),
  );

  try {
    cleanup();

    const graph = registerIntelligenceDependencyGraph({
      id: "intdep.gate.graph",
      graphKey: "EXECUTIVE_DECISION_GRAPH",
      kind: "DOMAIN",
      title: "Executive decision intelligence dependency graph",
      summary: "Declared dependency graph for catalog reuse",
    });
    const active = updateIntelligenceDependencyGraphStatus({
      graphId: graph.id,
      status: "ACTIVE",
    });
    const upstream = registerIntelligenceDependencyNode({
      id: "intdep.gate.up",
      graphId: graph.id,
      nodeKey: "PORTFOLIO_ROOT",
      sequence: 1,
      catalogKeyRef: "EXECUTIVE_DECISION_PORTFOLIO",
      summary: "Soft-ref upstream catalog node",
    });
    const downstream = registerIntelligenceDependencyNode({
      id: "intdep.gate.down",
      graphId: graph.id,
      nodeKey: "SUPPORT_LEAF",
      sequence: 2,
      catalogKeyRef: "EXECUTIVE_DECISION_PORTFOLIO",
      summary: "Soft-ref downstream catalog node",
    });
    const declaredUp = updateIntelligenceDependencyNodeStatus({
      nodeId: upstream.id,
      status: "DECLARED",
    });
    const declaredDown = updateIntelligenceDependencyNodeStatus({
      nodeId: downstream.id,
      status: "DECLARED",
    });
    const edge = bindIntelligenceDependencyEdge({
      id: "intdep.gate.edge",
      graphId: graph.id,
      edgeKey: "PORTFOLIO_REQUIRES_SUPPORT",
      upstreamNodeId: upstream.id,
      downstreamNodeId: downstream.id,
      impact: "HIGH",
      required: true,
    });
    const manifest = buildIntelligenceDependencyManifest();
    const readiness = evaluateIntelligenceDependencyReadiness();

    const ok =
      graph.graphKey === "EXECUTIVE_DECISION_GRAPH" &&
      active.status === "ACTIVE" &&
      declaredUp.status === "DECLARED" &&
      declaredDown.status === "DECLARED" &&
      declaredUp.catalogKeyRef === "EXECUTIVE_DECISION_PORTFOLIO" &&
      edge.status === "BOUND" &&
      edge.impact === "HIGH" &&
      manifest.acyclic === true &&
      manifest.checksum.length === 64 &&
      readiness.verdict === "READY";

    try {
      assertIntelligenceDependencyReadinessReady(readiness);
      checks.push(
        check(
          "INTDEP-STACK",
          "intelligence-dependency",
          "Graph / node / edge / manifest",
          ok,
          `readiness=${readiness.verdict} checksum=${manifest.checksum.slice(0, 12)}…`,
        ),
      );
    } catch (error) {
      checks.push(
        check(
          "INTDEP-STACK",
          "intelligence-dependency",
          "Graph / node / edge / manifest",
          false,
          error instanceof Error
            ? error.message
            : "product intelligence dependency not ready",
        ),
      );
    }

    checks.push(
      check(
        "INTDEP-SCOPE",
        "scope",
        "No DB / vector / RAG / embedding / intelligence execution / tool runtime",
        ok && metadata.declarationOnly === true,
        "intelligence-dependency-declaration-only domain",
      ),
    );

    cleanup();
  } catch (error) {
    const detail =
      error instanceof Error
        ? error.message
        : "product intelligence dependency probe failed";
    checks.push(
      check(
        "INTDEP-STACK",
        "intelligence-dependency",
        "Graph / node / edge / manifest",
        false,
        detail,
      ),
    );
    checks.push(
      check(
        "INTDEP-SCOPE",
        "scope",
        "No DB / vector / RAG / embedding / intelligence execution / tool runtime",
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
      `product-intelligence-dependency-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertProductIntelligenceDependencyReleaseGatePass(
  gate: ReleaseGateResult = checkProductIntelligenceDependencyReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(
      `Product intelligence dependency release gate failed: ${gate.summary}`,
    );
  }
}

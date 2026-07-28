/**
 * Product M11 — Knowledge Dependency Release Gate
 * MODULE: Knowledge Dependency (M11-P3)
 * BASE: enterprise-product-knowledge-catalog-v1
 */

import { buildPlatformV1Manifest } from "../../../platform/v1/platform.manifest";
import { PRODUCT_KNOWLEDGE_CATALOG_ID } from "../catalog/catalog.constants";
import {
  KNOWLEDGE_DEPENDENCY_EDGE_STATUSES,
  KNOWLEDGE_DEPENDENCY_GRAPH_KINDS,
  KNOWLEDGE_DEPENDENCY_GRAPH_STATUSES,
  KNOWLEDGE_DEPENDENCY_IMPACTS,
  KNOWLEDGE_DEPENDENCY_NODE_STATUSES,
  KNOWLEDGE_DEPENDENCY_READINESS_VERDICTS,
  PRODUCT_KNOWLEDGE_DEPENDENCY_BASE,
  PRODUCT_KNOWLEDGE_DEPENDENCY_FREEZE_TAG,
  PRODUCT_KNOWLEDGE_DEPENDENCY_FREEZE_VERSION,
  PRODUCT_KNOWLEDGE_DEPENDENCY_ID,
  PRODUCT_KNOWLEDGE_DEPENDENCY_VERSION,
} from "../dependency-runtime/dependency.constants";
import {
  assertKnowledgeDependencyReadinessReady,
  buildKnowledgeDependencyManifest,
  clearKnowledgeDependencyLayer,
  evaluateKnowledgeDependencyReadiness,
} from "../dependency-runtime/dependency.manifest";
import {
  getKnowledgeDependencyMetadata,
  isKnowledgeDependencyMetadataIntact,
} from "../dependency-runtime/dependency.metadata";
import { bindKnowledgeDependencyEdge } from "../dependency-runtime/edge.registry";
import {
  registerKnowledgeDependencyGraph,
  updateKnowledgeDependencyGraphStatus,
} from "../dependency-runtime/graph.registry";
import {
  registerKnowledgeDependencyNode,
  updateKnowledgeDependencyNodeStatus,
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

export const PRODUCT_KNOWLEDGE_DEPENDENCY_SIGNOFF_VERSION =
  "product-knowledge-dependency-signoff-1" as const;

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
  clearKnowledgeDependencyLayer();
}

export function checkProductKnowledgeDependencyReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];
  const metadata = getKnowledgeDependencyMetadata();

  checks.push(
    check(
      "KNWDEP-CONSTANTS",
      "dependency-runtime",
      "Product knowledge dependency version constants",
      PRODUCT_KNOWLEDGE_DEPENDENCY_ID ===
        "enterprise-product-knowledge-dependency-v1" &&
        PRODUCT_KNOWLEDGE_DEPENDENCY_VERSION ===
          "product-knowledge-dependency-1" &&
        PRODUCT_KNOWLEDGE_DEPENDENCY_BASE === PRODUCT_KNOWLEDGE_CATALOG_ID &&
        PRODUCT_KNOWLEDGE_DEPENDENCY_FREEZE_VERSION ===
          "product-knowledge-dependency-freeze-1" &&
        PRODUCT_KNOWLEDGE_DEPENDENCY_FREEZE_TAG ===
          "product-knowledge-dependency-freeze-1" &&
        KNOWLEDGE_DEPENDENCY_GRAPH_KINDS.length === 4 &&
        KNOWLEDGE_DEPENDENCY_GRAPH_STATUSES.length === 4 &&
        KNOWLEDGE_DEPENDENCY_NODE_STATUSES.length === 4 &&
        KNOWLEDGE_DEPENDENCY_EDGE_STATUSES.length === 3 &&
        KNOWLEDGE_DEPENDENCY_IMPACTS.length === 4 &&
        KNOWLEDGE_DEPENDENCY_READINESS_VERDICTS.length === 3 &&
        isKnowledgeDependencyMetadataIntact(metadata),
      `id=${PRODUCT_KNOWLEDGE_DEPENDENCY_ID} base=${PRODUCT_KNOWLEDGE_DEPENDENCY_BASE}`,
    ),
  );

  const platform = buildPlatformV1Manifest();
  checks.push(
    check(
      "KNWDEP-PLATFORM",
      "platform-v1",
      "Platform v1 baseline aligned",
      platform.aligned === true,
      platform.summary,
    ),
  );

  checks.push(
    check(
      "KNWDEP-UPSTREAM",
      "compatibility",
      "Depends on knowledge catalog chain",
      PRODUCT_KNOWLEDGE_DEPENDENCY_BASE ===
        "enterprise-product-knowledge-catalog-v1" &&
        PRODUCT_KNOWLEDGE_CATALOG_ID ===
          "enterprise-product-knowledge-catalog-v1",
      `catalog=${PRODUCT_KNOWLEDGE_CATALOG_ID}`,
    ),
  );

  try {
    cleanup();

    const graph = registerKnowledgeDependencyGraph({
      id: "knwdep.gate.graph",
      graphKey: "DOMAIN_FITNESS_GRAPH",
      kind: "DOMAIN",
      title: "Domain fitness dependency graph",
      summary: "Declared dependency graph for catalog reuse",
    });
    const active = updateKnowledgeDependencyGraphStatus({
      graphId: graph.id,
      status: "ACTIVE",
    });
    const upstream = registerKnowledgeDependencyNode({
      id: "knwdep.gate.up",
      graphId: graph.id,
      nodeKey: "LIBRARY_ROOT",
      sequence: 1,
      catalogKeyRef: "DOMAIN_FITNESS_LIBRARY",
      summary: "Soft-ref upstream catalog node",
    });
    const downstream = registerKnowledgeDependencyNode({
      id: "knwdep.gate.down",
      graphId: graph.id,
      nodeKey: "POLICY_LEAF",
      sequence: 2,
      catalogKeyRef: "DOMAIN_FITNESS_LIBRARY",
      summary: "Soft-ref downstream catalog node",
    });
    const declaredUp = updateKnowledgeDependencyNodeStatus({
      nodeId: upstream.id,
      status: "DECLARED",
    });
    const declaredDown = updateKnowledgeDependencyNodeStatus({
      nodeId: downstream.id,
      status: "DECLARED",
    });
    const edge = bindKnowledgeDependencyEdge({
      id: "knwdep.gate.edge",
      graphId: graph.id,
      edgeKey: "LIBRARY_REQUIRES_POLICY",
      upstreamNodeId: upstream.id,
      downstreamNodeId: downstream.id,
      impact: "HIGH",
      required: true,
    });
    const manifest = buildKnowledgeDependencyManifest();
    const readiness = evaluateKnowledgeDependencyReadiness();

    const ok =
      graph.graphKey === "DOMAIN_FITNESS_GRAPH" &&
      active.status === "ACTIVE" &&
      declaredUp.status === "DECLARED" &&
      declaredDown.status === "DECLARED" &&
      declaredUp.catalogKeyRef === "DOMAIN_FITNESS_LIBRARY" &&
      edge.status === "BOUND" &&
      edge.impact === "HIGH" &&
      manifest.acyclic === true &&
      manifest.checksum.length === 64 &&
      readiness.verdict === "READY";

    try {
      assertKnowledgeDependencyReadinessReady(readiness);
      checks.push(
        check(
          "KNWDEP-STACK",
          "knowledge-dependency",
          "Graph / node / edge / manifest",
          ok,
          `readiness=${readiness.verdict} checksum=${manifest.checksum.slice(0, 12)}…`,
        ),
      );
    } catch (error) {
      checks.push(
        check(
          "KNWDEP-STACK",
          "knowledge-dependency",
          "Graph / node / edge / manifest",
          false,
          error instanceof Error
            ? error.message
            : "product knowledge dependency not ready",
        ),
      );
    }

    checks.push(
      check(
        "KNWDEP-SCOPE",
        "scope",
        "No DB / vector / RAG / embedding / external provider / model execution",
        ok && metadata.declarationOnly === true,
        "knowledge-dependency-declaration-only domain",
      ),
    );

    cleanup();
  } catch (error) {
    const detail =
      error instanceof Error
        ? error.message
        : "product knowledge dependency probe failed";
    checks.push(
      check(
        "KNWDEP-STACK",
        "knowledge-dependency",
        "Graph / node / edge / manifest",
        false,
        detail,
      ),
    );
    checks.push(
      check(
        "KNWDEP-SCOPE",
        "scope",
        "No DB / vector / RAG / embedding / external provider / model execution",
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
      `product-knowledge-dependency-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertProductKnowledgeDependencyReleaseGatePass(
  gate: ReleaseGateResult = checkProductKnowledgeDependencyReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(
      `Product knowledge dependency release gate failed: ${gate.summary}`,
    );
  }
}

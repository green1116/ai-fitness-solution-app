import { getEvidenceByRequirement } from "@/lib/tender/evidence/registry";
import type { EvidenceRegistry } from "@/lib/tender/evidence/types";
import type { TenderSemanticGraph } from "@/lib/tender/semantic/types";
import { resolveLifecycleState } from "../lifecycle/resolveLifecycleState";
import type {
  SemanticEvidenceEdge,
  SemanticEvidenceExecutionGraph,
  SemanticEvidenceNeed,
  SemanticEvidenceNode,
} from "../types";

let edgeSeq = 0;

function edge(
  from: string,
  to: string,
  relation: SemanticEvidenceEdge["relation"],
  confidence: number,
  rationale?: string,
): SemanticEvidenceEdge {
  edgeSeq += 1;
  return {
    id: `edge-${edgeSeq}`,
    from,
    to,
    relation,
    confidence,
    rationale,
  };
}

function nodeId(kind: string, refId: string) {
  return `${kind}:${refId}`;
}

/**
 * V3.1 构建语义证据执行图（Runtime Execution Graph）
 */
export function buildSemanticEvidenceExecutionGraph(
  graph: TenderSemanticGraph,
  needs: SemanticEvidenceNeed[],
  registry?: EvidenceRegistry,
): SemanticEvidenceExecutionGraph {
  edgeSeq = 0;
  const nodes: SemanticEvidenceNode[] = [];
  const edges: SemanticEvidenceEdge[] = [];
  const needsByReq = new Map<string, SemanticEvidenceNeed[]>();

  for (const need of needs) {
    const list = needsByReq.get(need.requirementId) || [];
    list.push(need);
    needsByReq.set(need.requirementId, list);
  }

  for (const req of graph.requirements) {
    const nid = nodeId("requirement", req.id);
    const linked =
      registry ? getEvidenceByRequirement(registry, req.id).map((d) => d.id) : [];
    const reqNeeds = needsByReq.get(req.id) || [];

    nodes.push({
      id: nid,
      nodeKind: "requirement",
      refId: req.id,
      label: req.title || req.requirement.slice(0, 48),
      lifecycle: resolveLifecycleState(linked.length, reqNeeds.length, req.evidenceRequired),
      linkedEvidenceIds: linked,
      evidenceNeeds: reqNeeds.map((n) => n.id),
      category: req.category,
      importance: req.importance,
    });

    for (const docId of linked) {
      const evidNodeId = nodeId("evidence", docId);
      if (!nodes.some((n) => n.id === evidNodeId)) {
        const doc = registry!.documents.find((d) => d.id === docId);
        nodes.push({
          id: evidNodeId,
          nodeKind: "evidence",
          refId: docId,
          label: doc?.title || docId,
          lifecycle: "linked",
          linkedEvidenceIds: [docId],
        });
      }
      edges.push(
        edge(nid, evidNodeId, "satisfied_by", 0.85, "registry link"),
      );
    }

    for (const sid of req.relatedScoringItems || []) {
      const scoringNid = nodeId("scoring", sid);
      if (!nodes.some((n) => n.id === scoringNid)) {
        const item = graph.scoringItems.find((s) => s.id === sid);
        nodes.push({
          id: scoringNid,
          nodeKind: "scoring",
          refId: sid,
          label: item?.title || sid,
          lifecycle: linked.length ? "verified" : "needed",
          linkedEvidenceIds: [],
        });
      }
      edges.push(edge(scoringNid, nid, "supports_scoring", 0.7));
    }

    for (const rid of req.relatedRisks || []) {
      const riskNid = nodeId("risk", rid);
      if (!nodes.some((n) => n.id === riskNid)) {
        const risk = graph.risks.find((r) => r.id === rid);
        nodes.push({
          id: riskNid,
          nodeKind: "risk",
          refId: rid,
          label: risk?.title || rid,
          lifecycle: linked.length ? "partially_linked" : "gap",
          linkedEvidenceIds: [],
        });
      }
      edges.push(edge(riskNid, nid, "mitigates_risk", 0.65));
    }
  }

  for (const need of needs) {
    const reqNid = nodeId("requirement", need.requirementId);
    const needNid = nodeId("need", need.id);
    if (!nodes.some((n) => n.id === needNid)) {
      nodes.push({
        id: needNid,
        nodeKind: "need",
        refId: need.id,
        label: need.expectedTypes.join("/"),
        lifecycle: "needed",
        linkedEvidenceIds: [],
      });
    }
    edges.push(edge(reqNid, needNid, "requires_evidence", 0.9, need.rationale));
  }

  const gapNodes = nodes.filter((n) => n.lifecycle === "gap" || n.lifecycle === "needed").length;

  return {
    nodes,
    edges,
    summary: {
      nodeCount: nodes.length,
      edgeCount: edges.length,
      requirementNodes: nodes.filter((n) => n.nodeKind === "requirement").length,
      evidenceNodes: nodes.filter((n) => n.nodeKind === "evidence").length,
      gapNodes,
    },
  };
}

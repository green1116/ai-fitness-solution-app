/**
 * V74 P1 — Decision upstream dependencies (read-only)
 */
import {
  V73_KNOWLEDGE_FREEZE_VERSION,
  V73_KNOWLEDGE_SIGNOFF_VERSION,
} from "@/lib/knowledge/v73/signoff/signoff.types";

export type DecisionUpstreamDependency = {
  id: string;
  upstreamVersion: string;
  knowledgeRef: string;
  required: boolean;
  description: string;
};

export const DECISION_UPSTREAM_DEPENDENCIES: DecisionUpstreamDependency[] = [
  {
    id: "DEC-DEP-001",
    upstreamVersion: V73_KNOWLEDGE_FREEZE_VERSION,
    knowledgeRef: "KNW-001",
    required: true,
    description: "V73 knowledge freeze baseline upstream lock",
  },
  {
    id: "DEC-DEP-002",
    upstreamVersion: V73_KNOWLEDGE_SIGNOFF_VERSION,
    knowledgeRef: "KNW-008",
    required: true,
    description: "V73 knowledge sign-off upstream lock",
  },
  {
    id: "DEC-DEP-003",
    upstreamVersion: "v73-knowledge-catalog-1",
    knowledgeRef: "KNW-008",
    required: true,
    description: "V73 P1 knowledge catalog upstream",
  },
  {
    id: "DEC-DEP-004",
    upstreamVersion: "v73-knowledge-dependency-1",
    knowledgeRef: "KNW-002",
    required: true,
    description: "V73 P2 knowledge dependency upstream",
  },
  {
    id: "DEC-DEP-005",
    upstreamVersion: "v73-knowledge-policy-1",
    knowledgeRef: "KNW-003",
    required: true,
    description: "V73 P3 knowledge policy upstream",
  },
  {
    id: "DEC-DEP-006",
    upstreamVersion: "v73-knowledge-governance-1",
    knowledgeRef: "KNW-005",
    required: true,
    description: "V73 P5 knowledge governance upstream",
  },
  {
    id: "DEC-DEP-007",
    upstreamVersion: "v73-knowledge-compliance-1",
    knowledgeRef: "KNW-007",
    required: true,
    description: "V73 P7 knowledge compliance upstream",
  },
  {
    id: "DEC-DEP-008",
    upstreamVersion: "v72-intelligence-freeze-1",
    knowledgeRef: "KNW-001",
    required: true,
    description: "V72 intelligence freeze transitive upstream",
  },
];

export function isDecisionUpstreamAligned(): boolean {
  return (
    DECISION_UPSTREAM_DEPENDENCIES.length >= 6 &&
    DECISION_UPSTREAM_DEPENDENCIES.some(
      (d) => d.upstreamVersion === V73_KNOWLEDGE_FREEZE_VERSION,
    ) &&
    DECISION_UPSTREAM_DEPENDENCIES.some(
      (d) => d.upstreamVersion === V73_KNOWLEDGE_SIGNOFF_VERSION,
    ) &&
    DECISION_UPSTREAM_DEPENDENCIES.every((d) => d.upstreamVersion.length > 0)
  );
}

export function getDecisionDependencyById(id: string): DecisionUpstreamDependency | undefined {
  return DECISION_UPSTREAM_DEPENDENCIES.find((d) => d.id === id);
}

export function getDecisionDependenciesByKnowledgeRef(
  knowledgeRef: string,
): DecisionUpstreamDependency[] {
  return DECISION_UPSTREAM_DEPENDENCIES.filter((d) => d.knowledgeRef === knowledgeRef);
}

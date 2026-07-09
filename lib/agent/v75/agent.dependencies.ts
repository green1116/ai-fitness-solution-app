/**
 * V75 P1 — Agent upstream dependencies (read-only)
 */
import {
  V74_DECISION_FREEZE_VERSION,
  V74_DECISION_SIGNOFF_VERSION,
} from "@/lib/decision/v74/signoff/signoff.types";
import { V74_DECISION_VERSION } from "@/lib/decision/v74/decision.types";

export type AgentUpstreamDependency = {
  id: string;
  upstreamVersion: string;
  decisionRef: string;
  required: boolean;
  description: string;
};

export const AGENT_UPSTREAM_DEPENDENCIES: AgentUpstreamDependency[] = [
  {
    id: "AGT-DEP-001",
    upstreamVersion: V74_DECISION_FREEZE_VERSION,
    decisionRef: "DEC-001",
    required: true,
    description: "V74 decision freeze baseline upstream lock",
  },
  {
    id: "AGT-DEP-002",
    upstreamVersion: V74_DECISION_SIGNOFF_VERSION,
    decisionRef: "DEC-008",
    required: true,
    description: "V74 decision sign-off upstream lock",
  },
  {
    id: "AGT-DEP-003",
    upstreamVersion: V74_DECISION_VERSION,
    decisionRef: "DEC-001",
    required: true,
    description: "V74 P1 decision inventory upstream",
  },
  {
    id: "AGT-DEP-004",
    upstreamVersion: "v74-decision-policy-catalog-1",
    decisionRef: "DEC-002",
    required: true,
    description: "V74 P2 decision policy catalog upstream",
  },
  {
    id: "AGT-DEP-005",
    upstreamVersion: "v74-decision-context-catalog-1",
    decisionRef: "DEC-003",
    required: true,
    description: "V74 P3 decision context catalog upstream",
  },
  {
    id: "AGT-DEP-006",
    upstreamVersion: "v74-decision-compliance-catalog-1",
    decisionRef: "DEC-007",
    required: true,
    description: "V74 P7 decision compliance upstream",
  },
  {
    id: "AGT-DEP-007",
    upstreamVersion: "v73-knowledge-freeze-1",
    decisionRef: "DEC-001",
    required: true,
    description: "V73 knowledge freeze transitive upstream",
  },
  {
    id: "AGT-DEP-008",
    upstreamVersion: "v75-agent-inventory-1",
    decisionRef: "AGT-001",
    required: true,
    description: "V75 P1 agent inventory self-reference",
  },
];

export function isAgentUpstreamAligned(): boolean {
  return (
    AGENT_UPSTREAM_DEPENDENCIES.length >= 6 &&
    AGENT_UPSTREAM_DEPENDENCIES.some(
      (d) => d.upstreamVersion === V74_DECISION_FREEZE_VERSION,
    ) &&
    AGENT_UPSTREAM_DEPENDENCIES.some(
      (d) => d.upstreamVersion === V74_DECISION_SIGNOFF_VERSION,
    ) &&
    AGENT_UPSTREAM_DEPENDENCIES.every((d) => d.upstreamVersion.length > 0)
  );
}

export function getAgentDependencyById(id: string): AgentUpstreamDependency | undefined {
  return AGENT_UPSTREAM_DEPENDENCIES.find((d) => d.id === id);
}

export function getAgentDependenciesByDecisionRef(
  decisionRef: string,
): AgentUpstreamDependency[] {
  return AGENT_UPSTREAM_DEPENDENCIES.filter((d) => d.decisionRef === decisionRef);
}

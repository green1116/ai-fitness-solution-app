/**
 * V76 P1 — Collaboration upstream dependencies (read-only)
 */
import {
  V75_AGENT_FREEZE_VERSION,
  V75_AGENT_SIGNOFF_VERSION,
} from "@/lib/agent/v75/signoff/signoff.types";
import { V75_AGENT_VERSION } from "@/lib/agent/v75/agent.types";

export type CollaborationUpstreamDependency = {
  id: string;
  upstreamVersion: string;
  agentRef: string;
  required: boolean;
  description: string;
};

export const COLLABORATION_UPSTREAM_DEPENDENCIES: CollaborationUpstreamDependency[] = [
  {
    id: "COL-DEP-001",
    upstreamVersion: V75_AGENT_FREEZE_VERSION,
    agentRef: "AGT-001",
    required: true,
    description: "V75 agent freeze baseline upstream lock",
  },
  {
    id: "COL-DEP-002",
    upstreamVersion: V75_AGENT_SIGNOFF_VERSION,
    agentRef: "AGT-008",
    required: true,
    description: "V75 agent sign-off upstream lock",
  },
  {
    id: "COL-DEP-003",
    upstreamVersion: V75_AGENT_VERSION,
    agentRef: "AGT-001",
    required: true,
    description: "V75 P1 agent inventory upstream",
  },
  {
    id: "COL-DEP-004",
    upstreamVersion: "v75-agent-policy-catalog-1",
    agentRef: "AGT-002",
    required: true,
    description: "V75 P2 agent policy catalog upstream",
  },
  {
    id: "COL-DEP-005",
    upstreamVersion: "v75-agent-context-catalog-1",
    agentRef: "AGT-003",
    required: true,
    description: "V75 P3 agent context catalog upstream",
  },
  {
    id: "COL-DEP-006",
    upstreamVersion: "v75-agent-compliance-catalog-1",
    agentRef: "AGT-007",
    required: true,
    description: "V75 P7 agent compliance upstream",
  },
  {
    id: "COL-DEP-007",
    upstreamVersion: "v74-decision-freeze-1",
    agentRef: "AGT-001",
    required: true,
    description: "V74 decision freeze transitive upstream",
  },
  {
    id: "COL-DEP-008",
    upstreamVersion: "v76-collaboration-inventory-1",
    agentRef: "COL-001",
    required: true,
    description: "V76 P1 collaboration inventory self-reference",
  },
];

export function isCollaborationUpstreamAligned(): boolean {
  return (
    COLLABORATION_UPSTREAM_DEPENDENCIES.length >= 6 &&
    COLLABORATION_UPSTREAM_DEPENDENCIES.some(
      (d) => d.upstreamVersion === V75_AGENT_FREEZE_VERSION,
    ) &&
    COLLABORATION_UPSTREAM_DEPENDENCIES.some(
      (d) => d.upstreamVersion === V75_AGENT_SIGNOFF_VERSION,
    ) &&
    COLLABORATION_UPSTREAM_DEPENDENCIES.every((d) => d.upstreamVersion.length > 0)
  );
}

export function getCollaborationDependencyById(
  id: string,
): CollaborationUpstreamDependency | undefined {
  return COLLABORATION_UPSTREAM_DEPENDENCIES.find((d) => d.id === id);
}

export function getCollaborationDependenciesByAgentRef(
  agentRef: string,
): CollaborationUpstreamDependency[] {
  return COLLABORATION_UPSTREAM_DEPENDENCIES.filter((d) => d.agentRef === agentRef);
}

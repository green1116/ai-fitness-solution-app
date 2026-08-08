/**
 * V80 Pilot P13 — Governance state store (same in-memory pilot knowledge layer)
 */

import type { OrgKnowledgeGovernanceState } from "./org-knowledge-governance.schema";

declare global {
  // eslint-disable-next-line no-var
  var __v80PilotOrgKnowledgeGovernance:
    | Map<string, OrgKnowledgeGovernanceState>
    | undefined;
}

function states(): Map<string, OrgKnowledgeGovernanceState> {
  globalThis.__v80PilotOrgKnowledgeGovernance ||= new Map();
  return globalThis.__v80PilotOrgKnowledgeGovernance;
}

export function getOrgKnowledgeGovernance(
  organizationId: string,
): OrgKnowledgeGovernanceState | null {
  return states().get(organizationId) ?? null;
}

export function saveOrgKnowledgeGovernance(
  state: OrgKnowledgeGovernanceState,
): OrgKnowledgeGovernanceState {
  states().set(state.organizationId, state);
  return state;
}

export function clearOrgKnowledgeGovernanceForTests(): void {
  globalThis.__v80PilotOrgKnowledgeGovernance = new Map();
}

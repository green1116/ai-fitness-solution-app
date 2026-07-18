/**
 * E07-P5 — Human-AI Collaboration Registry
 * Collaborations bind human gates onto E07 orchestrations
 */

import { getOrchestrationById } from "../orchestration/orchestration.registry";
import {
  COLLABORATION_MODES,
  E07_COLLABORATION_BASE,
  E07_COLLABORATION_FREEZE_VERSION,
  E07_COLLABORATION_ID,
  E07_COLLABORATION_VERSION,
} from "./collaboration.constants";
import type {
  CollaborationDefinition,
  CollaborationMode,
  CollaborationRegistryManifest,
} from "./collaboration.types";

export const COLLABORATION_CATALOG: CollaborationDefinition[] = [
  {
    id: "e07.collab.campaign-review",
    name: "Campaign Human Review",
    mode: "review",
    description:
      "Human reviews the enterprise campaign orchestration before AI runs",
    orchestrationId: "e07.orch.enterprise-campaign",
    humanRole: "commercial-lead",
    requiresApproval: true,
    optional: false,
    readOnly: true,
  },
  {
    id: "e07.collab.guardrail-approve",
    name: "Guardrail Human Approval",
    mode: "approve",
    description: "Human approves risk guardrail orchestration",
    orchestrationId: "e07.orch.risk-guardrail",
    humanRole: "risk-owner",
    requiresApproval: true,
    optional: false,
    readOnly: true,
  },
  {
    id: "e07.collab.handoff-cowork",
    name: "Handoff Co-Work Session",
    mode: "co-work",
    description: "Human co-works with AI on full workforce handoff",
    orchestrationId: "e07.orch.full-handoff",
    humanRole: "delivery-lead",
    requiresApproval: true,
    optional: false,
    readOnly: true,
  },
];

export function assertCollaborationDefinition(
  collaboration: CollaborationDefinition,
): void {
  if (!collaboration.id.trim()) {
    throw new Error("collaboration.id is required");
  }
  if (!collaboration.name.trim()) {
    throw new Error("collaboration.name is required");
  }
  if (!(COLLABORATION_MODES as readonly string[]).includes(collaboration.mode)) {
    throw new Error(`invalid collaboration mode: ${collaboration.mode}`);
  }
  if (!collaboration.humanRole.trim()) {
    throw new Error("humanRole is required");
  }
  if (collaboration.readOnly !== true) throw new Error("readOnly must be true");

  if (!getOrchestrationById(collaboration.orchestrationId)) {
    throw new Error(
      `missing E07 orchestration: ${collaboration.orchestrationId}`,
    );
  }
}

export function getCollaborationById(
  id: string,
): CollaborationDefinition | undefined {
  return COLLABORATION_CATALOG.find((c) => c.id === id);
}

export function getCollaborationByMode(
  mode: CollaborationMode,
): CollaborationDefinition | undefined {
  return COLLABORATION_CATALOG.find((c) => c.mode === mode);
}

export function buildCollaborationRegistryManifest(
  collaborations: CollaborationDefinition[] = COLLABORATION_CATALOG,
): CollaborationRegistryManifest {
  for (const collaboration of collaborations) {
    assertCollaborationDefinition(collaboration);
  }

  const modes = [...new Set(collaborations.map((c) => c.mode))];
  const catalogComplete = COLLABORATION_MODES.every((m) => modes.includes(m));
  if (!catalogComplete) {
    throw new Error("Collaboration catalog incomplete: missing modes");
  }

  return {
    collaborationId: E07_COLLABORATION_ID,
    version: E07_COLLABORATION_VERSION,
    freezeVersion: E07_COLLABORATION_FREEZE_VERSION,
    base: E07_COLLABORATION_BASE,
    collaborationCount: collaborations.length,
    modes,
    collaborations,
    catalogComplete: true,
    readOnly: true,
  };
}

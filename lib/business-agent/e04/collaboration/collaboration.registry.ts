/**
 * E04-P7 — Collaboration Registry
 * Registers collaboration blueprints over E04 business agents
 */

import { getBusinessAgentById } from "../core/business-agent.registry";
import { getCapabilityById } from "../capability/capability.registry";
import {
  E04_COLLABORATION_BASE,
  E04_COLLABORATION_FREEZE_VERSION,
  E04_COLLABORATION_RUNTIME_ID,
  E04_COLLABORATION_VERSION,
  COLLABORATION_PARTICIPANT_ROLES,
} from "./collaboration.constants";
import type {
  CollaborationDefinition,
  CollaborationParticipant,
  CollaborationRegistryManifest,
} from "./collaboration.types";

export const COLLABORATION_CATALOG: CollaborationDefinition[] = [
  {
    id: "e04.collab.tender-roundtable",
    name: "Tender Roundtable",
    description: "Tender lead with budget/equipment contributors and compliance review",
    optional: false,
    readOnly: true,
    participants: [
      {
        businessAgentId: "e04.business.tender",
        role: "lead",
        capabilityId: "e04.cap.intake",
        optional: false,
        readOnly: true,
      },
      {
        businessAgentId: "e04.business.budget",
        role: "contributor",
        capabilityId: "e04.cap.price",
        optional: false,
        readOnly: true,
      },
      {
        businessAgentId: "e04.business.equipment",
        role: "contributor",
        capabilityId: "e04.cap.estimate",
        optional: false,
        readOnly: true,
      },
      {
        businessAgentId: "e04.business.compliance",
        role: "reviewer",
        capabilityId: "e04.cap.review",
        optional: false,
        readOnly: true,
      },
    ],
  },
  {
    id: "e04.collab.delivery-handoff",
    name: "Delivery Handoff",
    description: "Delivery lead with compliance reviewer",
    optional: true,
    readOnly: true,
    participants: [
      {
        businessAgentId: "e04.business.delivery",
        role: "lead",
        capabilityId: "e04.cap.deliver",
        optional: false,
        readOnly: true,
      },
      {
        businessAgentId: "e04.business.compliance",
        role: "reviewer",
        capabilityId: "e04.cap.review",
        optional: false,
        readOnly: true,
      },
    ],
  },
];

function assertParticipant(participant: CollaborationParticipant): void {
  if (
    !(COLLABORATION_PARTICIPANT_ROLES as readonly string[]).includes(
      participant.role,
    )
  ) {
    throw new Error(`invalid participant role: ${participant.role}`);
  }
  if (participant.readOnly !== true) {
    throw new Error("participant.readOnly must be true");
  }

  const agent = getBusinessAgentById(participant.businessAgentId);
  if (!agent) {
    throw new Error(`unknown business agent: ${participant.businessAgentId}`);
  }
  if (participant.capabilityId) {
    if (!getCapabilityById(participant.capabilityId)) {
      throw new Error(`unknown capability: ${participant.capabilityId}`);
    }
    if (!agent.capabilityIds.includes(participant.capabilityId)) {
      throw new Error(
        `capability ${participant.capabilityId} not owned by ${agent.id}`,
      );
    }
  }
}

export function assertCollaborationDefinition(
  collaboration: CollaborationDefinition,
): void {
  if (!collaboration.id.trim()) throw new Error("collaboration.id is required");
  if (!collaboration.name.trim()) {
    throw new Error("collaboration.name is required");
  }
  if (collaboration.readOnly !== true) {
    throw new Error("readOnly must be true");
  }
  if (collaboration.participants.length < 2) {
    throw new Error(`collaboration ${collaboration.id} needs >= 2 participants`);
  }

  const leads = collaboration.participants.filter((p) => p.role === "lead");
  if (leads.length !== 1) {
    throw new Error(`collaboration ${collaboration.id} needs exactly one lead`);
  }

  const ids = new Set<string>();
  for (const participant of collaboration.participants) {
    assertParticipant(participant);
    if (ids.has(participant.businessAgentId)) {
      throw new Error(
        `duplicate participant ${participant.businessAgentId} in ${collaboration.id}`,
      );
    }
    ids.add(participant.businessAgentId);
  }
}

export function buildCollaborationRegistryManifest(
  collaborations: CollaborationDefinition[] = COLLABORATION_CATALOG,
): CollaborationRegistryManifest {
  for (const collaboration of collaborations) {
    assertCollaborationDefinition(collaboration);
  }

  const required = collaborations.some((c) => !c.optional);
  if (!required) {
    throw new Error("collaboration catalog missing required entry");
  }

  return {
    runtimeId: E04_COLLABORATION_RUNTIME_ID,
    version: E04_COLLABORATION_VERSION,
    freezeVersion: E04_COLLABORATION_FREEZE_VERSION,
    base: E04_COLLABORATION_BASE,
    collaborationCount: collaborations.length,
    collaborations,
    catalogComplete: true,
    readOnly: true,
  };
}

export function getCollaborationById(
  id: string,
): CollaborationDefinition | undefined {
  return COLLABORATION_CATALOG.find((c) => c.id === id);
}

export function listRequiredCollaborations(): CollaborationDefinition[] {
  return COLLABORATION_CATALOG.filter((c) => !c.optional);
}

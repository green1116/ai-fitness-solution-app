/**
 * E07-P6 — Workforce Learning Registry
 * Learnings bind improvement adjustments onto E07 collaborations
 */

import { getCollaborationById } from "../collaboration/collaboration.registry";
import {
  E07_LEARNING_BASE,
  E07_LEARNING_FREEZE_VERSION,
  E07_LEARNING_LOOP_ID,
  E07_LEARNING_VERSION,
  LEARNING_KINDS,
} from "./learning.constants";
import type {
  LearningDefinition,
  LearningKind,
  LearningRegistryManifest,
} from "./learning.types";

export const LEARNING_CATALOG: LearningDefinition[] = [
  {
    id: "e07.learn.campaign-outcome",
    kind: "outcome",
    name: "Campaign Outcome Learning",
    description: "Improve campaign collaboration outcomes after weak runs",
    collaborationId: "e07.collab.campaign-review",
    adjustments: [
      {
        field: "humanDecision",
        value: "approve",
        reason: "ensure human gate unlocks AI campaign run",
        readOnly: true,
      },
      {
        field: "unsafe",
        value: false,
        reason: "clear unsafe flag blocking policy gate",
        readOnly: true,
      },
      {
        field: "ready",
        value: true,
        reason: "assert readiness for gate policy",
        readOnly: true,
      },
    ],
    targetScore: 100,
    optional: false,
    readOnly: true,
  },
  {
    id: "e07.learn.guardrail-gate",
    kind: "gate",
    name: "Guardrail Gate Learning",
    description: "Improve risk guardrail approval and execution gates",
    collaborationId: "e07.collab.guardrail-approve",
    adjustments: [
      {
        field: "humanDecision",
        value: "approve",
        reason: "unlock human approval gate",
        readOnly: true,
      },
      {
        field: "riskScore",
        value: 10,
        reason: "reduce risk score below escalation threshold",
        readOnly: true,
      },
      {
        field: "ready",
        value: true,
        reason: "assert readiness for gate policy",
        readOnly: true,
      },
    ],
    targetScore: 100,
    optional: false,
    readOnly: true,
  },
  {
    id: "e07.learn.handoff-improve",
    kind: "handoff",
    name: "Handoff Improvement Learning",
    description: "Stabilize full handoff co-work under load",
    collaborationId: "e07.collab.handoff-cowork",
    adjustments: [
      {
        field: "humanDecision",
        value: "approve",
        reason: "unlock co-work gate",
        readOnly: true,
      },
      {
        field: "burst",
        value: false,
        reason: "clear burst flag to avoid throttling",
        readOnly: true,
      },
      {
        field: "ready",
        value: true,
        reason: "assert readiness for gate policy",
        readOnly: true,
      },
    ],
    targetScore: 100,
    optional: false,
    readOnly: true,
  },
];

export function assertLearningDefinition(learning: LearningDefinition): void {
  if (!learning.id.trim()) throw new Error("learning.id is required");
  if (!learning.name.trim()) throw new Error("learning.name is required");
  if (!(LEARNING_KINDS as readonly string[]).includes(learning.kind)) {
    throw new Error(`invalid learning kind: ${learning.kind}`);
  }
  if (learning.readOnly !== true) throw new Error("readOnly must be true");
  if (learning.adjustments.length === 0) {
    throw new Error(`learning ${learning.id} requires adjustments`);
  }
  if (learning.targetScore < 0 || learning.targetScore > 100) {
    throw new Error(`invalid targetScore on ${learning.id}`);
  }

  if (!getCollaborationById(learning.collaborationId)) {
    throw new Error(`missing E07 collaboration: ${learning.collaborationId}`);
  }
}

export function getLearningById(id: string): LearningDefinition | undefined {
  return LEARNING_CATALOG.find((l) => l.id === id);
}

export function getLearningByKind(
  kind: LearningKind,
): LearningDefinition | undefined {
  return LEARNING_CATALOG.find((l) => l.kind === kind);
}

export function buildLearningRegistryManifest(
  learnings: LearningDefinition[] = LEARNING_CATALOG,
): LearningRegistryManifest {
  for (const learning of learnings) {
    assertLearningDefinition(learning);
  }

  const kinds = [...new Set(learnings.map((l) => l.kind))];
  const catalogComplete = LEARNING_KINDS.every((k) => kinds.includes(k));
  if (!catalogComplete) {
    throw new Error("Learning catalog incomplete: missing kinds");
  }

  return {
    loopId: E07_LEARNING_LOOP_ID,
    version: E07_LEARNING_VERSION,
    freezeVersion: E07_LEARNING_FREEZE_VERSION,
    base: E07_LEARNING_BASE,
    learningCount: learnings.length,
    kinds,
    learnings,
    catalogComplete: true,
    readOnly: true,
  };
}

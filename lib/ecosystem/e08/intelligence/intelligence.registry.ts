/**
 * E08-P5 — Ecosystem Intelligence Registry
 * Intelligence definitions bind analysis onto E08 workflows
 */

import { getWorkflowById } from "../workflow/workflow.registry";
import {
  E08_INTELLIGENCE_BASE,
  E08_INTELLIGENCE_FREEZE_VERSION,
  E08_INTELLIGENCE_ID,
  E08_INTELLIGENCE_VERSION,
  INTELLIGENCE_KINDS,
} from "./intelligence.constants";
import type {
  IntelligenceDefinition,
  IntelligenceKind,
  IntelligenceRegistryManifest,
} from "./intelligence.types";

export const INTELLIGENCE_CATALOG: IntelligenceDefinition[] = [
  {
    id: "e08.intel.supply-coverage",
    kind: "coverage",
    name: "Supply Coverage Intelligence",
    description: "Analyzes supply fulfillment workflow coverage",
    workflowId: "e08.workflow.supply-fulfill",
    signals: [
      {
        field: "ready",
        value: true,
        reason: "assert readiness for supply exchange gates",
        readOnly: true,
      },
      {
        field: "riskScore",
        value: 10,
        reason: "keep risk below escalation pressure",
        readOnly: true,
      },
    ],
    targetScore: 100,
    optional: false,
    readOnly: true,
  },
  {
    id: "e08.intel.market-expansion",
    kind: "expansion",
    name: "Market Expansion Intelligence",
    description: "Analyzes supply-to-distribution expansion workflow",
    workflowId: "e08.workflow.market-expand",
    signals: [
      {
        field: "ready",
        value: true,
        reason: "assert readiness for multi-listing expansion",
        readOnly: true,
      },
      {
        field: "unsafe",
        value: false,
        reason: "clear unsafe flag blocking partner exchange",
        readOnly: true,
      },
    ],
    targetScore: 100,
    optional: false,
    readOnly: true,
  },
  {
    id: "e08.intel.enterprise-coherence",
    kind: "coherence",
    name: "Enterprise Coherence Intelligence",
    description: "Analyzes full handoff coherence across the ecosystem",
    workflowId: "e08.workflow.enterprise-handoff",
    signals: [
      {
        field: "ready",
        value: true,
        reason: "assert readiness for handoff coherence",
        readOnly: true,
      },
      {
        field: "riskScore",
        value: 10,
        reason: "stabilize governance handoff under load",
        readOnly: true,
      },
    ],
    targetScore: 100,
    optional: false,
    readOnly: true,
  },
];

export function assertIntelligenceDefinition(
  definition: IntelligenceDefinition,
): void {
  if (!definition.id.trim()) throw new Error("definition.id is required");
  if (!definition.name.trim()) throw new Error("definition.name is required");
  if (!(INTELLIGENCE_KINDS as readonly string[]).includes(definition.kind)) {
    throw new Error(`invalid intelligence kind: ${definition.kind}`);
  }
  if (definition.readOnly !== true) throw new Error("readOnly must be true");
  if (definition.signals.length === 0) {
    throw new Error(`definition ${definition.id} requires signals`);
  }
  if (definition.targetScore < 0 || definition.targetScore > 100) {
    throw new Error(`invalid targetScore on ${definition.id}`);
  }

  if (!getWorkflowById(definition.workflowId)) {
    throw new Error(`missing E08 workflow: ${definition.workflowId}`);
  }
}

export function getIntelligenceById(
  id: string,
): IntelligenceDefinition | undefined {
  return INTELLIGENCE_CATALOG.find((d) => d.id === id);
}

export function getIntelligenceByKind(
  kind: IntelligenceKind,
): IntelligenceDefinition | undefined {
  return INTELLIGENCE_CATALOG.find((d) => d.kind === kind);
}

export function listIntelligenceForWorkflow(
  workflowId: string,
): IntelligenceDefinition[] {
  return INTELLIGENCE_CATALOG.filter((d) => d.workflowId === workflowId);
}

export function buildIntelligenceRegistryManifest(
  definitions: IntelligenceDefinition[] = INTELLIGENCE_CATALOG,
): IntelligenceRegistryManifest {
  for (const definition of definitions) {
    assertIntelligenceDefinition(definition);
  }

  const kinds = [...new Set(definitions.map((d) => d.kind))];
  const catalogComplete = INTELLIGENCE_KINDS.every((k) => kinds.includes(k));
  if (!catalogComplete) {
    throw new Error("Intelligence catalog incomplete: missing kinds");
  }

  return {
    intelligenceId: E08_INTELLIGENCE_ID,
    version: E08_INTELLIGENCE_VERSION,
    freezeVersion: E08_INTELLIGENCE_FREEZE_VERSION,
    base: E08_INTELLIGENCE_BASE,
    definitionCount: definitions.length,
    kinds,
    definitions,
    catalogComplete: true,
    readOnly: true,
  };
}

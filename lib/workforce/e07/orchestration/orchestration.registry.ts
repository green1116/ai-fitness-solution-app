/**
 * E07-P4 — Workforce Orchestration Registry
 * Orchestrations bind ordered marketplace role deployments
 */

import { getRoleById } from "../marketplace/role.registry";
import {
  E07_ORCHESTRATION_BASE,
  E07_ORCHESTRATION_FREEZE_VERSION,
  E07_ORCHESTRATION_ID,
  E07_ORCHESTRATION_VERSION,
  ORCHESTRATION_KINDS,
} from "./orchestration.constants";
import type {
  OrchestrationDefinition,
  OrchestrationKind,
  OrchestrationRegistryManifest,
} from "./orchestration.types";

export const ORCHESTRATION_CATALOG: OrchestrationDefinition[] = [
  {
    id: "e07.orch.enterprise-campaign",
    name: "Enterprise Campaign Orchestration",
    kind: "campaign",
    goal: "Run commercial bid and risk roles as a coordinated campaign",
    description: "Deploy bid agent then risk agent for end-to-end campaign",
    roleIds: ["e07.role.bid-agent", "e07.role.risk-agent"],
    optional: false,
    readOnly: true,
  },
  {
    id: "e07.orch.risk-guardrail",
    name: "Risk Guardrail Orchestration",
    kind: "guardrail",
    goal: "Guard delivery with risk and delivery role coverage",
    description: "Deploy risk agent then delivery agent as a guardrail path",
    roleIds: ["e07.role.risk-agent", "e07.role.delivery-agent"],
    optional: false,
    readOnly: true,
  },
  {
    id: "e07.orch.full-handoff",
    name: "Full Workforce Handoff Orchestration",
    kind: "handoff",
    goal: "Hand off commercial → risk → delivery across the marketplace",
    description: "Deploy all three marketplace roles in sequence",
    roleIds: [
      "e07.role.bid-agent",
      "e07.role.risk-agent",
      "e07.role.delivery-agent",
    ],
    optional: false,
    readOnly: true,
  },
];

export function assertOrchestrationDefinition(
  orchestration: OrchestrationDefinition,
): void {
  if (!orchestration.id.trim()) {
    throw new Error("orchestration.id is required");
  }
  if (!orchestration.name.trim()) {
    throw new Error("orchestration.name is required");
  }
  if (!orchestration.goal.trim()) {
    throw new Error("orchestration.goal is required");
  }
  if (!(ORCHESTRATION_KINDS as readonly string[]).includes(orchestration.kind)) {
    throw new Error(`invalid orchestration kind: ${orchestration.kind}`);
  }
  if (orchestration.readOnly !== true) throw new Error("readOnly must be true");
  if (orchestration.roleIds.length === 0) {
    throw new Error(`orchestration ${orchestration.id} requires roles`);
  }

  for (const roleId of orchestration.roleIds) {
    const role = getRoleById(roleId);
    if (!role) {
      throw new Error(`unknown role ${roleId} on ${orchestration.id}`);
    }
    if (role.listingStatus !== "deployable") {
      throw new Error(
        `role ${roleId} is not deployable on ${orchestration.id}`,
      );
    }
  }
}

export function getOrchestrationById(
  id: string,
): OrchestrationDefinition | undefined {
  return ORCHESTRATION_CATALOG.find((o) => o.id === id);
}

export function getOrchestrationByKind(
  kind: OrchestrationKind,
): OrchestrationDefinition | undefined {
  return ORCHESTRATION_CATALOG.find((o) => o.kind === kind);
}

export function buildOrchestrationRegistryManifest(
  orchestrations: OrchestrationDefinition[] = ORCHESTRATION_CATALOG,
): OrchestrationRegistryManifest {
  for (const orchestration of orchestrations) {
    assertOrchestrationDefinition(orchestration);
  }

  const kinds = [...new Set(orchestrations.map((o) => o.kind))];
  const catalogComplete = ORCHESTRATION_KINDS.every((k) => kinds.includes(k));
  if (!catalogComplete) {
    throw new Error("Orchestration catalog incomplete: missing kinds");
  }

  return {
    orchestrationId: E07_ORCHESTRATION_ID,
    version: E07_ORCHESTRATION_VERSION,
    freezeVersion: E07_ORCHESTRATION_FREEZE_VERSION,
    base: E07_ORCHESTRATION_BASE,
    orchestrationCount: orchestrations.length,
    kinds,
    orchestrations,
    catalogComplete: true,
    readOnly: true,
  };
}

/**
 * E07-P7 — Autonomous Organization Registry
 * Organizations bind ordered learning loops into enterprise units
 */

import { getLearningById } from "../learning/learning.registry";
import {
  E07_ORGANIZATION_BASE,
  E07_ORGANIZATION_FREEZE_VERSION,
  E07_ORGANIZATION_ID,
  E07_ORGANIZATION_VERSION,
  ORGANIZATION_KINDS,
} from "./organization.constants";
import type {
  OrganizationDefinition,
  OrganizationKind,
  OrganizationRegistryManifest,
} from "./organization.types";

export const ORGANIZATION_CATALOG: OrganizationDefinition[] = [
  {
    id: "e07.org.commercial-division",
    name: "Commercial Division",
    kind: "division",
    mission: "Learn and improve commercial campaign outcomes",
    description: "Division unit running campaign outcome learning",
    learningIds: ["e07.learn.campaign-outcome"],
    optional: false,
    readOnly: true,
  },
  {
    id: "e07.org.risk-program",
    name: "Risk Guardrail Program",
    kind: "program",
    mission: "Stabilize risk gates across commercial and guardrail learning",
    description: "Program spanning campaign and guardrail learning loops",
    learningIds: ["e07.learn.campaign-outcome", "e07.learn.guardrail-gate"],
    optional: false,
    readOnly: true,
  },
  {
    id: "e07.org.enterprise-os",
    name: "Enterprise Workforce OS",
    kind: "enterprise",
    mission: "Operate the full autonomous workforce learning organization",
    description: "Enterprise organization covering outcome, gate, and handoff learning",
    learningIds: [
      "e07.learn.campaign-outcome",
      "e07.learn.guardrail-gate",
      "e07.learn.handoff-improve",
    ],
    optional: false,
    readOnly: true,
  },
];

export function assertOrganizationDefinition(
  organization: OrganizationDefinition,
): void {
  if (!organization.id.trim()) {
    throw new Error("organization.id is required");
  }
  if (!organization.name.trim()) {
    throw new Error("organization.name is required");
  }
  if (!organization.mission.trim()) {
    throw new Error("organization.mission is required");
  }
  if (!(ORGANIZATION_KINDS as readonly string[]).includes(organization.kind)) {
    throw new Error(`invalid organization kind: ${organization.kind}`);
  }
  if (organization.readOnly !== true) throw new Error("readOnly must be true");
  if (organization.learningIds.length === 0) {
    throw new Error(`organization ${organization.id} requires learnings`);
  }

  for (const learningId of organization.learningIds) {
    if (!getLearningById(learningId)) {
      throw new Error(`unknown learning ${learningId} on ${organization.id}`);
    }
  }
}

export function getOrganizationById(
  id: string,
): OrganizationDefinition | undefined {
  return ORGANIZATION_CATALOG.find((o) => o.id === id);
}

export function getOrganizationByKind(
  kind: OrganizationKind,
): OrganizationDefinition | undefined {
  return ORGANIZATION_CATALOG.find((o) => o.kind === kind);
}

export function buildOrganizationRegistryManifest(
  organizations: OrganizationDefinition[] = ORGANIZATION_CATALOG,
): OrganizationRegistryManifest {
  for (const organization of organizations) {
    assertOrganizationDefinition(organization);
  }

  const kinds = [...new Set(organizations.map((o) => o.kind))];
  const catalogComplete = ORGANIZATION_KINDS.every((k) => kinds.includes(k));
  if (!catalogComplete) {
    throw new Error("Organization catalog incomplete: missing kinds");
  }

  return {
    organizationId: E07_ORGANIZATION_ID,
    version: E07_ORGANIZATION_VERSION,
    freezeVersion: E07_ORGANIZATION_FREEZE_VERSION,
    base: E07_ORGANIZATION_BASE,
    organizationCount: organizations.length,
    kinds,
    organizations,
    catalogComplete: true,
    readOnly: true,
  };
}

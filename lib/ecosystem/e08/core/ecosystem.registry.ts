/**
 * E08-P1 — Ecosystem Registry
 * Binds ecosystem partners onto E07 digital workers
 */

import { getWorkerById } from "../../../workforce/e07/core/workforce.registry";
import { getRelationshipById } from "../relationship/relationship.registry";
import {
  E08_ECOSYSTEM_BASE,
  E08_ECOSYSTEM_FREEZE_VERSION,
  E08_ECOSYSTEM_PLATFORM_ID,
  E08_ECOSYSTEM_VERSION,
  ECOSYSTEM_DOMAINS,
} from "./ecosystem.constants";
import type {
  EcosystemDomain,
  EcosystemPartnerDefinition,
  EcosystemRegistryManifest,
} from "./ecosystem.types";

export const ECOSYSTEM_PARTNER_CATALOG: EcosystemPartnerDefinition[] = [
  {
    id: "e08.partner.supplier",
    name: "Equipment Supplier",
    domain: "supplier",
    description: "Supplies fitness equipment signals via observer worker",
    workerId: "e07.worker.observer",
    relationshipIds: ["e08.rel.supply", "e08.rel.serve"],
    dependsOn: [],
    optional: false,
    readOnly: true,
  },
  {
    id: "e08.partner.channel",
    name: "Channel Distributor",
    domain: "channel",
    description: "Distributes commercial offers via analyst worker",
    workerId: "e07.worker.analyst",
    relationshipIds: ["e08.rel.distribute", "e08.rel.alliance"],
    dependsOn: ["e08.partner.supplier"],
    optional: false,
    readOnly: true,
  },
  {
    id: "e08.partner.customer",
    name: "Enterprise Customer",
    domain: "customer",
    description: "Receives delivery execution via executor worker",
    workerId: "e07.worker.executor",
    relationshipIds: ["e08.rel.serve", "e08.rel.supply"],
    dependsOn: ["e08.partner.supplier"],
    optional: false,
    readOnly: true,
  },
  {
    id: "e08.partner.regulator",
    name: "Compliance Regulator",
    domain: "regulator",
    description: "Audits ecosystem compliance via auditor worker",
    workerId: "e07.worker.auditor",
    relationshipIds: ["e08.rel.comply", "e08.rel.alliance"],
    dependsOn: ["e08.partner.channel", "e08.partner.customer"],
    optional: false,
    readOnly: true,
  },
  {
    id: "e08.partner.alliance",
    name: "Strategic Alliance Partner",
    domain: "partner",
    description: "Escalates joint delivery posture via escalator worker",
    workerId: "e07.worker.escalator",
    relationshipIds: ["e08.rel.alliance", "e08.rel.distribute"],
    dependsOn: ["e08.partner.regulator"],
    optional: false,
    readOnly: true,
  },
  {
    id: "e08.partner.hub",
    name: "Ecosystem Coordination Hub",
    domain: "hub",
    description: "Coordinates the ecosystem via orchestrator worker",
    workerId: "e07.worker.orchestrator",
    relationshipIds: ["e08.rel.coordinate", "e08.rel.alliance"],
    dependsOn: [
      "e08.partner.supplier",
      "e08.partner.channel",
      "e08.partner.customer",
      "e08.partner.regulator",
      "e08.partner.alliance",
    ],
    optional: false,
    readOnly: true,
  },
];

function assertPartnerDefinition(partner: EcosystemPartnerDefinition): void {
  if (!partner.id.trim()) throw new Error("partner.id is required");
  if (!partner.name.trim()) throw new Error("partner.name is required");
  if (!(ECOSYSTEM_DOMAINS as readonly string[]).includes(partner.domain)) {
    throw new Error(`invalid ecosystem domain: ${partner.domain}`);
  }
  if (partner.readOnly !== true) throw new Error("readOnly must be true");
  if (partner.relationshipIds.length === 0) {
    throw new Error(`partner ${partner.id} requires relationships`);
  }

  if (!getWorkerById(partner.workerId)) {
    throw new Error(`missing E07 worker: ${partner.workerId}`);
  }

  for (const relationshipId of partner.relationshipIds) {
    if (!getRelationshipById(relationshipId)) {
      throw new Error(
        `unknown relationship ${relationshipId} on ${partner.id}`,
      );
    }
  }
}

export function isPartnerDependencyGraphValid(
  partners: EcosystemPartnerDefinition[] = ECOSYSTEM_PARTNER_CATALOG,
): boolean {
  const ids = new Set(partners.map((p) => p.id));
  for (const partner of partners) {
    for (const dep of partner.dependsOn) {
      if (!ids.has(dep)) return false;
    }
  }
  return true;
}

export function buildEcosystemRegistryManifest(
  partners: EcosystemPartnerDefinition[] = ECOSYSTEM_PARTNER_CATALOG,
): EcosystemRegistryManifest {
  for (const partner of partners) {
    assertPartnerDefinition(partner);
  }
  if (!isPartnerDependencyGraphValid(partners)) {
    throw new Error("Partner dependency graph is invalid");
  }

  const domains = [...new Set(partners.map((p) => p.domain))];
  const requiredDomains: EcosystemDomain[] = [...ECOSYSTEM_DOMAINS];
  const catalogComplete = requiredDomains.every((d) => domains.includes(d));
  if (!catalogComplete) {
    throw new Error("Ecosystem catalog incomplete: missing domains");
  }

  return {
    platformId: E08_ECOSYSTEM_PLATFORM_ID,
    version: E08_ECOSYSTEM_VERSION,
    freezeVersion: E08_ECOSYSTEM_FREEZE_VERSION,
    base: E08_ECOSYSTEM_BASE,
    partnerCount: partners.length,
    domains,
    partners,
    catalogComplete: true,
    readOnly: true,
  };
}

export function getPartnerById(
  id: string,
): EcosystemPartnerDefinition | undefined {
  return ECOSYSTEM_PARTNER_CATALOG.find((p) => p.id === id);
}

export function getPartnerByDomain(
  domain: EcosystemDomain,
): EcosystemPartnerDefinition | undefined {
  return ECOSYSTEM_PARTNER_CATALOG.find((p) => p.domain === domain);
}

export function listExecutablePartners(): EcosystemPartnerDefinition[] {
  return ECOSYSTEM_PARTNER_CATALOG.filter((p) => p.domain !== "hub");
}

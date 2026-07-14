/**
 * E05-P1 — Intelligence Registry
 * Binds intelligence modules onto E04 business agents
 */

import { getBusinessAgentById } from "../../../business-agent/e04/core/business-agent.registry";
import { getCapabilityById } from "../../../business-agent/e04/capability/capability.registry";
import { getInsightById } from "../insight/insight.registry";
import {
  E05_INTELLIGENCE_BASE,
  E05_INTELLIGENCE_FREEZE_VERSION,
  E05_INTELLIGENCE_PLATFORM_ID,
  E05_INTELLIGENCE_VERSION,
  INTELLIGENCE_DOMAINS,
} from "./intelligence.constants";
import type {
  IntelligenceDefinition,
  IntelligenceDomain,
  IntelligenceRegistryManifest,
} from "./intelligence.types";

export const INTELLIGENCE_CATALOG: IntelligenceDefinition[] = [
  {
    id: "e05.intel.opportunity",
    name: "Opportunity Intelligence",
    domain: "opportunity",
    description: "Scores and frames tender/project opportunity signals",
    businessAgentId: "e04.business.tender",
    capabilityId: "e04.cap.intake",
    insightIds: ["e05.insight.signal", "e05.insight.score"],
    dependsOn: [],
    optional: false,
    readOnly: true,
  },
  {
    id: "e05.intel.pricing",
    name: "Pricing Intelligence",
    domain: "pricing",
    description: "Derives pricing posture insights from budget agents",
    businessAgentId: "e04.business.budget",
    capabilityId: "e04.cap.price",
    insightIds: ["e05.insight.forecast", "e05.insight.recommendation"],
    dependsOn: ["e05.intel.opportunity"],
    optional: false,
    readOnly: true,
  },
  {
    id: "e05.intel.risk",
    name: "Risk Intelligence",
    domain: "risk",
    description: "Surfaces equipment/scope risk anomalies",
    businessAgentId: "e04.business.equipment",
    capabilityId: "e04.cap.estimate",
    insightIds: ["e05.insight.anomaly", "e05.insight.trend"],
    dependsOn: ["e05.intel.opportunity"],
    optional: false,
    readOnly: true,
  },
  {
    id: "e05.intel.compliance",
    name: "Compliance Intelligence",
    domain: "compliance",
    description: "Compliance readiness and gate insights",
    businessAgentId: "e04.business.compliance",
    capabilityId: "e04.cap.review",
    insightIds: ["e05.insight.score", "e05.insight.recommendation"],
    dependsOn: ["e05.intel.pricing", "e05.intel.risk"],
    optional: false,
    readOnly: true,
  },
  {
    id: "e05.intel.delivery",
    name: "Delivery Intelligence",
    domain: "delivery",
    description: "Delivery packaging and milestone intelligence",
    businessAgentId: "e04.business.delivery",
    capabilityId: "e04.cap.deliver",
    insightIds: ["e05.insight.forecast", "e05.insight.signal"],
    dependsOn: ["e05.intel.compliance"],
    optional: false,
    readOnly: true,
  },
  {
    id: "e05.intel.synthesis",
    name: "Synthesis Intelligence",
    domain: "synthesis",
    description: "Synthesizes cross-domain intelligence over coordinator",
    businessAgentId: "e04.business.coordinator",
    capabilityId: "e04.cap.coordinate",
    insightIds: ["e05.insight.recommendation", "e05.insight.score"],
    dependsOn: [
      "e05.intel.opportunity",
      "e05.intel.pricing",
      "e05.intel.risk",
      "e05.intel.compliance",
      "e05.intel.delivery",
    ],
    optional: false,
    readOnly: true,
  },
];

function assertIntelligenceDefinition(module: IntelligenceDefinition): void {
  if (!module.id.trim()) throw new Error("intelligence.id is required");
  if (!module.name.trim()) throw new Error("intelligence.name is required");
  if (!(INTELLIGENCE_DOMAINS as readonly string[]).includes(module.domain)) {
    throw new Error(`invalid domain: ${module.domain}`);
  }
  if (module.readOnly !== true) throw new Error("readOnly must be true");

  const agent = getBusinessAgentById(module.businessAgentId);
  if (!agent) {
    throw new Error(`missing E04 business agent: ${module.businessAgentId}`);
  }

  if (module.capabilityId) {
    if (!getCapabilityById(module.capabilityId)) {
      throw new Error(`unknown capability: ${module.capabilityId}`);
    }
    if (!agent.capabilityIds.includes(module.capabilityId)) {
      throw new Error(
        `capability ${module.capabilityId} not owned by ${agent.id}`,
      );
    }
  }

  for (const insightId of module.insightIds) {
    if (!getInsightById(insightId)) {
      throw new Error(`unknown insight ${insightId} on ${module.id}`);
    }
  }
}

export function isIntelligenceDependencyGraphValid(
  modules: IntelligenceDefinition[] = INTELLIGENCE_CATALOG,
): boolean {
  const ids = new Set(modules.map((m) => m.id));
  for (const module of modules) {
    for (const dep of module.dependsOn) {
      if (!ids.has(dep)) return false;
    }
  }
  return true;
}

export function buildIntelligenceRegistryManifest(
  modules: IntelligenceDefinition[] = INTELLIGENCE_CATALOG,
): IntelligenceRegistryManifest {
  for (const module of modules) {
    assertIntelligenceDefinition(module);
  }
  if (!isIntelligenceDependencyGraphValid(modules)) {
    throw new Error("Intelligence dependency graph is invalid");
  }

  const domains = [...new Set(modules.map((m) => m.domain))];
  const requiredDomains: IntelligenceDomain[] = [...INTELLIGENCE_DOMAINS];
  const catalogComplete = requiredDomains.every((d) => domains.includes(d));
  if (!catalogComplete) {
    throw new Error("Intelligence catalog incomplete: missing domains");
  }

  return {
    platformId: E05_INTELLIGENCE_PLATFORM_ID,
    version: E05_INTELLIGENCE_VERSION,
    freezeVersion: E05_INTELLIGENCE_FREEZE_VERSION,
    base: E05_INTELLIGENCE_BASE,
    moduleCount: modules.length,
    domains,
    modules,
    catalogComplete: true,
    readOnly: true,
  };
}

export function getIntelligenceById(
  id: string,
): IntelligenceDefinition | undefined {
  return INTELLIGENCE_CATALOG.find((m) => m.id === id);
}

export function getIntelligenceByDomain(
  domain: IntelligenceDomain,
): IntelligenceDefinition | undefined {
  return INTELLIGENCE_CATALOG.find((m) => m.domain === domain);
}

export function listExecutableIntelligenceModules(): IntelligenceDefinition[] {
  return INTELLIGENCE_CATALOG.filter((m) => m.domain !== "synthesis");
}

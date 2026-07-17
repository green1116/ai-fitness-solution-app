/**
 * E06-P6 — Enterprise Digital Twin Registry
 * Twins bind state models onto E06 optimizations
 */

import { getOptimizationById } from "../optimization/optimization.registry";
import {
  E06_TWIN_BASE,
  E06_TWIN_FREEZE_VERSION,
  E06_TWIN_ID,
  E06_TWIN_VERSION,
  TWIN_DOMAINS,
} from "./twin.constants";
import type {
  TwinDefinition,
  TwinDomain,
  TwinRegistryManifest,
} from "./twin.types";

export const TWIN_CATALOG: TwinDefinition[] = [
  {
    id: "e06.twin.operations",
    name: "Operations Digital Twin",
    domain: "operations",
    description: "Model enterprise operations throughput and readiness",
    optimizationId: "e06.opt.response-throughput",
    signals: [
      { field: "readyRatio", value: 1, weight: 0.6, readOnly: true },
      { field: "loadFactor", value: 0.6, weight: 0.4, readOnly: true },
    ],
    stableThreshold: 80,
    optional: false,
    readOnly: true,
  },
  {
    id: "e06.twin.risk",
    name: "Risk Digital Twin",
    domain: "risk",
    description: "Model enterprise risk resilience posture",
    optimizationId: "e06.opt.risk-resilience",
    signals: [
      { field: "resilience", value: 0.9, weight: 0.7, readOnly: true },
      { field: "exposure", value: 0.6, weight: 0.3, readOnly: true },
    ],
    stableThreshold: 80,
    optional: false,
    readOnly: true,
  },
  {
    id: "e06.twin.delivery",
    name: "Delivery Digital Twin",
    domain: "delivery",
    description: "Model enterprise delivery quality posture",
    optimizationId: "e06.opt.escalation-quality",
    signals: [
      { field: "quality", value: 0.9, weight: 0.6, readOnly: true },
      { field: "backlog", value: 0.7, weight: 0.4, readOnly: true },
    ],
    stableThreshold: 80,
    optional: false,
    readOnly: true,
  },
];

export function assertTwinDefinition(twin: TwinDefinition): void {
  if (!twin.id.trim()) throw new Error("twin.id is required");
  if (!twin.name.trim()) throw new Error("twin.name is required");
  if (!(TWIN_DOMAINS as readonly string[]).includes(twin.domain)) {
    throw new Error(`invalid twin domain: ${twin.domain}`);
  }
  if (twin.readOnly !== true) throw new Error("readOnly must be true");
  if (twin.signals.length === 0) {
    throw new Error(`twin ${twin.id} requires signals`);
  }
  if (twin.stableThreshold < 0 || twin.stableThreshold > 100) {
    throw new Error(`invalid stableThreshold on ${twin.id}`);
  }

  if (!getOptimizationById(twin.optimizationId)) {
    throw new Error(`missing E06 optimization: ${twin.optimizationId}`);
  }
}

export function getTwinById(id: string): TwinDefinition | undefined {
  return TWIN_CATALOG.find((t) => t.id === id);
}

export function getTwinByDomain(domain: TwinDomain): TwinDefinition | undefined {
  return TWIN_CATALOG.find((t) => t.domain === domain);
}

export function buildTwinRegistryManifest(
  twins: TwinDefinition[] = TWIN_CATALOG,
): TwinRegistryManifest {
  for (const twin of twins) {
    assertTwinDefinition(twin);
  }

  const domains = [...new Set(twins.map((t) => t.domain))];
  const catalogComplete = TWIN_DOMAINS.every((d) => domains.includes(d));
  if (!catalogComplete) {
    throw new Error("Twin catalog incomplete: missing domains");
  }

  return {
    twinId: E06_TWIN_ID,
    version: E06_TWIN_VERSION,
    freezeVersion: E06_TWIN_FREEZE_VERSION,
    base: E06_TWIN_BASE,
    twinCount: twins.length,
    domains,
    twins,
    catalogComplete: true,
    readOnly: true,
  };
}

/**
 * Enterprise Platform v1 — Capability Index
 * Cross-layer capability catalog for E09 / E10 / E11
 */

import type {
  CapabilityDomain,
  CapabilityEntry,
  CapabilityIndex,
  EnterpriseLayerCode,
} from "./platform.v1.types";

export const ENTERPRISE_CAPABILITY_CATALOG: CapabilityEntry[] = [
  {
    id: "e09.global-network",
    layer: "E09",
    domain: "NETWORK",
    label: "Global network foundation",
    modulePath: "lib/global-network/e09/core/",
  },
  {
    id: "e09.regional",
    layer: "E09",
    domain: "NETWORK",
    label: "Regional federation",
    modulePath: "lib/global-network/e09/regional/",
  },
  {
    id: "e09.market",
    layer: "E09",
    domain: "NETWORK",
    label: "Market foundation",
    modulePath: "lib/global-network/e09/market/",
  },
  {
    id: "e09.federation",
    layer: "E09",
    domain: "NETWORK",
    label: "Federation mesh",
    modulePath: "lib/global-network/e09/federation/",
  },
  {
    id: "e09.economy",
    layer: "E09",
    domain: "AUTONOMOUS",
    label: "Autonomous network economy",
    modulePath: "lib/global-network/e09/economy/",
  },
  {
    id: "e09.agent",
    layer: "E09",
    domain: "AUTONOMOUS",
    label: "Global agent federation",
    modulePath: "lib/global-network/e09/agent/",
  },
  {
    id: "e09.civilization",
    layer: "E09",
    domain: "CONTROL",
    label: "Enterprise civilization OS",
    modulePath: "lib/global-network/e09/civilization/",
  },
  {
    id: "e10.foundation",
    layer: "E10",
    domain: "PLATFORM",
    label: "Platform foundation kernel",
    modulePath: "lib/platform/e10/core/",
  },
  {
    id: "e10.runtime",
    layer: "E10",
    domain: "RUNTIME",
    label: "Platform runtime services",
    modulePath: "lib/platform/e10/runtime/",
  },
  {
    id: "e10.resource",
    layer: "E10",
    domain: "GOVERNANCE",
    label: "Platform resource manager",
    modulePath: "lib/platform/e10/resource/",
  },
  {
    id: "e10.event",
    layer: "E10",
    domain: "PLATFORM",
    label: "Platform event bus",
    modulePath: "lib/platform/e10/event/",
  },
  {
    id: "e10.gateway",
    layer: "E10",
    domain: "PLATFORM",
    label: "Platform API gateway",
    modulePath: "lib/platform/e10/gateway/",
  },
  {
    id: "e10.marketplace",
    layer: "E10",
    domain: "PLATFORM",
    label: "Platform marketplace",
    modulePath: "lib/platform/e10/marketplace/",
  },
  {
    id: "e10.os",
    layer: "E10",
    domain: "CONTROL",
    label: "Enterprise platform OS",
    modulePath: "lib/platform/e10/os/",
  },
  {
    id: "e11.foundation",
    layer: "E11",
    domain: "RUNTIME",
    label: "Cloud runtime foundation",
    modulePath: "lib/cloud-runtime/e11/core/",
  },
  {
    id: "e11.execution",
    layer: "E11",
    domain: "RUNTIME",
    label: "Cloud execution manager",
    modulePath: "lib/cloud-runtime/e11/execution/",
  },
  {
    id: "e11.tenant",
    layer: "E11",
    domain: "GOVERNANCE",
    label: "Multi-tenant isolation",
    modulePath: "lib/cloud-runtime/e11/tenant/",
  },
  {
    id: "e11.governance",
    layer: "E11",
    domain: "GOVERNANCE",
    label: "Resource governance",
    modulePath: "lib/cloud-runtime/e11/governance/",
  },
  {
    id: "e11.observability",
    layer: "E11",
    domain: "OBSERVABILITY",
    label: "Cloud observability",
    modulePath: "lib/cloud-runtime/e11/observability/",
  },
  {
    id: "e11.autonomous",
    layer: "E11",
    domain: "AUTONOMOUS",
    label: "Autonomous operations",
    modulePath: "lib/cloud-runtime/e11/autonomous/",
  },
  {
    id: "e11.control-plane",
    layer: "E11",
    domain: "CONTROL",
    label: "Enterprise control plane",
    modulePath: "lib/cloud-runtime/e11/control-plane/",
  },
];

function groupByLayer(
  entries: CapabilityEntry[],
): Record<EnterpriseLayerCode, CapabilityEntry[]> {
  return {
    E09: entries.filter((e) => e.layer === "E09"),
    E10: entries.filter((e) => e.layer === "E10"),
    E11: entries.filter((e) => e.layer === "E11"),
  };
}

function groupByDomain(
  entries: CapabilityEntry[],
): Record<CapabilityDomain, CapabilityEntry[]> {
  const domains: CapabilityDomain[] = [
    "NETWORK",
    "PLATFORM",
    "RUNTIME",
    "GOVERNANCE",
    "OBSERVABILITY",
    "AUTONOMOUS",
    "CONTROL",
  ];
  const result = {} as Record<CapabilityDomain, CapabilityEntry[]>;
  for (const domain of domains) {
    result[domain] = entries.filter((e) => e.domain === domain);
  }
  return result;
}

export function buildCapabilityIndex(): CapabilityIndex {
  const entries = ENTERPRISE_CAPABILITY_CATALOG.map((entry) => ({ ...entry }));
  return {
    entries,
    byLayer: groupByLayer(entries),
    byDomain: groupByDomain(entries),
    count: entries.length,
  };
}

export function isCapabilityIndexComplete(): boolean {
  const index = buildCapabilityIndex();
  return (
    index.byLayer.E09.length >= 7 &&
    index.byLayer.E10.length >= 7 &&
    index.byLayer.E11.length >= 7 &&
    index.count === ENTERPRISE_CAPABILITY_CATALOG.length
  );
}

export function getCapabilitiesByLayer(
  layer: EnterpriseLayerCode,
): CapabilityEntry[] {
  return ENTERPRISE_CAPABILITY_CATALOG.filter((e) => e.layer === layer).map(
    (e) => ({ ...e }),
  );
}

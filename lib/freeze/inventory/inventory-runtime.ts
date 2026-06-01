import type { FreezeDomainEntry, FreezeInventory } from "./types";
import { PLATFORM_FREEZE_BASELINE_VERSION } from "./types";

const PHASE_REGISTRY: readonly FreezeDomainEntry[] = [
  { domain: "runtime", phase: 1, phaseName: "Runtime Freeze", tag: "v1-runtime-freeze" },
  { domain: "consumer", phase: 2, phaseName: "Consumer Freeze", tag: "v2-consumer-freeze" },
  { domain: "dashboard", phase: 3, phaseName: "Dashboard Freeze", tag: "v3-dashboard-freeze" },
  { domain: "release", phase: 4, phaseName: "Release Ledger Freeze", tag: "v4-release-ledger-freeze" },
  { domain: "operations", phase: 5, phaseName: "Operations Freeze", tag: "v5-operations-freeze" },
  { domain: "commercialization", phase: 6, phaseName: "Commercialization Freeze", tag: "v6-commercialization-freeze" },
  { domain: "landing", phase: 7, phaseName: "Enterprise Landing Freeze", tag: "v7-enterprise-landing-freeze" },
  { domain: "governance", phase: 8, phaseName: "Enterprise Governance Layer", tag: "v8-enterprise-governance-freeze" },
  { domain: "trust", phase: 9, phaseName: "Enterprise Compliance & Trust Layer", tag: "v9-enterprise-trust-freeze" },
  { domain: "control-center", phase: 10, phaseName: "Enterprise Control Center", tag: "v10-control-center-freeze" },
  { domain: "executive", phase: 11, phaseName: "Executive Intelligence Layer", tag: "v11-executive-intelligence-freeze" },
  { domain: "strategy", phase: 12, phaseName: "Strategic Planning Layer", tag: "v12-strategic-planning-freeze" },
];

export function buildFreezeInventory(input?: { deploymentId?: string }): FreezeInventory {
  const deploymentId = input?.deploymentId ?? "platform-freeze-default";
  return {
    inventoryId: `freeze-inventory-${deploymentId}`,
    version: PLATFORM_FREEZE_BASELINE_VERSION,
    domains: [...PHASE_REGISTRY],
    totalPhases: PHASE_REGISTRY.length,
  };
}

export function getPhaseRegistry(): readonly FreezeDomainEntry[] {
  return PHASE_REGISTRY;
}

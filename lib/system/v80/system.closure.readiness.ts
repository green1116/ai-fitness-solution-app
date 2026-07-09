/**
 * V80 P5 — P1–P4 phase readiness collector (read-only)
 */
import { buildSystemIntegrityCatalog } from "./system.integrity.builder";
import { buildSystemInventory } from "./system.inventory";
import { buildSystemPolicyCatalog } from "./system.policy.builder";
import { buildSystemSimulationCatalog } from "./system.simulation.builder";
import type { SystemPhaseReadiness } from "./system.closure";

export function collectSystemPhaseReadiness(deploymentId: string): SystemPhaseReadiness {
  const p1 = buildSystemInventory({ deploymentId }).inventoryReady;
  const p2 = buildSystemPolicyCatalog({ deploymentId }).catalogReady;
  const p3 = buildSystemSimulationCatalog({ deploymentId }).catalogReady;
  const p4 = buildSystemIntegrityCatalog({ deploymentId }).catalogReady;

  const ready = p1 && p2 && p3 && p4;
  const blocked = !ready;

  return {
    p1,
    p2,
    p3,
    p4,
    ready,
    blocked,
    summary: `readiness ready=${ready} phases=${[p1, p2, p3, p4].filter(Boolean).length}/4 blocked=${blocked}`,
  };
}

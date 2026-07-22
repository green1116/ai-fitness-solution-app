/**
 * Evolution P8 — Rollback snapshot index (declarative catalog)
 */

import { EVOLUTION_P8_GOVERNANCE_FREEZE_VERSION } from "./governance.freeze.lock";

export type EvolutionP8RollbackSnapshotEntry = {
  id: string;
  layer: string;
  snapshotPath: string;
  rollbackAction: string;
  required: boolean;
};

export type EvolutionP8RollbackSnapshot = {
  version: typeof EVOLUTION_P8_GOVERNANCE_FREEZE_VERSION;
  entryCount: number;
  indexComplete: boolean;
  entries: EvolutionP8RollbackSnapshotEntry[];
  summary: string;
};

export const EVOLUTION_ROLLBACK_SNAPSHOT_INDEX: EvolutionP8RollbackSnapshotEntry[] =
  [
    {
      id: "EVO-RS-P1",
      layer: "P1",
      snapshotPath: "lib/evolution/",
      rollbackAction:
        "Delete P1 optimization modules + verify-evolution-p1-ai-operations-optimization.ts",
      required: true,
    },
    {
      id: "EVO-RS-P2",
      layer: "P2",
      snapshotPath: "lib/evolution/predictive/",
      rollbackAction:
        "Delete P2 predictive + verify-evolution-p2-predictive-intelligence.ts",
      required: true,
    },
    {
      id: "EVO-RS-P3",
      layer: "P3",
      snapshotPath: "lib/evolution/customer/",
      rollbackAction:
        "Delete P3 customer + verify-evolution-p3-autonomous-customer-success.ts",
      required: true,
    },
    {
      id: "EVO-RS-P4",
      layer: "P4",
      snapshotPath: "lib/evolution/dashboard/",
      rollbackAction:
        "Delete P4 dashboard + verify-evolution-p4-enterprise-intelligence-dashboard.ts",
      required: true,
    },
    {
      id: "EVO-RS-P5",
      layer: "P5",
      snapshotPath: "lib/evolution/global/",
      rollbackAction:
        "Delete P5 global + verify-evolution-p5-global-deployment-network.ts",
      required: true,
    },
    {
      id: "EVO-RS-P6",
      layer: "P6",
      snapshotPath: "lib/evolution/marketplace/",
      rollbackAction:
        "Delete P6 marketplace + verify-evolution-p6-marketplace-ecosystem.ts",
      required: true,
    },
    {
      id: "EVO-RS-P7",
      layer: "P7",
      snapshotPath: "lib/evolution/control/",
      rollbackAction:
        "Delete P7 control + verify-evolution-p7-evolution-control-plane.ts",
      required: true,
    },
    {
      id: "EVO-RS-P8",
      layer: "P8",
      snapshotPath: "lib/evolution/signoff/",
      rollbackAction:
        "Delete P8 signoff + verify-evolution-p8-evolution-governance-freeze.ts",
      required: true,
    },
  ];

export function buildEvolutionRollbackSnapshotIndex(): EvolutionP8RollbackSnapshot {
  const entries = EVOLUTION_ROLLBACK_SNAPSHOT_INDEX.map((e) => ({ ...e }));
  const required = entries.filter((e) => e.required);
  const indexComplete =
    required.length === 8 &&
    required.every((e) => e.snapshotPath.length > 0 && e.id.length > 0);

  return {
    version: EVOLUTION_P8_GOVERNANCE_FREEZE_VERSION,
    entryCount: entries.length,
    indexComplete,
    entries,
    summary: `evo-rollback entries=${entries.length} complete=${indexComplete}`,
  };
}

export function getEvolutionRollbackSnapshotByLayer(
  layer: string,
): EvolutionP8RollbackSnapshotEntry | undefined {
  const entry = EVOLUTION_ROLLBACK_SNAPSHOT_INDEX.find(
    (e) => e.layer === layer.trim().toUpperCase(),
  );
  return entry ? { ...entry } : undefined;
}

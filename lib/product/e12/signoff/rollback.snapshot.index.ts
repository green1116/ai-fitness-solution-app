/**
 * E12-P8 — Rollback snapshot index (declarative catalog)
 * Governance freeze only — no feature changes
 */

import { E12_P8_PRODUCTIZATION_FREEZE_VERSION } from "./governance.freeze.lock";

export type E12P8RollbackSnapshotEntry = {
  id: string;
  layer: string;
  snapshotPath: string;
  rollbackAction: string;
  required: boolean;
};

export type E12P8RollbackSnapshot = {
  version: typeof E12_P8_PRODUCTIZATION_FREEZE_VERSION;
  entryCount: number;
  indexComplete: boolean;
  entries: E12P8RollbackSnapshotEntry[];
  summary: string;
};

export const ROLLBACK_SNAPSHOT_INDEX: E12P8RollbackSnapshotEntry[] = [
  {
    id: "E12-RS-P1",
    layer: "P1",
    snapshotPath: "lib/product/e12/core/",
    rollbackAction:
      "Delete P1 product foundation + verify-e12-p1-product-foundation.ts",
    required: true,
  },
  {
    id: "E12-RS-P2",
    layer: "P2",
    snapshotPath: "lib/product/e12/tenant/",
    rollbackAction:
      "Delete P2 tenant product + verify-e12-p2-saas-tenant-product.ts",
    required: true,
  },
  {
    id: "E12-RS-P3",
    layer: "P3",
    snapshotPath: "lib/product/e12/admin/",
    rollbackAction:
      "Delete P3 admin console + verify-e12-p3-enterprise-admin-console.ts",
    required: true,
  },
  {
    id: "E12-RS-P4",
    layer: "P4",
    snapshotPath: "lib/product/e12/billing/",
    rollbackAction:
      "Delete P4 billing + verify-e12-p4-billing-commercial.ts",
    required: true,
  },
  {
    id: "E12-RS-P5",
    layer: "P5",
    snapshotPath: "lib/product/e12/api/",
    rollbackAction:
      "Delete P5 API product + verify-e12-p5-api-productization.ts",
    required: true,
  },
  {
    id: "E12-RS-P6",
    layer: "P6",
    snapshotPath: "lib/product/e12/deployment/",
    rollbackAction:
      "Delete P6 deployment + verify-e12-p6-deployment-package.ts",
    required: true,
  },
  {
    id: "E12-RS-P7",
    layer: "P7",
    snapshotPath: "lib/product/e12/commercial/",
    rollbackAction:
      "Delete P7 commercial control + verify-e12-p7-commercial-control-plane.ts",
    required: true,
  },
  {
    id: "E12-RS-P8",
    layer: "P8",
    snapshotPath: "lib/product/e12/signoff/",
    rollbackAction:
      "Delete P8 governance freeze + verify-e12-p8-productization-governance-freeze.ts",
    required: true,
  },
  {
    id: "E12-RS-SCRIPTS",
    layer: "scripts",
    snapshotPath: "scripts/verify-e12-p*.ts",
    rollbackAction: "Delete E12 verify scripts",
    required: true,
  },
  {
    id: "E12-RS-ROOT",
    layer: "package",
    snapshotPath: "lib/product/e12/",
    rollbackAction: "Remove E12 productization tree if rolling back program",
    required: true,
  },
  {
    id: "E12-RS-PLATFORM",
    layer: "platform",
    snapshotPath: "lib/platform/v1/",
    rollbackAction:
      "DO NOT MODIFY — frozen enterprise-platform-v1-complete baseline",
    required: true,
  },
  {
    id: "E12-RS-UPSTREAM",
    layer: "upstream",
    snapshotPath: "lib/{global-network/e09,platform/e10,cloud-runtime/e11}/",
    rollbackAction: "DO NOT MODIFY — frozen E09/E10/E11 baselines",
    required: true,
  },
];

export function buildRollbackSnapshotIndex(): E12P8RollbackSnapshot {
  const entries = ROLLBACK_SNAPSHOT_INDEX;
  const indexComplete = entries.length >= 12;

  return {
    version: E12_P8_PRODUCTIZATION_FREEZE_VERSION,
    entryCount: entries.length,
    indexComplete,
    entries,
    summary: [
      `rollback-snapshot entries=${entries.length}`,
      `complete=${indexComplete}`,
    ].join(" "),
  };
}

export function getRollbackSnapshotByLayer(
  layer: string,
): E12P8RollbackSnapshotEntry[] {
  return ROLLBACK_SNAPSHOT_INDEX.filter((e) => e.layer === layer);
}

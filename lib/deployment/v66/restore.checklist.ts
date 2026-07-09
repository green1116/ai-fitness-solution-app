/**
 * V66 P6 — Restore checklist (declarative, read-only)
 */
import type {
  DeploymentDrSignals,
  RestoreChecklistItem,
  RestoreChecklistManifest,
} from "./dr.types";
import { V66_DEPLOYMENT_DR_VERSION } from "./dr.types";

export function buildRestoreChecklist(signals: DeploymentDrSignals): RestoreChecklistItem[] {
  const s = {
    securityReady: true,
    backupPolicyCatalogComplete: true,
    restoreChecklistPass: true,
    retentionMatrixComplete: true,
    recoveryPointInventoryComplete: true,
    ...signals,
  };

  return [
    {
      id: "RC-001",
      label: "Identify recovery point from inventory",
      status: s.recoveryPointInventoryComplete ? "pass" : "fail",
      required: true,
      phase: "prepare",
      notes: "recovery.point.inventory.ts",
    },
    {
      id: "RC-002",
      label: "Confirm retention matrix covers target asset",
      status: s.retentionMatrixComplete ? "pass" : "fail",
      required: true,
      phase: "prepare",
      notes: "retention.matrix.ts",
    },
    {
      id: "RC-003",
      label: "Validate backup policy catalog complete",
      status: s.backupPolicyCatalogComplete ? "pass" : "fail",
      required: true,
      phase: "prepare",
    },
    {
      id: "RC-004",
      label: "Halt rollout if rollback guard tripped",
      status: s.securityReady ? "pass" : "fail",
      required: true,
      phase: "prepare",
      notes: "P4 rollback.guard.ts",
    },
    {
      id: "RC-005",
      label: "Restore database from provider backup (declarative)",
      status: "na",
      required: true,
      phase: "restore",
      notes: "No execution in V66 P6 — operator runbook only",
    },
    {
      id: "RC-006",
      label: "Restore Prisma schema from snapshot baseline",
      status: s.backupPolicyCatalogComplete ? "pass" : "warn",
      required: true,
      phase: "restore",
      notes: "prisma-stability snapshot reference",
    },
    {
      id: "RC-007",
      label: "Re-run prisma:preflight and migration safety",
      status: s.securityReady ? "pass" : "fail",
      required: true,
      phase: "validate",
      notes: "npm run prisma:preflight",
    },
    {
      id: "RC-008",
      label: "Re-run V66 deployment verify chain",
      status: s.restoreChecklistPass ? "pass" : "fail",
      required: true,
      phase: "validate",
      notes: "npm run verify:v66-deployment",
    },
    {
      id: "RC-009",
      label: "Validate security gates post-restore",
      status: s.securityReady ? "pass" : "fail",
      required: true,
      phase: "validate",
      notes: "P5 security.gates.ts",
    },
    {
      id: "RC-010",
      label: "Declarative cutover approval",
      status: s.restoreChecklistPass ? "pass" : "fail",
      required: false,
      phase: "cutover",
      notes: "Documentation gate only",
    },
  ];
}

export function buildRestoreChecklistManifest(
  signals: DeploymentDrSignals,
): RestoreChecklistManifest {
  const items = buildRestoreChecklist(signals);
  const passCount = items.filter((i) => i.status === "pass").length;
  const checklistPass = items
    .filter((i) => i.required)
    .every((i) => i.status === "pass" || i.status === "na");

  return {
    version: V66_DEPLOYMENT_DR_VERSION,
    itemCount: items.length,
    passCount,
    checklistPass,
    items,
    summary: [
      `restore-checklist pass=${passCount}/${items.length}`,
      `checklistPass=${checklistPass}`,
    ].join(" "),
  };
}

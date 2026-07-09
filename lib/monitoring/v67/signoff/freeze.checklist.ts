/**
 * V67 P8 — Monitoring freeze checklist (declarative, read-only)
 */
import type {
  FreezeChecklistItem,
  FreezeChecklistManifest,
  MonitoringSignoffSignals,
} from "./signoff.types";
import { V67_MONITORING_FREEZE_VERSION } from "./signoff.types";

export function buildFreezeChecklist(signals: MonitoringSignoffSignals): FreezeChecklistItem[] {
  const s = {
    monitoringReady: true,
    freezeChecklistPass: true,
    releaseGatesPass: true,
    rollbackSnapshotComplete: true,
    versionLockIntact: true,
    ...signals,
  };

  return [
    {
      id: "FC-001",
      label: "V67 P1–P7 all layers ready",
      status: s.monitoringReady ? "pass" : "fail",
      required: true,
    },
    {
      id: "FC-002",
      label: "Monitoring layer version lock intact",
      status: s.versionLockIntact ? "pass" : "fail",
      required: true,
      notes: "freeze.lock.ts",
    },
    {
      id: "FC-003",
      label: "Release gate summary all pass",
      status: s.releaseGatesPass ? "pass" : "fail",
      required: true,
    },
    {
      id: "FC-004",
      label: "Rollback snapshot index complete",
      status: s.rollbackSnapshotComplete ? "pass" : "fail",
      required: true,
    },
    {
      id: "FC-005",
      label: "Upstream V66 deployment sign-off intact",
      status: s.versionLockIntact ? "pass" : "fail",
      required: true,
    },
    {
      id: "FC-006",
      label: "Upstream V65 production sign-off intact",
      status: s.versionLockIntact ? "pass" : "fail",
      required: true,
    },
    {
      id: "FC-007",
      label: "V48–V66 business/runtime layers unmodified",
      status: s.freezeChecklistPass ? "pass" : "fail",
      required: true,
      notes: "Declarative freeze boundary",
    },
    {
      id: "FC-008",
      label: "V67 verify chain documented",
      status: s.releaseGatesPass ? "pass" : "fail",
      required: true,
      notes: "npm run verify:v67-monitoring",
    },
    {
      id: "FC-009",
      label: "P8 sign-off module present",
      status: s.freezeChecklistPass ? "pass" : "fail",
      required: true,
    },
    {
      id: "FC-010",
      label: "Monitoring program ready to freeze",
      status: s.monitoringReady && s.versionLockIntact ? "pass" : "fail",
      required: true,
    },
  ];
}

export function buildFreezeChecklistManifest(
  signals: MonitoringSignoffSignals,
): FreezeChecklistManifest {
  const items = buildFreezeChecklist(signals);
  const passCount = items.filter((i) => i.status === "pass").length;
  const checklistPass = items.filter((i) => i.required).every((i) => i.status === "pass");

  return {
    version: V67_MONITORING_FREEZE_VERSION,
    itemCount: items.length,
    passCount,
    checklistPass,
    items,
    summary: [
      `freeze-checklist pass=${passCount}/${items.length}`,
      `checklistPass=${checklistPass}`,
    ].join(" "),
  };
}

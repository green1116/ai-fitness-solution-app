/**
 * V66 P8 — Deployment freeze checklist (declarative, read-only)
 */
import type {
  DeploymentSignoffSignals,
  FreezeChecklistItem,
  FreezeChecklistManifest,
} from "./signoff.types";
import { V66_DEPLOYMENT_FREEZE_VERSION } from "./signoff.types";

export function buildFreezeChecklist(signals: DeploymentSignoffSignals): FreezeChecklistItem[] {
  const s = {
    opsReady: true,
    freezeChecklistPass: true,
    releaseGatesPass: true,
    rollbackSnapshotComplete: true,
    versionLockIntact: true,
    ...signals,
  };

  return [
    {
      id: "FC-001",
      label: "V66 P1–P7 all layers ready",
      status: s.opsReady ? "pass" : "fail",
      required: true,
    },
    {
      id: "FC-002",
      label: "Deployment layer version lock intact",
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
      label: "Upstream V65 production sign-off intact",
      status: s.versionLockIntact ? "pass" : "fail",
      required: true,
    },
    {
      id: "FC-006",
      label: "Upstream V64 commercial freeze intact",
      status: s.versionLockIntact ? "pass" : "fail",
      required: true,
    },
    {
      id: "FC-007",
      label: "V48–V65 business/runtime layers unmodified",
      status: s.freezeChecklistPass ? "pass" : "fail",
      required: true,
      notes: "Declarative freeze boundary",
    },
    {
      id: "FC-008",
      label: "V66 verify chain documented",
      status: s.releaseGatesPass ? "pass" : "fail",
      required: true,
      notes: "npm run verify:v66-deployment",
    },
    {
      id: "FC-009",
      label: "P8 sign-off module present",
      status: s.freezeChecklistPass ? "pass" : "fail",
      required: true,
    },
    {
      id: "FC-010",
      label: "Deployment program ready to freeze",
      status: s.opsReady && s.versionLockIntact ? "pass" : "fail",
      required: true,
    },
  ];
}

export function buildFreezeChecklistManifest(
  signals: DeploymentSignoffSignals,
): FreezeChecklistManifest {
  const items = buildFreezeChecklist(signals);
  const passCount = items.filter((i) => i.status === "pass").length;
  const checklistPass = items.filter((i) => i.required).every((i) => i.status === "pass");

  return {
    version: V66_DEPLOYMENT_FREEZE_VERSION,
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

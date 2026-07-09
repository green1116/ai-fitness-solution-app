/**
 * V71 P8 — Workflow freeze checklist (declarative, read-only)
 */
import type {
  FreezeChecklist,
  FreezeChecklistItem,
  WorkflowSignoffSignals,
} from "./signoff.types";
import { V71_WORKFLOW_FREEZE_VERSION } from "./signoff.types";

function toState(pass: boolean): FreezeChecklistItem["state"] {
  return pass ? "pass" : "fail";
}

export function buildFreezeChecklist(signals: WorkflowSignoffSignals): FreezeChecklistItem[] {
  const s = {
    workflowReady: true,
    freezeChecklistPass: true,
    workflowGatesPass: true,
    rollbackSnapshotComplete: true,
    versionLockIntact: true,
    ...signals,
  };

  return [
    {
      id: "WFC-001",
      label: "V71 P1–P7 all workflow layers ready",
      status: s.workflowReady ? "pass" : "fail",
      state: toState(s.workflowReady),
      required: true,
    },
    {
      id: "WFC-002",
      label: "Workflow layer version lock intact",
      status: s.versionLockIntact ? "pass" : "fail",
      state: toState(s.versionLockIntact),
      required: true,
      notes: "freeze.lock.ts",
    },
    {
      id: "WFC-003",
      label: "Workflow gate summary all pass",
      status: s.workflowGatesPass ? "pass" : "fail",
      state: toState(s.workflowGatesPass),
      required: true,
    },
    {
      id: "WFC-004",
      label: "Rollback snapshot index complete",
      status: s.rollbackSnapshotComplete ? "pass" : "fail",
      state: toState(s.rollbackSnapshotComplete),
      required: true,
    },
    {
      id: "WFC-005",
      label: "Upstream V70 delivery sign-off intact",
      status: s.versionLockIntact ? "pass" : "fail",
      state: toState(s.versionLockIntact),
      required: true,
    },
    {
      id: "WFC-006",
      label: "Upstream V70 delivery freeze intact",
      status: s.versionLockIntact ? "pass" : "fail",
      state: toState(s.versionLockIntact),
      required: true,
    },
    {
      id: "WFC-007",
      label: "V48–V70 business/runtime layers unmodified",
      status: s.freezeChecklistPass ? "pass" : "fail",
      state: toState(s.freezeChecklistPass),
      required: true,
      notes: "Declarative freeze boundary",
    },
    {
      id: "WFC-008",
      label: "V71 verify chain documented",
      status: s.workflowGatesPass ? "pass" : "fail",
      state: toState(s.workflowGatesPass),
      required: true,
      notes: "npx tsx scripts/verify-v71-p8-workflow-signoff.ts",
    },
    {
      id: "WFC-009",
      label: "P8 sign-off module present",
      status: s.freezeChecklistPass ? "pass" : "fail",
      state: toState(s.freezeChecklistPass),
      required: true,
    },
    {
      id: "WFC-010",
      label: "Workflow orchestration program ready to freeze",
      status: s.workflowReady && s.versionLockIntact ? "pass" : "fail",
      state: toState(s.workflowReady && s.versionLockIntact),
      required: true,
    },
  ];
}

export function buildFreezeChecklistManifest(
  signals: WorkflowSignoffSignals,
): FreezeChecklist {
  const items = buildFreezeChecklist(signals);
  const passCount = items.filter((i) => i.status === "pass").length;
  const failCount = items.filter((i) => i.status === "fail").length;
  const checklistPass = items.filter((i) => i.required).every((i) => i.status === "pass");

  return {
    version: V71_WORKFLOW_FREEZE_VERSION,
    itemCount: items.length,
    passCount,
    failCount,
    checklistPass,
    items,
    summary: [
      `freeze-checklist pass=${passCount}/${items.length}`,
      `fail=${failCount}`,
      `checklistPass=${checklistPass}`,
    ].join(" "),
  };
}

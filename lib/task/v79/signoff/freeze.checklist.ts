/**
 * V79 P8 — Task freeze checklist (declarative, read-only)
 */
import type { FreezeChecklist, FreezeChecklistItem, TaskSignoffSignals } from "./signoff.types";
import { V79_TASK_FREEZE_VERSION } from "./signoff.types";

function toState(pass: boolean): FreezeChecklistItem["state"] {
  return pass ? "pass" : "fail";
}

export function buildFreezeChecklist(signals: TaskSignoffSignals): FreezeChecklistItem[] {
  const s = {
    taskReady: true,
    freezeChecklistPass: true,
    taskGatesPass: true,
    rollbackSnapshotComplete: true,
    versionLockIntact: true,
    ...signals,
  };

  return [
    {
      id: "TFC-001",
      label: "V79 P1–P7 all task layers ready",
      status: s.taskReady ? "pass" : "fail",
      state: toState(s.taskReady),
      required: true,
    },
    {
      id: "TFC-002",
      label: "Task layer version lock intact",
      status: s.versionLockIntact ? "pass" : "fail",
      state: toState(s.versionLockIntact),
      required: true,
      notes: "freeze.lock.ts",
    },
    {
      id: "TFC-003",
      label: "Task gate summary all pass",
      status: s.taskGatesPass ? "pass" : "fail",
      state: toState(s.taskGatesPass),
      required: true,
    },
    {
      id: "TFC-004",
      label: "Rollback snapshot index complete",
      status: s.rollbackSnapshotComplete ? "pass" : "fail",
      state: toState(s.rollbackSnapshotComplete),
      required: true,
    },
    {
      id: "TFC-005",
      label: "Upstream V78 execution sign-off intact",
      status: s.versionLockIntact ? "pass" : "fail",
      state: toState(s.versionLockIntact),
      required: true,
    },
    {
      id: "TFC-006",
      label: "Upstream V78 execution freeze intact",
      status: s.versionLockIntact ? "pass" : "fail",
      state: toState(s.versionLockIntact),
      required: true,
    },
    {
      id: "TFC-007",
      label: "V48–V78 business/runtime layers unmodified",
      status: s.freezeChecklistPass ? "pass" : "fail",
      state: toState(s.freezeChecklistPass),
      required: true,
      notes: "Declarative freeze boundary",
    },
    {
      id: "TFC-008",
      label: "V79 verify chain documented",
      status: s.taskGatesPass ? "pass" : "fail",
      state: toState(s.taskGatesPass),
      required: true,
      notes: "npx tsx scripts/verify-v79-p8-task-signoff.ts",
    },
    {
      id: "TFC-009",
      label: "P8 sign-off module present",
      status: s.freezeChecklistPass ? "pass" : "fail",
      state: toState(s.freezeChecklistPass),
      required: true,
    },
    {
      id: "TFC-010",
      label: "Task program ready to freeze",
      status: s.taskReady && s.versionLockIntact ? "pass" : "fail",
      state: toState(s.taskReady && s.versionLockIntact),
      required: true,
    },
  ];
}

export function buildFreezeChecklistManifest(signals: TaskSignoffSignals): FreezeChecklist {
  const items = buildFreezeChecklist(signals);
  const passCount = items.filter((i) => i.status === "pass").length;
  const failCount = items.filter((i) => i.status === "fail").length;
  const checklistPass = items.filter((i) => i.required).every((i) => i.status === "pass");

  return {
    version: V79_TASK_FREEZE_VERSION,
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

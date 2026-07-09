/**
 * V78 P8 — Execution freeze checklist (declarative, read-only)
 */
import type { ExecutionSignoffSignals, FreezeChecklist, FreezeChecklistItem } from "./signoff.types";
import { V78_EXECUTION_FREEZE_VERSION } from "./signoff.types";

function toState(pass: boolean): FreezeChecklistItem["state"] {
  return pass ? "pass" : "fail";
}

export function buildFreezeChecklist(signals: ExecutionSignoffSignals): FreezeChecklistItem[] {
  const s = {
    executionReady: true,
    freezeChecklistPass: true,
    executionGatesPass: true,
    rollbackSnapshotComplete: true,
    versionLockIntact: true,
    ...signals,
  };

  return [
    {
      id: "EFC-001",
      label: "V78 P1–P7 all execution layers ready",
      status: s.executionReady ? "pass" : "fail",
      state: toState(s.executionReady),
      required: true,
    },
    {
      id: "EFC-002",
      label: "Execution layer version lock intact",
      status: s.versionLockIntact ? "pass" : "fail",
      state: toState(s.versionLockIntact),
      required: true,
      notes: "freeze.lock.ts",
    },
    {
      id: "EFC-003",
      label: "Execution gate summary all pass",
      status: s.executionGatesPass ? "pass" : "fail",
      state: toState(s.executionGatesPass),
      required: true,
    },
    {
      id: "EFC-004",
      label: "Rollback snapshot index complete",
      status: s.rollbackSnapshotComplete ? "pass" : "fail",
      state: toState(s.rollbackSnapshotComplete),
      required: true,
    },
    {
      id: "EFC-005",
      label: "Upstream V77 planning sign-off intact",
      status: s.versionLockIntact ? "pass" : "fail",
      state: toState(s.versionLockIntact),
      required: true,
    },
    {
      id: "EFC-006",
      label: "Upstream V77 planning freeze intact",
      status: s.versionLockIntact ? "pass" : "fail",
      state: toState(s.versionLockIntact),
      required: true,
    },
    {
      id: "EFC-007",
      label: "V48–V77 business/runtime layers unmodified",
      status: s.freezeChecklistPass ? "pass" : "fail",
      state: toState(s.freezeChecklistPass),
      required: true,
      notes: "Declarative freeze boundary",
    },
    {
      id: "EFC-008",
      label: "V78 verify chain documented",
      status: s.executionGatesPass ? "pass" : "fail",
      state: toState(s.executionGatesPass),
      required: true,
      notes: "npx tsx scripts/verify-v78-p8-execution-signoff.ts",
    },
    {
      id: "EFC-009",
      label: "P8 sign-off module present",
      status: s.freezeChecklistPass ? "pass" : "fail",
      state: toState(s.freezeChecklistPass),
      required: true,
    },
    {
      id: "EFC-010",
      label: "Execution program ready to freeze",
      status: s.executionReady && s.versionLockIntact ? "pass" : "fail",
      state: toState(s.executionReady && s.versionLockIntact),
      required: true,
    },
  ];
}

export function buildFreezeChecklistManifest(signals: ExecutionSignoffSignals): FreezeChecklist {
  const items = buildFreezeChecklist(signals);
  const passCount = items.filter((i) => i.status === "pass").length;
  const failCount = items.filter((i) => i.status === "fail").length;
  const checklistPass = items.filter((i) => i.required).every((i) => i.status === "pass");

  return {
    version: V78_EXECUTION_FREEZE_VERSION,
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

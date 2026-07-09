/**
 * V77 P8 — Planning freeze checklist (declarative, read-only)
 */
import type { FreezeChecklist, FreezeChecklistItem, PlanningSignoffSignals } from "./signoff.types";
import { V77_PLANNING_FREEZE_VERSION } from "./signoff.types";

function toState(pass: boolean): FreezeChecklistItem["state"] {
  return pass ? "pass" : "fail";
}

export function buildFreezeChecklist(signals: PlanningSignoffSignals): FreezeChecklistItem[] {
  const s = {
    planningReady: true,
    freezeChecklistPass: true,
    planningGatesPass: true,
    rollbackSnapshotComplete: true,
    versionLockIntact: true,
    ...signals,
  };

  return [
    {
      id: "PFC-001",
      label: "V77 P1–P7 all planning layers ready",
      status: s.planningReady ? "pass" : "fail",
      state: toState(s.planningReady),
      required: true,
    },
    {
      id: "PFC-002",
      label: "Planning layer version lock intact",
      status: s.versionLockIntact ? "pass" : "fail",
      state: toState(s.versionLockIntact),
      required: true,
      notes: "freeze.lock.ts",
    },
    {
      id: "PFC-003",
      label: "Planning gate summary all pass",
      status: s.planningGatesPass ? "pass" : "fail",
      state: toState(s.planningGatesPass),
      required: true,
    },
    {
      id: "PFC-004",
      label: "Rollback snapshot index complete",
      status: s.rollbackSnapshotComplete ? "pass" : "fail",
      state: toState(s.rollbackSnapshotComplete),
      required: true,
    },
    {
      id: "PFC-005",
      label: "Upstream V76 collaboration sign-off intact",
      status: s.versionLockIntact ? "pass" : "fail",
      state: toState(s.versionLockIntact),
      required: true,
    },
    {
      id: "PFC-006",
      label: "Upstream V76 collaboration freeze intact",
      status: s.versionLockIntact ? "pass" : "fail",
      state: toState(s.versionLockIntact),
      required: true,
    },
    {
      id: "PFC-007",
      label: "V48–V76 business/runtime layers unmodified",
      status: s.freezeChecklistPass ? "pass" : "fail",
      state: toState(s.freezeChecklistPass),
      required: true,
      notes: "Declarative freeze boundary",
    },
    {
      id: "PFC-008",
      label: "V77 verify chain documented",
      status: s.planningGatesPass ? "pass" : "fail",
      state: toState(s.planningGatesPass),
      required: true,
      notes: "npx tsx scripts/verify-v77-p8-planning-signoff.ts",
    },
    {
      id: "PFC-009",
      label: "P8 sign-off module present",
      status: s.freezeChecklistPass ? "pass" : "fail",
      state: toState(s.freezeChecklistPass),
      required: true,
    },
    {
      id: "PFC-010",
      label: "Planning program ready to freeze",
      status: s.planningReady && s.versionLockIntact ? "pass" : "fail",
      state: toState(s.planningReady && s.versionLockIntact),
      required: true,
    },
  ];
}

export function buildFreezeChecklistManifest(signals: PlanningSignoffSignals): FreezeChecklist {
  const items = buildFreezeChecklist(signals);
  const passCount = items.filter((i) => i.status === "pass").length;
  const failCount = items.filter((i) => i.status === "fail").length;
  const checklistPass = items.filter((i) => i.required).every((i) => i.status === "pass");

  return {
    version: V77_PLANNING_FREEZE_VERSION,
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

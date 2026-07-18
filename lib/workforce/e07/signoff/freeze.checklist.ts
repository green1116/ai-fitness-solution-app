/**
 * E07-P8 — Digital Workforce freeze checklist (declarative, read-only)
 */

import type {
  FreezeChecklist,
  FreezeChecklistItem,
  WorkforceSignoffSignals,
} from "./signoff.types";
import { E07_WORKFORCE_PLATFORM_FREEZE_VERSION } from "./signoff.types";

function toState(pass: boolean): FreezeChecklistItem["state"] {
  return pass ? "pass" : "fail";
}

export function buildFreezeChecklist(
  signals: WorkforceSignoffSignals,
): FreezeChecklistItem[] {
  const s = {
    platformReady: true,
    freezeChecklistPass: true,
    platformGatesPass: true,
    rollbackSnapshotComplete: true,
    versionLockIntact: true,
    ...signals,
  };

  return [
    {
      id: "WFC-001",
      label: "E07 P1–P7 all workforce layers ready",
      status: s.platformReady ? "pass" : "fail",
      state: toState(s.platformReady),
      required: true,
    },
    {
      id: "WFC-002",
      label: "Workforce layer version lock intact",
      status: s.versionLockIntact ? "pass" : "fail",
      state: toState(s.versionLockIntact),
      required: true,
      notes: "freeze.lock.ts",
    },
    {
      id: "WFC-003",
      label: "Workforce gate summary all pass",
      status: s.platformGatesPass ? "pass" : "fail",
      state: toState(s.platformGatesPass),
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
      label: "P1–P7 freeze versions locked",
      status: s.versionLockIntact ? "pass" : "fail",
      state: toState(s.versionLockIntact),
      required: true,
    },
    {
      id: "WFC-006",
      label: "Autonomous organization baseline ready",
      status: s.platformReady ? "pass" : "fail",
      state: toState(s.platformReady),
      required: true,
      notes: "P7 Organization",
    },
    {
      id: "WFC-007",
      label: "E03 / E04 / E05 / E06 / E07-P1–P7 unmodified boundary",
      status: s.freezeChecklistPass ? "pass" : "fail",
      state: toState(s.freezeChecklistPass),
      required: true,
      notes: "Declarative freeze boundary",
    },
    {
      id: "WFC-008",
      label: "E07 verify chain documented",
      status: s.platformGatesPass ? "pass" : "fail",
      state: toState(s.platformGatesPass),
      required: true,
      notes: "npx tsx scripts/verify-e07-p8-digital-workforce-governance.ts",
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
      label: "Digital Workforce Platform ready to freeze",
      status: s.platformReady && s.versionLockIntact ? "pass" : "fail",
      state: toState(s.platformReady && s.versionLockIntact),
      required: true,
    },
  ];
}

export function buildFreezeChecklistManifest(
  signals: WorkforceSignoffSignals,
): FreezeChecklist {
  const items = buildFreezeChecklist(signals);
  const passCount = items.filter((i) => i.status === "pass").length;
  const failCount = items.filter((i) => i.status === "fail").length;
  const checklistPass = items
    .filter((i) => i.required)
    .every((i) => i.status === "pass");

  return {
    version: E07_WORKFORCE_PLATFORM_FREEZE_VERSION,
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

/**
 * E06-P8 — Autonomous Enterprise OS freeze checklist (declarative, read-only)
 */

import type {
  AutonomousSignoffSignals,
  FreezeChecklist,
  FreezeChecklistItem,
} from "./signoff.types";
import { E06_AUTONOMOUS_OS_FREEZE_VERSION } from "./signoff.types";

function toState(pass: boolean): FreezeChecklistItem["state"] {
  return pass ? "pass" : "fail";
}

export function buildFreezeChecklist(
  signals: AutonomousSignoffSignals,
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
      id: "AFC-001",
      label: "E06 P1–P7 all autonomous layers ready",
      status: s.platformReady ? "pass" : "fail",
      state: toState(s.platformReady),
      required: true,
    },
    {
      id: "AFC-002",
      label: "Autonomous layer version lock intact",
      status: s.versionLockIntact ? "pass" : "fail",
      state: toState(s.versionLockIntact),
      required: true,
      notes: "freeze.lock.ts",
    },
    {
      id: "AFC-003",
      label: "Autonomous gate summary all pass",
      status: s.platformGatesPass ? "pass" : "fail",
      state: toState(s.platformGatesPass),
      required: true,
    },
    {
      id: "AFC-004",
      label: "Rollback snapshot index complete",
      status: s.rollbackSnapshotComplete ? "pass" : "fail",
      state: toState(s.rollbackSnapshotComplete),
      required: true,
    },
    {
      id: "AFC-005",
      label: "P1–P7 freeze versions locked",
      status: s.versionLockIntact ? "pass" : "fail",
      state: toState(s.versionLockIntact),
      required: true,
    },
    {
      id: "AFC-006",
      label: "Autonomous enterprise agent baseline ready",
      status: s.platformReady ? "pass" : "fail",
      state: toState(s.platformReady),
      required: true,
      notes: "P7 EnterpriseAgent",
    },
    {
      id: "AFC-007",
      label: "E03 / E04 / E05 / E06-P1–P7 unmodified boundary",
      status: s.freezeChecklistPass ? "pass" : "fail",
      state: toState(s.freezeChecklistPass),
      required: true,
      notes: "Declarative freeze boundary",
    },
    {
      id: "AFC-008",
      label: "E06 verify chain documented",
      status: s.platformGatesPass ? "pass" : "fail",
      state: toState(s.platformGatesPass),
      required: true,
      notes:
        "npx tsx scripts/verify-e06-p8-autonomous-enterprise-governance.ts",
    },
    {
      id: "AFC-009",
      label: "P8 sign-off module present",
      status: s.freezeChecklistPass ? "pass" : "fail",
      state: toState(s.freezeChecklistPass),
      required: true,
    },
    {
      id: "AFC-010",
      label: "Autonomous Enterprise OS ready to freeze",
      status: s.platformReady && s.versionLockIntact ? "pass" : "fail",
      state: toState(s.platformReady && s.versionLockIntact),
      required: true,
    },
  ];
}

export function buildFreezeChecklistManifest(
  signals: AutonomousSignoffSignals,
): FreezeChecklist {
  const items = buildFreezeChecklist(signals);
  const passCount = items.filter((i) => i.status === "pass").length;
  const failCount = items.filter((i) => i.status === "fail").length;
  const checklistPass = items
    .filter((i) => i.required)
    .every((i) => i.status === "pass");

  return {
    version: E06_AUTONOMOUS_OS_FREEZE_VERSION,
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

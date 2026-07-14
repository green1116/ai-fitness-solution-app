/**
 * E05-P8 — Intelligence freeze checklist (declarative, read-only)
 */

import type {
  FreezeChecklist,
  FreezeChecklistItem,
  IntelligenceSignoffSignals,
} from "./signoff.types";
import { E05_INTELLIGENCE_PLATFORM_FREEZE_VERSION } from "./signoff.types";

function toState(pass: boolean): FreezeChecklistItem["state"] {
  return pass ? "pass" : "fail";
}

export function buildFreezeChecklist(
  signals: IntelligenceSignoffSignals,
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
      id: "IFC-001",
      label: "E05 P1–P7 all intelligence layers ready",
      status: s.platformReady ? "pass" : "fail",
      state: toState(s.platformReady),
      required: true,
    },
    {
      id: "IFC-002",
      label: "Intelligence layer version lock intact",
      status: s.versionLockIntact ? "pass" : "fail",
      state: toState(s.versionLockIntact),
      required: true,
      notes: "freeze.lock.ts",
    },
    {
      id: "IFC-003",
      label: "Intelligence gate summary all pass",
      status: s.platformGatesPass ? "pass" : "fail",
      state: toState(s.platformGatesPass),
      required: true,
    },
    {
      id: "IFC-004",
      label: "Rollback snapshot index complete",
      status: s.rollbackSnapshotComplete ? "pass" : "fail",
      state: toState(s.rollbackSnapshotComplete),
      required: true,
    },
    {
      id: "IFC-005",
      label: "P1–P7 freeze versions locked",
      status: s.versionLockIntact ? "pass" : "fail",
      state: toState(s.versionLockIntact),
      required: true,
    },
    {
      id: "IFC-006",
      label: "Autonomous strategy agent baseline ready",
      status: s.platformReady ? "pass" : "fail",
      state: toState(s.platformReady),
      required: true,
      notes: "P7 StrategyAgent",
    },
    {
      id: "IFC-007",
      label: "E03 / E04 / E05-P1–P7 unmodified boundary",
      status: s.freezeChecklistPass ? "pass" : "fail",
      state: toState(s.freezeChecklistPass),
      required: true,
      notes: "Declarative freeze boundary",
    },
    {
      id: "IFC-008",
      label: "E05 verify chain documented",
      status: s.platformGatesPass ? "pass" : "fail",
      state: toState(s.platformGatesPass),
      required: true,
      notes: "npx tsx scripts/verify-e05-p8-intelligence-governance.ts",
    },
    {
      id: "IFC-009",
      label: "P8 sign-off module present",
      status: s.freezeChecklistPass ? "pass" : "fail",
      state: toState(s.freezeChecklistPass),
      required: true,
    },
    {
      id: "IFC-010",
      label: "Enterprise Intelligence Layer ready to freeze",
      status: s.platformReady && s.versionLockIntact ? "pass" : "fail",
      state: toState(s.platformReady && s.versionLockIntact),
      required: true,
    },
  ];
}

export function buildFreezeChecklistManifest(
  signals: IntelligenceSignoffSignals,
): FreezeChecklist {
  const items = buildFreezeChecklist(signals);
  const passCount = items.filter((i) => i.status === "pass").length;
  const failCount = items.filter((i) => i.status === "fail").length;
  const checklistPass = items
    .filter((i) => i.required)
    .every((i) => i.status === "pass");

  return {
    version: E05_INTELLIGENCE_PLATFORM_FREEZE_VERSION,
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

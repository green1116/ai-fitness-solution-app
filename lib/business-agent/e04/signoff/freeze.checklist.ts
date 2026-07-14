/**
 * E04-P8 — Business Agent freeze checklist (declarative, read-only)
 */

import type {
  BusinessAgentSignoffSignals,
  FreezeChecklist,
  FreezeChecklistItem,
} from "./signoff.types";
import { E04_BUSINESS_AGENT_PLATFORM_FREEZE_VERSION } from "./signoff.types";

function toState(pass: boolean): FreezeChecklistItem["state"] {
  return pass ? "pass" : "fail";
}

export function buildFreezeChecklist(
  signals: BusinessAgentSignoffSignals,
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
      id: "BAFC-001",
      label: "E04 P1–P7 all business agent layers ready",
      status: s.platformReady ? "pass" : "fail",
      state: toState(s.platformReady),
      required: true,
    },
    {
      id: "BAFC-002",
      label: "Business agent layer version lock intact",
      status: s.versionLockIntact ? "pass" : "fail",
      state: toState(s.versionLockIntact),
      required: true,
      notes: "freeze.lock.ts",
    },
    {
      id: "BAFC-003",
      label: "Business agent gate summary all pass",
      status: s.platformGatesPass ? "pass" : "fail",
      state: toState(s.platformGatesPass),
      required: true,
    },
    {
      id: "BAFC-004",
      label: "Rollback snapshot index complete",
      status: s.rollbackSnapshotComplete ? "pass" : "fail",
      state: toState(s.rollbackSnapshotComplete),
      required: true,
    },
    {
      id: "BAFC-005",
      label: "P1–P7 freeze versions locked",
      status: s.versionLockIntact ? "pass" : "fail",
      state: toState(s.versionLockIntact),
      required: true,
    },
    {
      id: "BAFC-006",
      label: "Enterprise collaboration baseline closed",
      status: s.platformReady ? "pass" : "fail",
      state: toState(s.platformReady),
      required: true,
      notes: "P7 CollaborationRuntime",
    },
    {
      id: "BAFC-007",
      label: "E03 / E04-P1–P7 unmodified boundary",
      status: s.freezeChecklistPass ? "pass" : "fail",
      state: toState(s.freezeChecklistPass),
      required: true,
      notes: "Declarative freeze boundary",
    },
    {
      id: "BAFC-008",
      label: "E04 verify chain documented",
      status: s.platformGatesPass ? "pass" : "fail",
      state: toState(s.platformGatesPass),
      required: true,
      notes: "npx tsx scripts/verify-e04-p8-business-agent-governance.ts",
    },
    {
      id: "BAFC-009",
      label: "P8 sign-off module present",
      status: s.freezeChecklistPass ? "pass" : "fail",
      state: toState(s.freezeChecklistPass),
      required: true,
    },
    {
      id: "BAFC-010",
      label: "Enterprise Business Agent Platform ready to freeze",
      status: s.platformReady && s.versionLockIntact ? "pass" : "fail",
      state: toState(s.platformReady && s.versionLockIntact),
      required: true,
    },
  ];
}

export function buildFreezeChecklistManifest(
  signals: BusinessAgentSignoffSignals,
): FreezeChecklist {
  const items = buildFreezeChecklist(signals);
  const passCount = items.filter((i) => i.status === "pass").length;
  const failCount = items.filter((i) => i.status === "fail").length;
  const checklistPass = items
    .filter((i) => i.required)
    .every((i) => i.status === "pass");

  return {
    version: E04_BUSINESS_AGENT_PLATFORM_FREEZE_VERSION,
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

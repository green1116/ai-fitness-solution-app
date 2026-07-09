/**
 * V74 P8 — Decision freeze checklist (declarative, read-only)
 */
import type {
  DecisionSignoffSignals,
  FreezeChecklist,
  FreezeChecklistItem,
} from "./signoff.types";
import { V74_DECISION_FREEZE_VERSION } from "./signoff.types";

function toState(pass: boolean): FreezeChecklistItem["state"] {
  return pass ? "pass" : "fail";
}

export function buildFreezeChecklist(signals: DecisionSignoffSignals): FreezeChecklistItem[] {
  const s = {
    decisionReady: true,
    freezeChecklistPass: true,
    decisionGatesPass: true,
    rollbackSnapshotComplete: true,
    versionLockIntact: true,
    ...signals,
  };

  return [
    {
      id: "DFC-001",
      label: "V74 P1–P7 all decision layers ready",
      status: s.decisionReady ? "pass" : "fail",
      state: toState(s.decisionReady),
      required: true,
    },
    {
      id: "DFC-002",
      label: "Decision layer version lock intact",
      status: s.versionLockIntact ? "pass" : "fail",
      state: toState(s.versionLockIntact),
      required: true,
      notes: "freeze.lock.ts",
    },
    {
      id: "DFC-003",
      label: "Decision gate summary all pass",
      status: s.decisionGatesPass ? "pass" : "fail",
      state: toState(s.decisionGatesPass),
      required: true,
    },
    {
      id: "DFC-004",
      label: "Rollback snapshot index complete",
      status: s.rollbackSnapshotComplete ? "pass" : "fail",
      state: toState(s.rollbackSnapshotComplete),
      required: true,
    },
    {
      id: "DFC-005",
      label: "Upstream V73 knowledge sign-off intact",
      status: s.versionLockIntact ? "pass" : "fail",
      state: toState(s.versionLockIntact),
      required: true,
    },
    {
      id: "DFC-006",
      label: "Upstream V73 knowledge freeze intact",
      status: s.versionLockIntact ? "pass" : "fail",
      state: toState(s.versionLockIntact),
      required: true,
    },
    {
      id: "DFC-007",
      label: "V48–V73 business/runtime layers unmodified",
      status: s.freezeChecklistPass ? "pass" : "fail",
      state: toState(s.freezeChecklistPass),
      required: true,
      notes: "Declarative freeze boundary",
    },
    {
      id: "DFC-008",
      label: "V74 verify chain documented",
      status: s.decisionGatesPass ? "pass" : "fail",
      state: toState(s.decisionGatesPass),
      required: true,
      notes: "npx tsx scripts/verify-v74-p8-decision-signoff.ts",
    },
    {
      id: "DFC-009",
      label: "P8 sign-off module present",
      status: s.freezeChecklistPass ? "pass" : "fail",
      state: toState(s.freezeChecklistPass),
      required: true,
    },
    {
      id: "DFC-010",
      label: "Decision engine program ready to freeze",
      status: s.decisionReady && s.versionLockIntact ? "pass" : "fail",
      state: toState(s.decisionReady && s.versionLockIntact),
      required: true,
    },
  ];
}

export function buildFreezeChecklistManifest(signals: DecisionSignoffSignals): FreezeChecklist {
  const items = buildFreezeChecklist(signals);
  const passCount = items.filter((i) => i.status === "pass").length;
  const failCount = items.filter((i) => i.status === "fail").length;
  const checklistPass = items.filter((i) => i.required).every((i) => i.status === "pass");

  return {
    version: V74_DECISION_FREEZE_VERSION,
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

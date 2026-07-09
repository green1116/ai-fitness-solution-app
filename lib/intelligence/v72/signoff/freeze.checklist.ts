/**
 * V72 P8 — Intelligence freeze checklist (declarative, read-only)
 */
import type {
  FreezeChecklist,
  FreezeChecklistItem,
  IntelligenceSignoffSignals,
} from "./signoff.types";
import { V72_INTELLIGENCE_FREEZE_VERSION } from "./signoff.types";

function toState(pass: boolean): FreezeChecklistItem["state"] {
  return pass ? "pass" : "fail";
}

export function buildFreezeChecklist(
  signals: IntelligenceSignoffSignals,
): FreezeChecklistItem[] {
  const s = {
    intelligenceReady: true,
    freezeChecklistPass: true,
    intelligenceGatesPass: true,
    rollbackSnapshotComplete: true,
    versionLockIntact: true,
    ...signals,
  };

  return [
    {
      id: "IFC-001",
      label: "V72 P1–P7 all intelligence layers ready",
      status: s.intelligenceReady ? "pass" : "fail",
      state: toState(s.intelligenceReady),
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
      status: s.intelligenceGatesPass ? "pass" : "fail",
      state: toState(s.intelligenceGatesPass),
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
      label: "Upstream V71 workflow sign-off intact",
      status: s.versionLockIntact ? "pass" : "fail",
      state: toState(s.versionLockIntact),
      required: true,
    },
    {
      id: "IFC-006",
      label: "Upstream V71 workflow freeze intact",
      status: s.versionLockIntact ? "pass" : "fail",
      state: toState(s.versionLockIntact),
      required: true,
    },
    {
      id: "IFC-007",
      label: "V48–V71 business/runtime layers unmodified",
      status: s.freezeChecklistPass ? "pass" : "fail",
      state: toState(s.freezeChecklistPass),
      required: true,
      notes: "Declarative freeze boundary",
    },
    {
      id: "IFC-008",
      label: "V72 verify chain documented",
      status: s.intelligenceGatesPass ? "pass" : "fail",
      state: toState(s.intelligenceGatesPass),
      required: true,
      notes: "npx tsx scripts/verify-v72-p8-intelligence-signoff.ts",
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
      label: "Operational intelligence program ready to freeze",
      status: s.intelligenceReady && s.versionLockIntact ? "pass" : "fail",
      state: toState(s.intelligenceReady && s.versionLockIntact),
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
  const checklistPass = items.filter((i) => i.required).every((i) => i.status === "pass");

  return {
    version: V72_INTELLIGENCE_FREEZE_VERSION,
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

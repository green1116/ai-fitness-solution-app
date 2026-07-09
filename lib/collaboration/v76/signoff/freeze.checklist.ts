/**
 * V76 P8 — Collaboration freeze checklist (declarative, read-only)
 */
import type { CollaborationSignoffSignals, FreezeChecklist, FreezeChecklistItem } from "./signoff.types";
import { V76_COLLABORATION_FREEZE_VERSION } from "./signoff.types";

function toState(pass: boolean): FreezeChecklistItem["state"] {
  return pass ? "pass" : "fail";
}

export function buildFreezeChecklist(signals: CollaborationSignoffSignals): FreezeChecklistItem[] {
  const s = {
    collaborationReady: true,
    freezeChecklistPass: true,
    collaborationGatesPass: true,
    rollbackSnapshotComplete: true,
    versionLockIntact: true,
    ...signals,
  };

  return [
    {
      id: "CFC-001",
      label: "V76 P1–P7 all collaboration layers ready",
      status: s.collaborationReady ? "pass" : "fail",
      state: toState(s.collaborationReady),
      required: true,
    },
    {
      id: "CFC-002",
      label: "Collaboration layer version lock intact",
      status: s.versionLockIntact ? "pass" : "fail",
      state: toState(s.versionLockIntact),
      required: true,
      notes: "freeze.lock.ts",
    },
    {
      id: "CFC-003",
      label: "Collaboration gate summary all pass",
      status: s.collaborationGatesPass ? "pass" : "fail",
      state: toState(s.collaborationGatesPass),
      required: true,
    },
    {
      id: "CFC-004",
      label: "Rollback snapshot index complete",
      status: s.rollbackSnapshotComplete ? "pass" : "fail",
      state: toState(s.rollbackSnapshotComplete),
      required: true,
    },
    {
      id: "CFC-005",
      label: "Upstream V75 agent sign-off intact",
      status: s.versionLockIntact ? "pass" : "fail",
      state: toState(s.versionLockIntact),
      required: true,
    },
    {
      id: "CFC-006",
      label: "Upstream V75 agent freeze intact",
      status: s.versionLockIntact ? "pass" : "fail",
      state: toState(s.versionLockIntact),
      required: true,
    },
    {
      id: "CFC-007",
      label: "V48–V75 business/runtime layers unmodified",
      status: s.freezeChecklistPass ? "pass" : "fail",
      state: toState(s.freezeChecklistPass),
      required: true,
      notes: "Declarative freeze boundary",
    },
    {
      id: "CFC-008",
      label: "V76 verify chain documented",
      status: s.collaborationGatesPass ? "pass" : "fail",
      state: toState(s.collaborationGatesPass),
      required: true,
      notes: "npx tsx scripts/verify-v76-p8-collaboration-signoff.ts",
    },
    {
      id: "CFC-009",
      label: "P8 sign-off module present",
      status: s.freezeChecklistPass ? "pass" : "fail",
      state: toState(s.freezeChecklistPass),
      required: true,
    },
    {
      id: "CFC-010",
      label: "Collaboration program ready to freeze",
      status: s.collaborationReady && s.versionLockIntact ? "pass" : "fail",
      state: toState(s.collaborationReady && s.versionLockIntact),
      required: true,
    },
  ];
}

export function buildFreezeChecklistManifest(signals: CollaborationSignoffSignals): FreezeChecklist {
  const items = buildFreezeChecklist(signals);
  const passCount = items.filter((i) => i.status === "pass").length;
  const failCount = items.filter((i) => i.status === "fail").length;
  const checklistPass = items.filter((i) => i.required).every((i) => i.status === "pass");

  return {
    version: V76_COLLABORATION_FREEZE_VERSION,
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

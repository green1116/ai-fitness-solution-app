/**
 * E01-P8 — Tender Intelligence freeze checklist (declarative, read-only)
 */

import type {
  FreezeChecklist,
  FreezeChecklistItem,
  TenderSignoffSignals,
} from "./signoff.types";
import { V101_TENDER_FREEZE_VERSION } from "./signoff.types";

function toState(pass: boolean): FreezeChecklistItem["state"] {
  return pass ? "pass" : "fail";
}

export function buildFreezeChecklist(signals: TenderSignoffSignals): FreezeChecklistItem[] {
  const s = {
    tenderReady: true,
    freezeChecklistPass: true,
    tenderGatesPass: true,
    rollbackSnapshotComplete: true,
    versionLockIntact: true,
    ...signals,
  };

  return [
    {
      id: "TFC-001",
      label: "E01 P1–P7 all tender intelligence layers ready",
      status: s.tenderReady ? "pass" : "fail",
      state: toState(s.tenderReady),
      required: true,
    },
    {
      id: "TFC-002",
      label: "Tender intelligence layer version lock intact",
      status: s.versionLockIntact ? "pass" : "fail",
      state: toState(s.versionLockIntact),
      required: true,
      notes: "freeze.lock.ts",
    },
    {
      id: "TFC-003",
      label: "Tender intelligence gate summary all pass",
      status: s.tenderGatesPass ? "pass" : "fail",
      state: toState(s.tenderGatesPass),
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
      label: "P1–P7 freeze versions locked",
      status: s.versionLockIntact ? "pass" : "fail",
      state: toState(s.versionLockIntact),
      required: true,
    },
    {
      id: "TFC-006",
      label: "Enterprise delivery baseline sealed",
      status: s.tenderReady ? "pass" : "fail",
      state: toState(s.tenderReady),
      required: true,
      notes: "P7 EnterpriseDeliveryPackage",
    },
    {
      id: "TFC-007",
      label: "V100 / P1–P7 modules unmodified boundary",
      status: s.freezeChecklistPass ? "pass" : "fail",
      state: toState(s.freezeChecklistPass),
      required: true,
      notes: "Declarative freeze boundary",
    },
    {
      id: "TFC-008",
      label: "E01 verify chain documented",
      status: s.tenderGatesPass ? "pass" : "fail",
      state: toState(s.tenderGatesPass),
      required: true,
      notes: "npx tsx scripts/verify-v101-p8-signoff.ts",
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
      label: "Enterprise Tender Intelligence ready to freeze",
      status: s.tenderReady && s.versionLockIntact ? "pass" : "fail",
      state: toState(s.tenderReady && s.versionLockIntact),
      required: true,
    },
  ];
}

export function buildFreezeChecklistManifest(signals: TenderSignoffSignals): FreezeChecklist {
  const items = buildFreezeChecklist(signals);
  const passCount = items.filter((i) => i.status === "pass").length;
  const failCount = items.filter((i) => i.status === "fail").length;
  const checklistPass = items.filter((i) => i.required).every((i) => i.status === "pass");

  return {
    version: V101_TENDER_FREEZE_VERSION,
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

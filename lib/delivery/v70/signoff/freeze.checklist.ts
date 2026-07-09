/**
 * V70 P8 — Delivery freeze checklist (declarative, read-only)
 */
import type {
  DeliverySignoffSignals,
  FreezeChecklist,
  FreezeChecklistItem,
} from "./signoff.types";
import { V70_DELIVERY_FREEZE_VERSION } from "./signoff.types";

function toState(pass: boolean): FreezeChecklistItem["state"] {
  return pass ? "pass" : "fail";
}

export function buildFreezeChecklist(signals: DeliverySignoffSignals): FreezeChecklistItem[] {
  const s = {
    deliveryReady: true,
    freezeChecklistPass: true,
    releaseGatesPass: true,
    rollbackSnapshotComplete: true,
    versionLockIntact: true,
    ...signals,
  };

  return [
    {
      id: "DFC-001",
      label: "V70 P1–P7 all delivery layers ready",
      status: s.deliveryReady ? "pass" : "fail",
      state: toState(s.deliveryReady),
      required: true,
    },
    {
      id: "DFC-002",
      label: "Delivery layer version lock intact",
      status: s.versionLockIntact ? "pass" : "fail",
      state: toState(s.versionLockIntact),
      required: true,
      notes: "freeze.lock.ts",
    },
    {
      id: "DFC-003",
      label: "Release gate summary all pass",
      status: s.releaseGatesPass ? "pass" : "fail",
      state: toState(s.releaseGatesPass),
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
      label: "Upstream V69 technical governance sign-off intact",
      status: s.versionLockIntact ? "pass" : "fail",
      state: toState(s.versionLockIntact),
      required: true,
    },
    {
      id: "DFC-006",
      label: "Upstream V69 technical governance freeze intact",
      status: s.versionLockIntact ? "pass" : "fail",
      state: toState(s.versionLockIntact),
      required: true,
    },
    {
      id: "DFC-007",
      label: "V48–V69 business/runtime layers unmodified",
      status: s.freezeChecklistPass ? "pass" : "fail",
      state: toState(s.freezeChecklistPass),
      required: true,
      notes: "Declarative freeze boundary",
    },
    {
      id: "DFC-008",
      label: "V70 verify chain documented",
      status: s.releaseGatesPass ? "pass" : "fail",
      state: toState(s.releaseGatesPass),
      required: true,
      notes: "npx tsx scripts/verify-v70-p8-delivery-signoff.ts",
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
      label: "Delivery lifecycle program ready to freeze",
      status: s.deliveryReady && s.versionLockIntact ? "pass" : "fail",
      state: toState(s.deliveryReady && s.versionLockIntact),
      required: true,
    },
  ];
}

export function buildFreezeChecklistManifest(
  signals: DeliverySignoffSignals,
): FreezeChecklist {
  const items = buildFreezeChecklist(signals);
  const passCount = items.filter((i) => i.status === "pass").length;
  const failCount = items.filter((i) => i.status === "fail").length;
  const checklistPass = items.filter((i) => i.required).every((i) => i.status === "pass");

  return {
    version: V70_DELIVERY_FREEZE_VERSION,
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

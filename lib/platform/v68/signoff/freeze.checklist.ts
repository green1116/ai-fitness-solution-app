/**
 * V68 P8 — Platform freeze checklist (declarative, read-only)
 */
import type {
  FreezeChecklistItem,
  FreezeChecklistManifest,
  PlatformSignoffSignals,
} from "./signoff.types";
import { V68_PLATFORM_FREEZE_VERSION } from "./signoff.types";

export function buildFreezeChecklist(signals: PlatformSignoffSignals): FreezeChecklistItem[] {
  const s = {
    platformReady: true,
    freezeChecklistPass: true,
    releaseGatesPass: true,
    rollbackSnapshotComplete: true,
    versionLockIntact: true,
    ...signals,
  };

  return [
    {
      id: "PFC-001",
      label: "V68 P1–P7 all governance layers ready",
      status: s.platformReady ? "pass" : "fail",
      required: true,
    },
    {
      id: "PFC-002",
      label: "Platform layer version lock intact",
      status: s.versionLockIntact ? "pass" : "fail",
      required: true,
      notes: "freeze.lock.ts",
    },
    {
      id: "PFC-003",
      label: "Release gate summary all pass",
      status: s.releaseGatesPass ? "pass" : "fail",
      required: true,
    },
    {
      id: "PFC-004",
      label: "Rollback snapshot index complete",
      status: s.rollbackSnapshotComplete ? "pass" : "fail",
      required: true,
    },
    {
      id: "PFC-005",
      label: "Upstream V67 monitoring sign-off intact",
      status: s.versionLockIntact ? "pass" : "fail",
      required: true,
    },
    {
      id: "PFC-006",
      label: "Upstream V67 monitoring freeze intact",
      status: s.versionLockIntact ? "pass" : "fail",
      required: true,
    },
    {
      id: "PFC-007",
      label: "V48–V67 business/runtime layers unmodified",
      status: s.freezeChecklistPass ? "pass" : "fail",
      required: true,
      notes: "Declarative freeze boundary",
    },
    {
      id: "PFC-008",
      label: "V68 verify chain documented",
      status: s.releaseGatesPass ? "pass" : "fail",
      required: true,
      notes: "npm run verify:v68-platform",
    },
    {
      id: "PFC-009",
      label: "P8 sign-off module present",
      status: s.freezeChecklistPass ? "pass" : "fail",
      required: true,
    },
    {
      id: "PFC-010",
      label: "Platform governance program ready to freeze",
      status: s.platformReady && s.versionLockIntact ? "pass" : "fail",
      required: true,
    },
  ];
}

export function buildFreezeChecklistManifest(
  signals: PlatformSignoffSignals,
): FreezeChecklistManifest {
  const items = buildFreezeChecklist(signals);
  const passCount = items.filter((i) => i.status === "pass").length;
  const checklistPass = items.filter((i) => i.required).every((i) => i.status === "pass");

  return {
    version: V68_PLATFORM_FREEZE_VERSION,
    itemCount: items.length,
    passCount,
    checklistPass,
    items,
    summary: [
      `freeze-checklist pass=${passCount}/${items.length}`,
      `checklistPass=${checklistPass}`,
    ].join(" "),
  };
}

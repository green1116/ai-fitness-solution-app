/**
 * E08-P8 — Ecosystem freeze checklist (declarative, read-only)
 */

import type {
  EcosystemSignoffSignals,
  FreezeChecklist,
  FreezeChecklistItem,
} from "./signoff.types";
import { E08_ECOSYSTEM_PLATFORM_FREEZE_VERSION } from "./signoff.types";

function toState(pass: boolean): FreezeChecklistItem["state"] {
  return pass ? "pass" : "fail";
}

export function buildFreezeChecklist(
  signals: EcosystemSignoffSignals,
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
      id: "EFC-001",
      label: "E08 P1–P7 all ecosystem layers ready",
      status: s.platformReady ? "pass" : "fail",
      state: toState(s.platformReady),
      required: true,
    },
    {
      id: "EFC-002",
      label: "Ecosystem layer version lock intact",
      status: s.versionLockIntact ? "pass" : "fail",
      state: toState(s.versionLockIntact),
      required: true,
      notes: "freeze.lock.ts",
    },
    {
      id: "EFC-003",
      label: "Ecosystem gate summary all pass",
      status: s.platformGatesPass ? "pass" : "fail",
      state: toState(s.platformGatesPass),
      required: true,
    },
    {
      id: "EFC-004",
      label: "Rollback snapshot index complete",
      status: s.rollbackSnapshotComplete ? "pass" : "fail",
      state: toState(s.rollbackSnapshotComplete),
      required: true,
    },
    {
      id: "EFC-005",
      label: "P1–P7 freeze versions locked",
      status: s.versionLockIntact ? "pass" : "fail",
      state: toState(s.versionLockIntact),
      required: true,
    },
    {
      id: "EFC-006",
      label: "Enterprise Network OS baseline ready",
      status: s.platformReady ? "pass" : "fail",
      state: toState(s.platformReady),
      required: true,
      notes: "P7 Network OS",
    },
    {
      id: "EFC-007",
      label: "E03 / E04 / E05 / E06 / E07 / E08-P1–P7 unmodified boundary",
      status: s.freezeChecklistPass ? "pass" : "fail",
      state: toState(s.freezeChecklistPass),
      required: true,
      notes: "Declarative freeze boundary",
    },
    {
      id: "EFC-008",
      label: "E08 verify chain documented",
      status: s.platformGatesPass ? "pass" : "fail",
      state: toState(s.platformGatesPass),
      required: true,
      notes: "npx tsx scripts/verify-e08-p8-ecosystem-governance.ts",
    },
    {
      id: "EFC-009",
      label: "P8 sign-off module present",
      status: s.freezeChecklistPass ? "pass" : "fail",
      state: toState(s.freezeChecklistPass),
      required: true,
    },
    {
      id: "EFC-010",
      label: "Autonomous Enterprise Ecosystem Platform ready to freeze",
      status: s.platformReady && s.versionLockIntact ? "pass" : "fail",
      state: toState(s.platformReady && s.versionLockIntact),
      required: true,
    },
  ];
}

export function buildFreezeChecklistManifest(
  signals: EcosystemSignoffSignals,
): FreezeChecklist {
  const items = buildFreezeChecklist(signals);
  const passCount = items.filter((i) => i.status === "pass").length;
  const failCount = items.filter((i) => i.status === "fail").length;
  const checklistPass = items
    .filter((i) => i.required)
    .every((i) => i.status === "pass");

  return {
    version: E08_ECOSYSTEM_PLATFORM_FREEZE_VERSION,
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

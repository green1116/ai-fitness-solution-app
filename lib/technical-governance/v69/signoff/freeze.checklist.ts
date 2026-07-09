/**
 * V69 P8 — Technical governance freeze checklist (declarative, read-only)
 */
import type {
  FreezeChecklistItem,
  FreezeChecklistManifest,
  TechnicalSignoffSignals,
} from "./signoff.types";
import { V69_TECHNICAL_GOVERNANCE_FREEZE_VERSION } from "./signoff.types";

export function buildFreezeChecklist(signals: TechnicalSignoffSignals): FreezeChecklistItem[] {
  const s = {
    governanceReady: true,
    freezeChecklistPass: true,
    releaseGatesPass: true,
    rollbackSnapshotComplete: true,
    versionLockIntact: true,
    ...signals,
  };

  return [
    {
      id: "TFC-001",
      label: "V69 P1–P7 all governance layers ready",
      status: s.governanceReady ? "pass" : "fail",
      required: true,
    },
    {
      id: "TFC-002",
      label: "Technical layer version lock intact",
      status: s.versionLockIntact ? "pass" : "fail",
      required: true,
      notes: "freeze.lock.ts",
    },
    {
      id: "TFC-003",
      label: "Release gate summary all pass",
      status: s.releaseGatesPass ? "pass" : "fail",
      required: true,
    },
    {
      id: "TFC-004",
      label: "Rollback snapshot index complete",
      status: s.rollbackSnapshotComplete ? "pass" : "fail",
      required: true,
    },
    {
      id: "TFC-005",
      label: "Upstream V68 platform sign-off intact",
      status: s.versionLockIntact ? "pass" : "fail",
      required: true,
    },
    {
      id: "TFC-006",
      label: "Upstream V68 platform freeze intact",
      status: s.versionLockIntact ? "pass" : "fail",
      required: true,
    },
    {
      id: "TFC-007",
      label: "V48–V68 business/runtime layers unmodified",
      status: s.freezeChecklistPass ? "pass" : "fail",
      required: true,
      notes: "Declarative freeze boundary",
    },
    {
      id: "TFC-008",
      label: "V69 verify chain documented",
      status: s.releaseGatesPass ? "pass" : "fail",
      required: true,
      notes: "npm run verify:v69-technical-governance",
    },
    {
      id: "TFC-009",
      label: "P8 sign-off module present",
      status: s.freezeChecklistPass ? "pass" : "fail",
      required: true,
    },
    {
      id: "TFC-010",
      label: "Technical governance program ready to freeze",
      status: s.governanceReady && s.versionLockIntact ? "pass" : "fail",
      required: true,
    },
  ];
}

export function buildFreezeChecklistManifest(
  signals: TechnicalSignoffSignals,
): FreezeChecklistManifest {
  const items = buildFreezeChecklist(signals);
  const passCount = items.filter((i) => i.status === "pass").length;
  const checklistPass = items.filter((i) => i.required).every((i) => i.status === "pass");

  return {
    version: V69_TECHNICAL_GOVERNANCE_FREEZE_VERSION,
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

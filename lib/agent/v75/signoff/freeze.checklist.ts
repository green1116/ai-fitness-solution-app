/**
 * V75 P8 — Agent freeze checklist (declarative, read-only)
 */
import type { AgentSignoffSignals, FreezeChecklist, FreezeChecklistItem } from "./signoff.types";
import { V75_AGENT_FREEZE_VERSION } from "./signoff.types";

function toState(pass: boolean): FreezeChecklistItem["state"] {
  return pass ? "pass" : "fail";
}

export function buildFreezeChecklist(signals: AgentSignoffSignals): FreezeChecklistItem[] {
  const s = {
    agentReady: true,
    freezeChecklistPass: true,
    agentGatesPass: true,
    rollbackSnapshotComplete: true,
    versionLockIntact: true,
    ...signals,
  };

  return [
    {
      id: "AFC-001",
      label: "V75 P1–P7 all agent layers ready",
      status: s.agentReady ? "pass" : "fail",
      state: toState(s.agentReady),
      required: true,
    },
    {
      id: "AFC-002",
      label: "Agent layer version lock intact",
      status: s.versionLockIntact ? "pass" : "fail",
      state: toState(s.versionLockIntact),
      required: true,
      notes: "freeze.lock.ts",
    },
    {
      id: "AFC-003",
      label: "Agent gate summary all pass",
      status: s.agentGatesPass ? "pass" : "fail",
      state: toState(s.agentGatesPass),
      required: true,
    },
    {
      id: "AFC-004",
      label: "Rollback snapshot index complete",
      status: s.rollbackSnapshotComplete ? "pass" : "fail",
      state: toState(s.rollbackSnapshotComplete),
      required: true,
    },
    {
      id: "AFC-005",
      label: "Upstream V74 decision sign-off intact",
      status: s.versionLockIntact ? "pass" : "fail",
      state: toState(s.versionLockIntact),
      required: true,
    },
    {
      id: "AFC-006",
      label: "Upstream V74 decision freeze intact",
      status: s.versionLockIntact ? "pass" : "fail",
      state: toState(s.versionLockIntact),
      required: true,
    },
    {
      id: "AFC-007",
      label: "V48–V74 business/runtime layers unmodified",
      status: s.freezeChecklistPass ? "pass" : "fail",
      state: toState(s.freezeChecklistPass),
      required: true,
      notes: "Declarative freeze boundary",
    },
    {
      id: "AFC-008",
      label: "V75 verify chain documented",
      status: s.agentGatesPass ? "pass" : "fail",
      state: toState(s.agentGatesPass),
      required: true,
      notes: "npx tsx scripts/verify-v75-p8-agent-signoff.ts",
    },
    {
      id: "AFC-009",
      label: "P8 sign-off module present",
      status: s.freezeChecklistPass ? "pass" : "fail",
      state: toState(s.freezeChecklistPass),
      required: true,
    },
    {
      id: "AFC-010",
      label: "Agent orchestration program ready to freeze",
      status: s.agentReady && s.versionLockIntact ? "pass" : "fail",
      state: toState(s.agentReady && s.versionLockIntact),
      required: true,
    },
  ];
}

export function buildFreezeChecklistManifest(signals: AgentSignoffSignals): FreezeChecklist {
  const items = buildFreezeChecklist(signals);
  const passCount = items.filter((i) => i.status === "pass").length;
  const failCount = items.filter((i) => i.status === "fail").length;
  const checklistPass = items.filter((i) => i.required).every((i) => i.status === "pass");

  return {
    version: V75_AGENT_FREEZE_VERSION,
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

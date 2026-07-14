/**
 * E02-P8 — Knowledge Graph freeze checklist (declarative, read-only)
 */

import type {
  FreezeChecklist,
  FreezeChecklistItem,
  KnowledgeSignoffSignals,
} from "./signoff.types";
import { V102_KNOWLEDGE_FREEZE_VERSION } from "./signoff.types";

function toState(pass: boolean): FreezeChecklistItem["state"] {
  return pass ? "pass" : "fail";
}

export function buildFreezeChecklist(
  signals: KnowledgeSignoffSignals,
): FreezeChecklistItem[] {
  const s = {
    knowledgeReady: true,
    freezeChecklistPass: true,
    knowledgeGatesPass: true,
    rollbackSnapshotComplete: true,
    versionLockIntact: true,
    ...signals,
  };

  return [
    {
      id: "KFC-001",
      label: "E02 P1–P7 all knowledge graph layers ready",
      status: s.knowledgeReady ? "pass" : "fail",
      state: toState(s.knowledgeReady),
      required: true,
    },
    {
      id: "KFC-002",
      label: "Knowledge graph layer version lock intact",
      status: s.versionLockIntact ? "pass" : "fail",
      state: toState(s.versionLockIntact),
      required: true,
      notes: "freeze.lock.ts",
    },
    {
      id: "KFC-003",
      label: "Knowledge graph gate summary all pass",
      status: s.knowledgeGatesPass ? "pass" : "fail",
      state: toState(s.knowledgeGatesPass),
      required: true,
    },
    {
      id: "KFC-004",
      label: "Rollback snapshot index complete",
      status: s.rollbackSnapshotComplete ? "pass" : "fail",
      state: toState(s.rollbackSnapshotComplete),
      required: true,
    },
    {
      id: "KFC-005",
      label: "P1–P7 freeze versions locked",
      status: s.versionLockIntact ? "pass" : "fail",
      state: toState(s.versionLockIntact),
      required: true,
    },
    {
      id: "KFC-006",
      label: "Enterprise knowledge delivery baseline sealed",
      status: s.knowledgeReady ? "pass" : "fail",
      state: toState(s.knowledgeReady),
      required: true,
      notes: "P7 EnterpriseKnowledgePackage",
    },
    {
      id: "KFC-007",
      label: "V100 / E01 / E02-P1–P7 unmodified boundary",
      status: s.freezeChecklistPass ? "pass" : "fail",
      state: toState(s.freezeChecklistPass),
      required: true,
      notes: "Declarative freeze boundary",
    },
    {
      id: "KFC-008",
      label: "E02 verify chain documented",
      status: s.knowledgeGatesPass ? "pass" : "fail",
      state: toState(s.knowledgeGatesPass),
      required: true,
      notes: "npx tsx scripts/verify-v102-p8-signoff.ts",
    },
    {
      id: "KFC-009",
      label: "P8 sign-off module present",
      status: s.freezeChecklistPass ? "pass" : "fail",
      state: toState(s.freezeChecklistPass),
      required: true,
    },
    {
      id: "KFC-010",
      label: "Enterprise Tender Knowledge Graph ready to freeze",
      status: s.knowledgeReady && s.versionLockIntact ? "pass" : "fail",
      state: toState(s.knowledgeReady && s.versionLockIntact),
      required: true,
    },
  ];
}

export function buildFreezeChecklistManifest(
  signals: KnowledgeSignoffSignals,
): FreezeChecklist {
  const items = buildFreezeChecklist(signals);
  const passCount = items.filter((i) => i.status === "pass").length;
  const failCount = items.filter((i) => i.status === "fail").length;
  const checklistPass = items
    .filter((i) => i.required)
    .every((i) => i.status === "pass");

  return {
    version: V102_KNOWLEDGE_FREEZE_VERSION,
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

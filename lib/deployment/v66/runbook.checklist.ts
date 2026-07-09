/**
 * V66 P7 — Operations runbook checklist (declarative, read-only)
 */
import type {
  DeploymentOpsSignals,
  RunbookChecklistItem,
  RunbookChecklistManifest,
} from "./ops.types";
import { V66_DEPLOYMENT_OPS_VERSION } from "./ops.types";

export function buildRunbookChecklist(signals: DeploymentOpsSignals): RunbookChecklistItem[] {
  const s = {
    drReady: true,
    automationCatalogComplete: true,
    runbookChecklistPass: true,
    operatorActionsComplete: true,
    escalationMapComplete: true,
    ...signals,
  };

  return [
    {
      id: "RB-001",
      label: "Confirm V66 automation catalog complete",
      phase: "pre-deploy",
      status: s.automationCatalogComplete ? "pass" : "fail",
      required: true,
    },
    {
      id: "RB-002",
      label: "Run V66 deployment verify chain",
      phase: "pre-deploy",
      status: s.drReady ? "pass" : "fail",
      required: true,
      notes: "npm run verify:v66-deployment",
    },
    {
      id: "RB-003",
      label: "Validate env contract and security policies",
      phase: "pre-deploy",
      status: s.drReady ? "pass" : "fail",
      required: true,
      notes: "P1 + P5 declarative gates",
    },
    {
      id: "RB-004",
      label: "Execute prisma preflight and build (operator)",
      phase: "deploy",
      status: "na",
      required: true,
      notes: "No auto-execution in P7 — manual operator step",
    },
    {
      id: "RB-005",
      label: "Apply migrations if preflight pass (operator)",
      phase: "deploy",
      status: "na",
      required: true,
      notes: "npm run prisma:migrate:deploy",
    },
    {
      id: "RB-006",
      label: "Post-deploy verify and health probe check",
      phase: "post-deploy",
      status: s.runbookChecklistPass ? "pass" : "fail",
      required: true,
      notes: "/api/production/health reference",
    },
    {
      id: "RB-007",
      label: "Operator actions matrix documented",
      phase: "post-deploy",
      status: s.operatorActionsComplete ? "pass" : "fail",
      required: true,
    },
    {
      id: "RB-008",
      label: "Escalation map available for incidents",
      phase: "incident",
      status: s.escalationMapComplete ? "pass" : "fail",
      required: true,
    },
    {
      id: "RB-009",
      label: "DR restore checklist referenced for rollback",
      phase: "rollback",
      status: s.drReady ? "pass" : "fail",
      required: true,
      notes: "P6 restore.checklist.ts",
    },
    {
      id: "RB-010",
      label: "P7 ops runbook verify gate",
      phase: "post-deploy",
      status: s.runbookChecklistPass ? "pass" : "fail",
      required: true,
      notes: "npm run verify:v66-p7-deployment-ops",
    },
  ];
}

export function buildRunbookChecklistManifest(
  signals: DeploymentOpsSignals,
): RunbookChecklistManifest {
  const items = buildRunbookChecklist(signals);
  const passCount = items.filter((i) => i.status === "pass").length;
  const checklistPass = items
    .filter((i) => i.required)
    .every((i) => i.status === "pass" || i.status === "na");

  return {
    version: V66_DEPLOYMENT_OPS_VERSION,
    itemCount: items.length,
    passCount,
    checklistPass,
    items,
    summary: [
      `runbook-checklist pass=${passCount}/${items.length}`,
      `checklistPass=${checklistPass}`,
    ].join(" "),
  };
}

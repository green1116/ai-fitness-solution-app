/**
 * V66 P7 — Operator actions matrix (declarative catalog)
 */
import type { OperatorActionEntry, OperatorActionsManifest } from "./ops.types";
import { V66_DEPLOYMENT_OPS_VERSION } from "./ops.types";

export const OPERATOR_ACTIONS_MATRIX: OperatorActionEntry[] = [
  {
    id: "OA-001",
    action: "Run pre-deploy verify chain",
    role: "deployer",
    phase: "pre-deploy",
    commandRef: "npm run verify:v66-deployment",
    automated: false,
    required: true,
  },
  {
    id: "OA-002",
    action: "Review env contract and forbidden flags",
    role: "security",
    phase: "pre-deploy",
    commandRef: "npm run v92:env-audit",
    automated: false,
    required: true,
  },
  {
    id: "OA-003",
    action: "Execute prisma preflight",
    role: "platform",
    phase: "pre-deploy",
    commandRef: "npm run prisma:preflight",
    automated: false,
    required: true,
  },
  {
    id: "OA-004",
    action: "Run production build",
    role: "deployer",
    phase: "deploy",
    commandRef: "npm run build",
    automated: false,
    required: true,
  },
  {
    id: "OA-005",
    action: "Deploy database migrations",
    role: "platform",
    phase: "deploy",
    commandRef: "npm run prisma:migrate:deploy",
    automated: false,
    required: true,
  },
  {
    id: "OA-006",
    action: "Start application server",
    role: "operator",
    phase: "deploy",
    commandRef: "npm run start",
    automated: false,
    required: true,
  },
  {
    id: "OA-007",
    action: "Verify post-deploy health probe",
    role: "oncall",
    phase: "post-deploy",
    commandRef: "GET /api/production/health",
    automated: false,
    required: true,
  },
  {
    id: "OA-008",
    action: "Capture prisma schema snapshot",
    role: "platform",
    phase: "post-deploy",
    commandRef: "npm run prisma:snapshot",
    automated: false,
    required: false,
  },
  {
    id: "OA-009",
    action: "Initiate rollback per guard rules",
    role: "oncall",
    phase: "rollback",
    commandRef: "lib/deployment/v66/rollback.guard.ts",
    automated: false,
    required: true,
  },
  {
    id: "OA-010",
    action: "Follow DR restore checklist",
    role: "oncall",
    phase: "incident",
    commandRef: "lib/deployment/v66/restore.checklist.ts",
    automated: false,
    required: true,
  },
  {
    id: "OA-011",
    action: "Escalate per incident map",
    role: "oncall",
    phase: "incident",
    commandRef: "lib/deployment/v66/escalation.map.ts",
    automated: false,
    required: true,
  },
  {
    id: "OA-012",
    action: "Run P7 ops verify gate",
    role: "deployer",
    phase: "post-deploy",
    commandRef: "npm run verify:v66-p7-deployment-ops",
    automated: false,
    required: true,
  },
];

export function buildOperatorActionsManifest(): OperatorActionsManifest {
  const actions = OPERATOR_ACTIONS_MATRIX;
  const roles = new Set(actions.map((a) => a.role));
  const matrixComplete = actions.length >= 10 && roles.size >= 4;

  return {
    version: V66_DEPLOYMENT_OPS_VERSION,
    actionCount: actions.length,
    roleCount: roles.size,
    matrixComplete,
    actions,
    summary: [
      `operator-actions count=${actions.length}`,
      `roles=${roles.size}`,
      `complete=${matrixComplete}`,
    ].join(" "),
  };
}

export function getActionsByRole(role: OperatorActionEntry["role"]): OperatorActionEntry[] {
  return OPERATOR_ACTIONS_MATRIX.filter((a) => a.role === role);
}

/**
 * V80 DEPLOY P2 — Production cutover plan (dev → prod switch sequence)
 */
import { GO_LIVE_CHECKLIST } from "./deploy.checklist";
import type { CutoverStep } from "./cutover.types";

export const CUTOVER_PLAN: CutoverStep[] = [
  {
    id: "DEP-CUT-001",
    order: 1,
    phase: "preflight",
    action: "Confirm DEPLOY P1 launch ready + all GL gates pass",
    owner: "platform",
    rollbackPoint: false,
    command: "npm run verify:v80-deploy-p1-launch",
    required: true,
  },
  {
    id: "DEP-CUT-002",
    order: 2,
    phase: "preflight",
    action: "Apply V80Scaffold DB patch on production Postgres",
    owner: "dba",
    rollbackPoint: true,
    command: "prisma/patches/v80_scaffold_runtime_idempotent.sql",
    required: true,
  },
  {
    id: "DEP-CUT-003",
    order: 3,
    phase: "freeze",
    action: "Freeze staging deploys; tag release v80-code-release-1",
    owner: "release",
    rollbackPoint: true,
    required: true,
  },
  {
    id: "DEP-CUT-004",
    order: 4,
    phase: "switch",
    action: "Set production env from .env.v80.example (secrets via vault)",
    owner: "platform",
    rollbackPoint: true,
    required: true,
  },
  {
    id: "DEP-CUT-005",
    order: 5,
    phase: "switch",
    action: "Deploy Next.js production build to Vercel/host",
    owner: "platform",
    rollbackPoint: true,
    command: "npm run build && vercel deploy --prod",
    required: true,
  },
  {
    id: "DEP-CUT-006",
    order: 6,
    phase: "switch",
    action: "Enable V80 routes — traffic to /api/v80/*",
    owner: "platform",
    rollbackPoint: true,
    required: true,
  },
  {
    id: "DEP-CUT-007",
    order: 7,
    phase: "validate",
    action: "Run smoke suite + first-tenant live flow",
    owner: "qa",
    rollbackPoint: false,
    command: "npm run v80:smoke-live",
    required: true,
  },
  {
    id: "DEP-CUT-008",
    order: 8,
    phase: "validate",
    action: "Verify ops probes: health / metrics / audit",
    owner: "sre",
    rollbackPoint: false,
    command: "GET /api/v80/ops/health",
    required: true,
  },
  {
    id: "DEP-CUT-009",
    order: 9,
    phase: "announce",
    action: "Mark go-live complete; enable monitoring alerts",
    owner: "product",
    rollbackPoint: false,
    required: true,
  },
  {
    id: "DEP-CUT-010",
    order: 10,
    phase: "announce",
    action: "Document cutover in ops log; close DEP-GL checklist",
    owner: "release",
    rollbackPoint: false,
    command: GO_LIVE_CHECKLIST.map((g) => g.id).join(", "),
    required: true,
  },
];

export function isCutoverPlanComplete(): boolean {
  const phases = new Set(CUTOVER_PLAN.map((s) => s.phase));
  return (
    CUTOVER_PLAN.length === 10 &&
    phases.has("preflight") &&
    phases.has("switch") &&
    phases.has("validate") &&
    CUTOVER_PLAN.filter((s) => s.rollbackPoint).length >= 3
  );
}

/**
 * V80 DEPLOY P2 — Rollback + kill switch strategy
 */
import { getForbiddenProductionEnvKeys } from "./deploy.env.contract";
import type { RollbackAction } from "./cutover.types";

export const ROLLBACK_PLAN: RollbackAction[] = [
  {
    id: "DEP-RBK-001",
    trigger: "Smoke suite failure on cutover step 7",
    action: "Revert Vercel deployment to previous production alias",
    rtoMinutes: 15,
    required: true,
  },
  {
    id: "DEP-RBK-002",
    trigger: "Health probe /api/v80/ops/health returns ok=false",
    action: "Route traffic away from /api/v80/*; keep legacy /api/* only",
    killSwitch: "V80_ROUTES_DISABLED=1 (edge middleware block)",
    rtoMinutes: 5,
    required: true,
  },
  {
    id: "DEP-RBK-003",
    trigger: "Database persistence errors (P2021/P503)",
    action: "Automatic memory fallback active; disable worker; investigate DB",
    killSwitch: "V80_WORKER_ENABLED=0",
    rtoMinutes: 10,
    required: true,
  },
  {
    id: "DEP-RBK-004",
    trigger: "Commercial gate bypass or billing audit anomaly",
    action: "Enable strict commercial enforcement; block all mutating v80 routes",
    killSwitch: "V80_COMMERCIAL_STRICT=1",
    rtoMinutes: 5,
    required: true,
  },
  {
    id: "DEP-RBK-005",
    trigger: "Workflow runaway or PDF render error spike",
    action: "Stop autopilot enqueue; cap rate limit to 0 for /api/v80/autopilot/*",
    killSwitch: "V80_WORKFLOW_PAUSED=1",
    rtoMinutes: 5,
    required: true,
  },
  {
    id: "DEP-RBK-006",
    trigger: "Full platform rollback required",
    action: "Restore pre-cutover git tag; redeploy; verify DEP-GL-001..010",
    rtoMinutes: 60,
    required: true,
  },
];

export const KILL_SWITCH_ENV_KEYS = [
  "V80_ROUTES_DISABLED",
  "V80_WORKER_ENABLED",
  "V80_COMMERCIAL_STRICT",
  "V80_WORKFLOW_PAUSED",
] as const;

export function isRollbackPlanComplete(): boolean {
  const withKill = ROLLBACK_PLAN.filter((r) => r.killSwitch);
  const forbidden = getForbiddenProductionEnvKeys();
  return (
    ROLLBACK_PLAN.length === 6 &&
    withKill.length >= 4 &&
    forbidden.length >= 3 &&
    ROLLBACK_PLAN.every((r) => r.rtoMinutes <= 60)
  );
}

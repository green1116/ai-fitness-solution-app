/**
 * V80 PRODUCT P3 — Enterprise replication (multi-org / multi-region rollout)
 */
import { EXPANSION_PATHS } from "./growth.expansion.spec";
import type { EnterpriseReplicationModel } from "./scale.types";

export const ENTERPRISE_REPLICATION_MODELS: EnterpriseReplicationModel[] = [
  {
    id: "PRD-REP-001",
    replicationKey: "multi-org",
    rolloutPhase: "Phase 1 — Parent org + subsidiary workspaces",
    apiSurface: "/api/v80/tenant/run",
    governanceGate: "workspaceQuota → ENTERPRISE unlimited",
    expansionRef: EXPANSION_PATHS[3]!.id,
    required: true,
  },
  {
    id: "PRD-REP-002",
    replicationKey: "multi-org",
    rolloutPhase: "Phase 2 — Per-site tender projects under shared billing",
    apiSurface: "/api/v80/tender/intake",
    governanceGate: "Shared entitlement pool — org-level usage",
    expansionRef: "PRD-EXP-004",
    required: true,
  },
  {
    id: "PRD-REP-003",
    replicationKey: "multi-region",
    rolloutPhase: "Phase 1 — Regional workspace isolation (APAC / EMEA / NA)",
    apiSurface: "/api/v80/ops/health",
    governanceGate: "Deployment binding per region — PRD-DEP-*",
    expansionRef: "PRD-GTM-005",
    required: true,
  },
  {
    id: "PRD-REP-004",
    replicationKey: "multi-region",
    rolloutPhase: "Phase 2 — Cross-region audit + integrity rollup",
    apiSurface: "/api/v80/production/integrity",
    governanceGate: "Enterprise integrity score across regions",
    expansionRef: "PRD-GTM-006",
    required: true,
  },
  {
    id: "PRD-REP-005",
    replicationKey: "multi-brand",
    rolloutPhase: "Phase 1 — Partner white-label PDF outputs",
    apiSurface: "/api/v80/proposal-pdf/render",
    governanceGate: "Brand config per workspace",
    expansionRef: "PRD-CHA-005",
    required: true,
  },
  {
    id: "PRD-REP-006",
    replicationKey: "multi-brand",
    rolloutPhase: "Phase 2 — OEM catalog → standardized tender templates",
    apiSurface: "/api/v80/autopilot/job/run",
    governanceGate: "Workflow template library per brand",
    expansionRef: "PRD-DOM-003",
    required: true,
  },
];

export function isEnterpriseReplicationComplete(): boolean {
  const keys = new Set(ENTERPRISE_REPLICATION_MODELS.map((r) => r.replicationKey));
  return (
    ENTERPRISE_REPLICATION_MODELS.length === 6 &&
    keys.has("multi-org") &&
    keys.has("multi-region") &&
    keys.has("multi-brand")
  );
}

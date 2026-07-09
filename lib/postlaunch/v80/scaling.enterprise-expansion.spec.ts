/**
 * V80 POST-LAUNCH P3 — Enterprise expansion model (multi-org / multi-region / account growth)
 * Scales PRODUCT P3 ENTERPRISE_REPLICATION_MODELS via P2 enterprise acceleration
 */
import { ENTERPRISE_REPLICATION_MODELS } from "@/lib/product/v80/scale.replication.spec";
import { EXPANSION_PATHS } from "@/lib/product/v80/growth.expansion.spec";
import type { EnterpriseExpansionModel } from "./scaling.types";

export const ENTERPRISE_EXPANSION_MODEL: EnterpriseExpansionModel[] = [
  {
    id: "REV-SCL-EXP-001",
    dimension: "multi-org",
    phase: "Parent org + subsidiary workspace provisioning",
    apiSurface: "/api/v80/tenant/run",
    replicationRef: "PRD-REP-001",
    growthMetric: "NRR +30% per subsidiary onboarded",
    required: true,
  },
  {
    id: "REV-SCL-EXP-002",
    dimension: "multi-org",
    phase: "Shared billing pool — per-site tender projects",
    apiSurface: "/api/v80/tender/intake",
    replicationRef: "PRD-REP-002",
    growthMetric: "Usage density 2× with shared entitlements",
    required: true,
  },
  {
    id: "REV-SCL-EXP-003",
    dimension: "multi-org",
    phase: "Workspace limit gate → ENTERPRISE unlimited",
    apiSurface: "/api/v80/entitlements",
    replicationRef: "PRD-REP-001",
    growthMetric: "PRD-EXP-004 workspace expansion trigger",
    required: true,
  },
  {
    id: "REV-SCL-EXP-004",
    dimension: "multi-region",
    phase: "Regional workspace isolation (APAC/EMEA/NA)",
    apiSurface: "/api/v80/ops/health",
    replicationRef: "PRD-REP-003",
    growthMetric: "Regional ARR rollup per deployment binding",
    required: true,
  },
  {
    id: "REV-SCL-EXP-005",
    dimension: "multi-region",
    phase: "Cross-region integrity + audit rollup",
    apiSurface: "/api/v80/production/integrity",
    replicationRef: "PRD-REP-004",
    growthMetric: "REV-OPT-ENT-006 executive close acceleration",
    required: true,
  },
  {
    id: "REV-SCL-EXP-006",
    dimension: "multi-region",
    phase: "Governance audit export per region",
    apiSurface: "/api/v80/ops/governance/audit",
    replicationRef: "PRD-REP-004",
    growthMetric: "Compliance DD pre-answered — −16d sales cycle",
    required: true,
  },
  {
    id: "REV-SCL-EXP-007",
    dimension: "account-growth",
    phase: "Land-and-expand — PRO → ENTERPRISE bridge",
    apiSurface: "/api/v80/pdf?artifactId",
    replicationRef: "PRD-REP-005",
    growthMetric: "PRD-EXP-003 bundle gate → +$8k ACV",
    required: true,
  },
  {
    id: "REV-SCL-EXP-008",
    dimension: "account-growth",
    phase: "Workflow template library — OEM brand replication",
    apiSurface: "/api/v80/autopilot/job/run",
    replicationRef: "PRD-REP-006",
    growthMetric: "3× repeat tender rate per account (EXP-002)",
    required: true,
  },
];

export function isEnterpriseExpansionModelComplete(): boolean {
  const replicationIds = new Set(ENTERPRISE_REPLICATION_MODELS.map((r) => r.id));
  const expansionIds = new Set(EXPANSION_PATHS.map((e) => e.id));
  const dimensions = new Set(ENTERPRISE_EXPANSION_MODEL.map((e) => e.dimension));

  return (
    ENTERPRISE_EXPANSION_MODEL.length === 8 &&
    dimensions.has("multi-org") &&
    dimensions.has("multi-region") &&
    dimensions.has("account-growth") &&
    ENTERPRISE_EXPANSION_MODEL.every((e) => replicationIds.has(e.replicationRef)) &&
    ENTERPRISE_EXPANSION_MODEL.filter((e) => e.dimension === "multi-org").length >= 3 &&
    expansionIds.size >= 5
  );
}

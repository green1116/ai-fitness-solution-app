/**
 * V60 P13 — Technical debt registry
 */

export type DebtSeverity = "critical" | "high" | "medium" | "low";

export type TechnicalDebtItem = {
  id: string;
  title: string;
  category: string;
  severity: DebtSeverity;
  impact: string;
  recommendation: string;
  priority: number;
};

export type TechnicalDebtRegistry = {
  items: TechnicalDebtItem[];
  bySeverity: Record<DebtSeverity, number>;
  total: number;
};

const REGISTRY: TechnicalDebtItem[] = [
  {
    id: "td_analytics_memory",
    title: "Analytics stored in process memory",
    category: "Observability",
    severity: "high",
    impact: "Event history lost on restart; no cross-instance aggregation",
    recommendation: "Persist analytics to DB or external observability stack",
    priority: 1,
  },
  {
    id: "td_delivery_overlay",
    title: "V58 delivery overlay is in-memory",
    category: "Delivery",
    severity: "high",
    impact: "Registered deliveries and download counts not durable",
    recommendation: "Back delivery records with DocumentExport/Tender tables",
    priority: 2,
  },
  {
    id: "td_manager_role",
    title: "MANAGER role in portal matrix but not in frozen RBAC",
    category: "Permissions",
    severity: "medium",
    impact: "Executive dashboard access not enforced server-side by role",
    recommendation: "Add MANAGER to role.service with enforceRbacGuard on intelligence APIs",
    priority: 3,
  },
  {
    id: "td_org_column_env",
    title: "Project.organizationId may be missing in some DB environments",
    category: "Persistence",
    severity: "high",
    impact: "Org-scoped aggregation returns empty in misaligned environments",
    recommendation: "Run pending migrations; align schema with production",
    priority: 1,
  },
  {
    id: "td_readonly_cache",
    title: "Read-only cache is single-process",
    category: "Performance",
    severity: "low",
    impact: "Cache not shared across horizontal replicas",
    recommendation: "Use Redis for shared read cache in multi-instance deploy",
    priority: 5,
  },
  {
    id: "td_mock_auth",
    title: "ENABLE_MOCK_AUTH used in dev registration path",
    category: "Security",
    severity: "medium",
    impact: "Mock auth must be disabled in production",
    recommendation: "Gate mock-login behind NODE_ENV !== production",
    priority: 2,
  },
  {
    id: "td_executive_rbac",
    title: "Executive APIs lack role-based gate",
    category: "Security",
    severity: "medium",
    impact: "Any org member can access executive intelligence APIs",
    recommendation: "Apply MANAGER+ RBAC on /api/intelligence/executive",
    priority: 3,
  },
];

export function getTechnicalDebtRegistry(): TechnicalDebtRegistry {
  const bySeverity: Record<DebtSeverity, number> = {
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
  };
  for (const item of REGISTRY) bySeverity[item.severity]++;

  return {
    items: [...REGISTRY].sort((a, b) => a.priority - b.priority),
    bySeverity,
    total: REGISTRY.length,
  };
}

/**
 * V72 P1 — Intelligence catalog (declarative)
 */
import type { IntelligenceCatalogEntry, IntelligenceCatalogManifest } from "./intelligence.types";
import { V72_INTELLIGENCE_VERSION } from "./intelligence.types";

export const INTELLIGENCE_CATALOG: IntelligenceCatalogEntry[] = [
  {
    id: "INT-001",
    insight: "workflow-orchestration-baseline-health",
    signal: "orchestration-readiness-score",
    metric: "readinessScore",
    event: "workflow.signoff.closed",
    anomaly: false,
    trend: "stable",
    owner: "platform-engineering",
    status: "active",
    source: "v71-workflow-freeze-1",
    severity: "low",
    confidence: "high",
    required: true,
    description: "V71 workflow orchestration baseline health insight",
  },
  {
    id: "INT-002",
    insight: "dependency-graph-acyclic-status",
    signal: "workflow-dependency-acyclic",
    metric: "acyclic",
    event: "workflow.dependency.verified",
    anomaly: false,
    trend: "stable",
    owner: "release-engineering",
    status: "active",
    source: "v71-workflow-dependency-1",
    severity: "medium",
    confidence: "high",
    required: true,
    description: "Workflow dependency graph acyclic status insight",
  },
  {
    id: "INT-003",
    insight: "policy-gate-compliance-rate",
    signal: "workflow-policy-ready",
    metric: "policyReady",
    event: "workflow.policy.evaluated",
    anomaly: false,
    trend: "up",
    owner: "governance",
    status: "active",
    source: "v71-workflow-policy-1",
    severity: "medium",
    confidence: "high",
    required: true,
    description: "Workflow policy gate compliance rate insight",
  },
  {
    id: "INT-004",
    insight: "compatibility-matrix-coverage",
    signal: "compatibility-matrix-complete",
    metric: "matrixComplete",
    event: "workflow.compatibility.scanned",
    anomaly: false,
    trend: "stable",
    owner: "platform-engineering",
    status: "active",
    source: "v71-workflow-compatibility-1",
    severity: "low",
    confidence: "medium",
    required: true,
    description: "Workflow compatibility matrix coverage insight",
  },
  {
    id: "INT-005",
    insight: "governance-risk-escalation-watch",
    signal: "governance-risk-block",
    metric: "governanceReady",
    event: "workflow.governance.audited",
    anomaly: true,
    trend: "volatile",
    owner: "governance",
    status: "active",
    source: "v71-workflow-governance-1",
    severity: "high",
    confidence: "medium",
    required: true,
    description: "Workflow governance risk escalation watch insight",
  },
  {
    id: "INT-006",
    insight: "lifecycle-state-distribution",
    signal: "lifecycle-states-active",
    metric: "stateCount",
    event: "workflow.lifecycle.transition",
    anomaly: false,
    trend: "down",
    owner: "product-engineering",
    status: "active",
    source: "v71-workflow-lifecycle-1",
    severity: "low",
    confidence: "high",
    required: true,
    description: "Workflow lifecycle state distribution insight",
  },
  {
    id: "INT-007",
    insight: "compliance-checklist-pass-rate",
    signal: "compliance-checklist-pass",
    metric: "passedCount",
    event: "workflow.compliance.audited",
    anomaly: false,
    trend: "up",
    owner: "governance",
    status: "active",
    source: "v71-workflow-compliance-1",
    severity: "medium",
    confidence: "high",
    required: true,
    description: "Workflow compliance checklist pass rate insight",
  },
  {
    id: "INT-008",
    insight: "intelligence-foundation-catalog",
    signal: "intelligence-catalog-ready",
    metric: "catalogReady",
    event: "intelligence.catalog.init",
    anomaly: false,
    trend: "stable",
    owner: "platform-engineering",
    status: "draft",
    source: "v72-intelligence-catalog-1",
    severity: "low",
    confidence: "low",
    required: true,
    description: "V72 P1 operational intelligence foundation catalog entry",
  },
];

export function buildIntelligenceCatalogManifest(): IntelligenceCatalogManifest {
  const insights = INTELLIGENCE_CATALOG;
  const sources = new Set(insights.map((i) => i.source));
  const severities = new Set(insights.map((i) => i.severity));
  const catalogComplete =
    insights.length >= 6 && sources.size >= 4 && severities.size >= 3;

  return {
    version: V72_INTELLIGENCE_VERSION,
    entryCount: insights.length,
    sourceCount: sources.size,
    severityCount: severities.size,
    catalogComplete,
    insights,
    summary: [
      `intelligence-catalog count=${insights.length}`,
      `sources=${sources.size}`,
      `severities=${severities.size}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function getIntelligenceById(id: string): IntelligenceCatalogEntry | undefined {
  return INTELLIGENCE_CATALOG.find((i) => i.id === id);
}

export function getIntelligenceBySource(source: string): IntelligenceCatalogEntry[] {
  return INTELLIGENCE_CATALOG.filter((i) => i.source === source);
}

export function getIntelligenceBySeverity(
  severity: IntelligenceCatalogEntry["severity"],
): IntelligenceCatalogEntry[] {
  return INTELLIGENCE_CATALOG.filter((i) => i.severity === severity);
}

export function getIntelligenceWithAnomalies(): IntelligenceCatalogEntry[] {
  return INTELLIGENCE_CATALOG.filter((i) => i.anomaly);
}

/**
 * V68 P6 — Failure severity catalog (declarative, aligned with V67 alert tiers)
 */
import type { FailureSeverityEntry, FailureSeverityManifest } from "./governance.types";
import { V68_RELIABILITY_POLICY_VERSION } from "./governance.types";

export const FAILURE_SEVERITY_CATALOG: FailureSeverityEntry[] = [
  {
    id: "REL-FAIL-001",
    tier: "sev-0",
    label: "total_outage",
    alertSeverityRef: "P0",
    impactLevel: "critical",
    required: true,
    description: "Total service outage — maps to V67 P0",
  },
  {
    id: "REL-FAIL-002",
    tier: "sev-1",
    label: "major_degradation",
    alertSeverityRef: "P1",
    impactLevel: "high",
    required: true,
    description: "Major degradation — maps to V67 P1",
  },
  {
    id: "REL-FAIL-003",
    tier: "sev-2",
    label: "partial_impact",
    alertSeverityRef: "P2",
    impactLevel: "medium",
    required: true,
    description: "Partial impact — maps to V67 P2",
  },
  {
    id: "REL-FAIL-004",
    tier: "sev-3",
    label: "minor_incident",
    alertSeverityRef: "P3",
    impactLevel: "low",
    required: true,
    description: "Minor incident — maps to V67 P3",
  },
  {
    id: "REL-FAIL-005",
    tier: "sev-4",
    label: "informational",
    alertSeverityRef: "P4",
    impactLevel: "info",
    required: true,
    description: "Informational — maps to V67 P4",
  },
  {
    id: "REL-FAIL-006",
    tier: "sev-1",
    label: "slo_breach",
    alertSeverityRef: "P1",
    impactLevel: "high",
    required: true,
    description: "SLO breach classified as sev-1",
  },
  {
    id: "REL-FAIL-007",
    tier: "sev-0",
    label: "security_incident",
    alertSeverityRef: "P0",
    impactLevel: "critical",
    required: true,
    description: "Security incident classified as sev-0",
  },
  {
    id: "REL-FAIL-008",
    tier: "sev-2",
    label: "capacity_pressure",
    alertSeverityRef: "P2",
    impactLevel: "medium",
    required: true,
    description: "Capacity pressure — links CAP-RISK markers",
  },
];

export function buildFailureSeverityManifest(): FailureSeverityManifest {
  const severities = FAILURE_SEVERITY_CATALOG;
  const tiers = new Set(severities.map((s) => s.tier));
  const catalogComplete = severities.length >= 6 && tiers.size >= 4;

  return {
    version: V68_RELIABILITY_POLICY_VERSION,
    entryCount: severities.length,
    tierCount: tiers.size,
    catalogComplete,
    severities,
    summary: [
      `failure-severities count=${severities.length}`,
      `tiers=${tiers.size}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function getFailureSeverityById(id: string): FailureSeverityEntry | undefined {
  return FAILURE_SEVERITY_CATALOG.find((s) => s.id === id);
}

export function getFailureSeveritiesByTier(
  tier: FailureSeverityEntry["tier"],
): FailureSeverityEntry[] {
  return FAILURE_SEVERITY_CATALOG.filter((s) => s.tier === tier);
}

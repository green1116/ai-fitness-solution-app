/**
 * V67 P8 — Collect per-phase readiness (read-only)
 */
import { buildAlertTaxonomyReport } from "../alerting/taxonomy.builder";
import { buildMonitoringFoundationReport } from "../foundation.builder";
import { buildIncidentLifecycleReport } from "../incident/lifecycle.builder";
import { buildObservabilityDashboardReport } from "../observability/governance.builder";
import { buildOncallGovernanceReport } from "../oncall/governance.builder";
import { buildPostmortemFoundationReport } from "../postmortem/governance.builder";
import { buildSloGovernanceReport } from "../slo/governance.builder";

import type { MonitoringPhaseReadiness } from "./signoff.types";

export function collectMonitoringPhaseReadiness(deploymentId: string): MonitoringPhaseReadiness {
  return {
    p1: buildMonitoringFoundationReport({ deploymentId }).foundationReady,
    p2: buildIncidentLifecycleReport({ deploymentId }).lifecycleReady,
    p3: buildAlertTaxonomyReport({ deploymentId }).taxonomyReady,
    p4: buildSloGovernanceReport({ deploymentId }).governanceReady,
    p5: buildOncallGovernanceReport({ deploymentId }).governanceReady,
    p6: buildObservabilityDashboardReport({ deploymentId }).contractsReady,
    p7: buildPostmortemFoundationReport({ deploymentId }).foundationReady,
  };
}

/**
 * V3.7-H1 Production Hardening Foundation
 */

import { memoFoundation } from "../foundation-memo";
import { formatIncidentTaxonomySummary } from "./incident-taxonomy";
import { buildRuntimeHealthSnapshot, type RuntimeHealthSnapshot } from "./runtime-health";
import { buildReleaseReadinessReport, type ReleaseReadinessReport } from "./release-readiness";
import {
  buildDeploymentConfidenceReport,
  type DeploymentConfidenceReport,
} from "./deployment-confidence";
import {
  buildOperationalReadinessManifest,
  type OperationalReadinessManifest,
} from "./operational-readiness";

export {
  INCIDENT_TAXONOMY_VERSION,
  INCIDENT_SEVERITY_ORDER,
  INCIDENT_CLASSES,
  classifyIncident,
  resolveIncidentClass,
  formatIncidentTaxonomySummary,
  type IncidentSeverity,
  type IncidentOperationalImpact,
  type IncidentClass,
  type ClassifiedIncident,
} from "./incident-taxonomy";

export {
  RUNTIME_HEALTH_VERSION,
  buildRuntimeHealthSnapshot,
  type RuntimeHealthSnapshot,
  type HealthStatus,
  type VerificationHealth,
  type StabilityHealth,
  type FreezeIntegrity,
} from "./runtime-health";

export {
  RELEASE_READINESS_VERSION,
  buildReleaseReadinessReport,
  type ReleaseReadinessReport,
  type ReleaseRiskLevel,
} from "./release-readiness";

export {
  DEPLOYMENT_CONFIDENCE_VERSION,
  buildDeploymentConfidenceReport,
  type DeploymentConfidenceReport,
} from "./deployment-confidence";

export {
  OPERATIONAL_READINESS_VERSION,
  buildOperationalReadinessManifest,
  type OperationalReadinessManifest,
} from "./operational-readiness";

export const PRODUCTION_HARDENING_VERSION = "3.7-h1-foundation-1" as const;

export type ProductionHardeningFoundation = {
  version: typeof PRODUCTION_HARDENING_VERSION;
  foundationId: string;
  health: RuntimeHealthSnapshot;
  release: ReleaseReadinessReport;
  deployment: DeploymentConfidenceReport;
  operational: OperationalReadinessManifest;
  incidentTaxonomy: string;
  summary: string;
};

export function buildProductionHardeningFoundation(input?: {
  deploymentId?: string;
}): ProductionHardeningFoundation {
  const deploymentId = input?.deploymentId ?? "prod-default";
  return memoFoundation("production-hardening-foundation", deploymentId, () => {
    const foundationId = `PH-V37H1-${deploymentId.slice(0, 8)}`;
    const health = buildRuntimeHealthSnapshot({ deploymentId });
    const release = buildReleaseReadinessReport({ deploymentId });
    const deployment = buildDeploymentConfidenceReport({ deploymentId });
    const operational = buildOperationalReadinessManifest({ deploymentId });
    const incidentTaxonomy = formatIncidentTaxonomySummary();

    return {
      version: PRODUCTION_HARDENING_VERSION,
      foundationId,
      health,
      release,
      deployment,
      operational,
      incidentTaxonomy,
      summary: `production-hardening id=${foundationId} releasable=${release.releasable} deploymentReady=${deployment.deploymentReady} opsReady=${operational.opsReady}`,
    };
  });
}

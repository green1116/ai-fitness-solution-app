/**
 * V99 — Production readiness dashboard
 */

import {
  listCertificationActions,
  listCertificationPackages,
} from "./certification-cache";
import {
  buildArtifactLinks,
  buildAuditReferences,
  buildCertificationGates,
  buildReadinessSummary,
  buildRiskSummary,
} from "./readiness.service";
import type { ProductionReadinessDashboard } from "./readiness.types";
import { V99_PRODUCTION_READINESS_VERSION } from "./readiness.types";

export function buildProductionReadinessDashboard(
  organizationId: string,
): ProductionReadinessDashboard {
  const summary = buildReadinessSummary(organizationId);
  const gates = buildCertificationGates(organizationId);
  const risks = buildRiskSummary(organizationId);
  const artifacts = buildArtifactLinks(organizationId);

  return {
    version: V99_PRODUCTION_READINESS_VERSION,
    organizationId,
    generatedAt: new Date().toISOString(),
    summary,
    gates,
    risks,
    artifacts,
    packages: listCertificationPackages(organizationId),
    recentActions: listCertificationActions(organizationId).slice(0, 20),
    readOnly: true,
  };
}

export function buildCertificationPackageDetail(
  organizationId: string,
  packageId: string,
) {
  const pack = listCertificationPackages(organizationId).find((p) => p.id === packageId);
  if (!pack) throw new Error("PACKAGE_NOT_FOUND");

  return {
    pack,
    auditReferences: buildAuditReferences(organizationId),
    actionHistory: listCertificationActions(organizationId).filter(
      (a) => a.packageId === packageId,
    ),
    readOnly: true as const,
  };
}

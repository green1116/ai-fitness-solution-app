/**
 * V69 P8 — Collect per-phase readiness (read-only)
 */
import { buildArchitectureCatalogReport } from "../architecture-catalog/catalog.builder";
import { buildArchitectureComplianceReport } from "../architecture-compliance/compliance.builder";
import { buildArchitectureDependencyReport } from "../architecture-dependency/dependency.builder";
import { buildCodeGovernanceReport } from "../code-governance/governance.builder";
import { buildQualityGovernanceReport } from "../quality-governance/governance.builder";
import { buildSecurityGovernanceReport } from "../security-governance/governance.builder";
import { buildTechnicalStandardsReport } from "../technical-standards/standards.builder";

import type { TechnicalPhaseReadiness } from "./signoff.types";

export function collectTechnicalPhaseReadiness(deploymentId: string): TechnicalPhaseReadiness {
  return {
    p1: buildArchitectureCatalogReport({ deploymentId }).catalogReady,
    p2: buildArchitectureDependencyReport({ deploymentId }).dependencyReady,
    p3: buildCodeGovernanceReport({ deploymentId }).governanceReady,
    p4: buildTechnicalStandardsReport({ deploymentId }).standardsReady,
    p5: buildSecurityGovernanceReport({ deploymentId }).governanceReady,
    p6: buildQualityGovernanceReport({ deploymentId }).governanceReady,
    p7: buildArchitectureComplianceReport({ deploymentId }).complianceReady,
  };
}

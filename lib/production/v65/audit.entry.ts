/**
 * V65 P1 — Unified production readiness audit entry
 */
import { buildProductionReadinessReport, type ProductionAuditSignals } from "./audit.builder";
import type { ProductionReadinessReport } from "./audit.types";

export type { ProductionAuditSignals };

export function runProductionReadinessAudit(input?: {
  deploymentId?: string;
  signals?: ProductionAuditSignals;
}): ProductionReadinessReport {
  return buildProductionReadinessReport(input);
}

export function formatProductionReadinessSummary(
  report: ProductionReadinessReport,
): string {
  const lines = [
    `V65 Production Readiness Audit`,
    `  ready: ${report.productionReady}`,
    `  score: ${report.readinessScore}/100`,
    `  blockers: ${report.blockerCount}`,
    `  commercial frozen: ${report.repository.commercialLayerFrozen}`,
    `  tsc clean: ${report.repository.typeScriptClean}`,
    `  build pass: ${report.repository.buildPass}`,
    `  prisma preflight: ${report.repository.prismaPreflightPass}`,
  ];
  return lines.join("\n");
}

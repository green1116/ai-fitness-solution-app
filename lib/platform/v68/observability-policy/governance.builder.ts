/**
 * V68 P7 — Observability policy report builder (read-only)
 */
import { buildReliabilityPolicyReport } from "../reliability-policy/governance.builder";
import { V68_RELIABILITY_POLICY_VERSION } from "../reliability-policy/governance.types";

import { isObservabilityPolicyRefsAligned } from "./alignment.catalog";
import { buildAlertMappingManifest } from "./alert.mapping.catalog";
import type { ObservabilityPolicyReport, ObservabilityPolicySignals } from "./governance.types";
import { V68_OBSERVABILITY_POLICY_VERSION } from "./governance.types";
import { buildLogCatalogManifest } from "./log.catalog";
import { buildMetricCatalogManifest } from "./metric.catalog";
import { buildTraceCatalogManifest } from "./trace.catalog";

const DEFAULT_SIGNALS: ObservabilityPolicySignals = {
  reliabilityPolicyReady: true,
  metricCatalogComplete: true,
  logCatalogComplete: true,
  traceCatalogComplete: true,
  alertMappingComplete: true,
  refsAligned: true,
};

export function buildObservabilityPolicyReport(input?: {
  deploymentId?: string;
  signals?: ObservabilityPolicySignals;
}): ObservabilityPolicyReport {
  const deploymentId = input?.deploymentId ?? "v68-observability-policy-default";

  const reliability = buildReliabilityPolicyReport({ deploymentId });
  const metrics = buildMetricCatalogManifest();
  const logs = buildLogCatalogManifest();
  const traces = buildTraceCatalogManifest();
  const alertMappings = buildAlertMappingManifest();
  const refsAligned = isObservabilityPolicyRefsAligned();

  const signals: ObservabilityPolicySignals = {
    ...DEFAULT_SIGNALS,
    reliabilityPolicyReady: reliability.policyReady,
    metricCatalogComplete: metrics.catalogComplete,
    logCatalogComplete: logs.catalogComplete,
    traceCatalogComplete: traces.catalogComplete,
    alertMappingComplete: alertMappings.catalogComplete,
    refsAligned,
    ...input?.signals,
  };

  const policyReady =
    reliability.policyReady &&
    metrics.catalogComplete &&
    logs.catalogComplete &&
    traces.catalogComplete &&
    alertMappings.catalogComplete &&
    refsAligned &&
    signals.reliabilityPolicyReady !== false;

  return {
    version: V68_OBSERVABILITY_POLICY_VERSION,
    reportId: `observability-policy-${deploymentId}`,
    generatedAt: new Date().toISOString(),
    deploymentId,
    reliabilityPolicyVersion: V68_RELIABILITY_POLICY_VERSION,
    reliabilityPolicyReady: reliability.policyReady,
    metrics,
    logs,
    traces,
    alertMappings,
    policyReady,
    readinessScore: policyReady ? 100 : 0,
    summary: [
      `observability-policy ready=${policyReady}`,
      `metrics=${metrics.entryCount}`,
      `logs=${logs.entryCount}`,
      `traces=${traces.entryCount}`,
      `alertMappings=${alertMappings.entryCount}`,
      `refsAligned=${refsAligned}`,
    ].join(" "),
  };
}

export function assertObservabilityPolicyPass(
  report: ObservabilityPolicyReport,
): asserts report is ObservabilityPolicyReport & { policyReady: true } {
  if (!report.policyReady) {
    throw new Error(`V68 observability policy not ready: ${report.summary}`);
  }
}

/**
 * V68 P7 — Observability policy reference alignment (read-only)
 */
import { SERVICE_HEALTH_CATALOG } from "@/lib/monitoring/v67/observability/service.health.catalog";
import { METRIC_VIEW_CATALOG } from "@/lib/monitoring/v67/observability/metric.view.catalog";
import { SLO_TYPE_CATALOG } from "@/lib/monitoring/v67/slo/slo.types.catalog";

import { FAILURE_SEVERITY_CATALOG } from "../reliability-policy/failure.severity.catalog";
import { SERVICE_DEFINITION_CATALOG } from "../service-catalog/service.definition.catalog";

import { ALERT_MAPPING_CATALOG } from "./alert.mapping.catalog";
import { LOG_CATALOG } from "./log.catalog";
import { METRIC_CATALOG } from "./metric.catalog";
import { TRACE_CATALOG } from "./trace.catalog";

const VALID_ALERT_SEVERITY_REFS = new Set(["P0", "P1", "P2", "P3", "P4"]);

export function isObservabilityPolicyRefsAligned(): boolean {
  const serviceIds = new Set(SERVICE_DEFINITION_CATALOG.map((s) => s.id));
  const healthIds = new Set(SERVICE_HEALTH_CATALOG.map((h) => h.id));
  const sloIds = new Set(SLO_TYPE_CATALOG.map((s) => s.id));
  const metricViewIds = new Set(METRIC_VIEW_CATALOG.map((m) => m.id));
  const failureIds = new Set(FAILURE_SEVERITY_CATALOG.map((f) => f.id));
  const metricIds = new Set(METRIC_CATALOG.map((m) => m.id));
  const logIds = new Set(LOG_CATALOG.map((l) => l.id));
  const traceIds = new Set(TRACE_CATALOG.map((t) => t.id));

  const metricsAligned = METRIC_CATALOG.every(
    (m) =>
      serviceIds.has(m.serviceDefRef) &&
      healthIds.has(m.monitoringRef) &&
      (!m.sloRef || sloIds.has(m.sloRef)) &&
      (!m.metricViewRef || metricViewIds.has(m.metricViewRef)),
  );
  const logsAligned = LOG_CATALOG.every(
    (l) => serviceIds.has(l.serviceDefRef) && healthIds.has(l.monitoringRef),
  );
  const tracesAligned = TRACE_CATALOG.every(
    (t) => serviceIds.has(t.serviceDefRef) && healthIds.has(t.monitoringRef),
  );

  const mappingsAligned = ALERT_MAPPING_CATALOG.every((a) => {
    const sourceValid =
      (a.sourceKind === "metric" && metricIds.has(a.sourceRef)) ||
      (a.sourceKind === "log" && logIds.has(a.sourceRef)) ||
      (a.sourceKind === "trace" && traceIds.has(a.sourceRef));
    return (
      serviceIds.has(a.serviceDefRef) &&
      sourceValid &&
      failureIds.has(a.failureRef) &&
      VALID_ALERT_SEVERITY_REFS.has(a.alertSeverityRef)
    );
  });

  const coverageComplete =
    SERVICE_DEFINITION_CATALOG.filter((s) => s.tier === "critical").every(
      (s) =>
        METRIC_CATALOG.some((m) => m.serviceDefRef === s.id) &&
        LOG_CATALOG.some((l) => l.serviceDefRef === s.id) &&
        TRACE_CATALOG.some((t) => t.serviceDefRef === s.id) &&
        ALERT_MAPPING_CATALOG.some((a) => a.serviceDefRef === s.id),
    ) &&
    ALERT_MAPPING_CATALOG.length >= 6;

  return metricsAligned && logsAligned && tracesAligned && mappingsAligned && coverageComplete;
}

export function computeDeclarativeSamplingBudget(samplingRate: number): boolean {
  return samplingRate >= 0 && samplingRate <= 1;
}

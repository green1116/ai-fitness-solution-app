/** V80 CODE P4 — Governance & audit (integrity, entitlement trail) */
import { buildProductionArchitecture } from "@/lib/app/v80/production.builder";
import { buildCodeScaffold } from "@/lib/code/v80/scaffold.entry";
import { getRecentAuditEvents, recordAuditEvent } from "@/lib/observability/audit.logger";
import { getV80PersistenceMode } from "../runtime/store";
import { getV80MetricsSnapshot } from "./observability";
import { buildV80DeploymentBinding } from "./deployment.model";

export type V80AuditInput = {
  traceId: string;
  correlationId: string;
  endpoint: string;
  organizationId: string;
  action: "api.request" | "api.success" | "api.denied" | "api.error" | "feature.access";
  resultStatus: "success" | "denied" | "error";
  meta?: Record<string, unknown>;
};

export function recordV80Audit(input: V80AuditInput) {
  return recordAuditEvent({
    userId: "v80-system",
    organizationId: input.organizationId,
    endpoint: input.endpoint,
    action: input.action,
    resultStatus: input.resultStatus,
    traceId: input.traceId,
    meta: { correlationId: input.correlationId, layer: "v80-ops", ...input.meta },
  });
}

export function getV80AuditTrail(limit = 50) {
  return getRecentAuditEvents(limit).filter(
    (e) => e.endpoint.startsWith("/api/v80") || e.meta?.layer === "v80-ops",
  );
}

export async function runV80IntegrityCheck(deploymentId = "v80-release") {
  const scaffold = buildCodeScaffold({ deploymentId });
  const production = buildProductionArchitecture({ deploymentId });
  const binding = buildV80DeploymentBinding(deploymentId);
  const persistence = await getV80PersistenceMode();
  const metrics = getV80MetricsSnapshot();

  return {
    ok: scaffold.scaffoldReady && production.architectureReady,
    scaffoldReady: scaffold.scaffoldReady,
    productionReady: production.architectureReady,
    deploymentBinding: binding.deploymentId,
    persistence,
    drift: { detected: false },
    metricsEndpoints: Object.keys(metrics.endpoints).length,
    score: scaffold.scaffoldReady && production.architectureReady ? 100 : 0,
  };
}

export function recordEntitlementTrail(input: {
  traceId: string;
  correlationId: string;
  organizationId: string;
  endpoint: string;
  featureKey: string;
  allowed: boolean;
  usageAfter?: number;
  limit?: number;
}) {
  recordV80Audit({
    traceId: input.traceId,
    correlationId: input.correlationId,
    organizationId: input.organizationId,
    endpoint: input.endpoint,
    action: input.allowed ? "feature.access" : "api.denied",
    resultStatus: input.allowed ? "success" : "denied",
    meta: {
      featureKey: input.featureKey,
      usageAfter: input.usageAfter,
      limit: input.limit,
    },
  });
}

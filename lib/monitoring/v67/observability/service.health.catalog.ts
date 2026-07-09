/**
 * V67 P6 — Service health catalog (declarative)
 */
import { ALERT_TYPE_CATALOG } from "../alerting/alert.types.catalog";

import type { ServiceHealthDefinition, ServiceHealthManifest } from "./governance.types";
import { V67_OBSERVABILITY_DASHBOARD_VERSION } from "./governance.types";

export const SERVICE_HEALTH_CATALOG: ServiceHealthDefinition[] = [
  {
    id: "SH-001",
    serviceName: "production-api",
    category: "availability",
    healthProbeRef: "/api/production/health",
    sloRef: "SLOT-001",
    sliRef: "SLIT-001",
    alertTypeRef: "ATY-001",
    defaultStatus: "healthy",
    required: true,
    description: "Primary production API service health",
  },
  {
    id: "SH-002",
    serviceName: "health-probe",
    category: "operational",
    healthProbeRef: "/api/health",
    sloRef: "SLOT-004",
    sliRef: "SLIT-004",
    alertTypeRef: "ATY-002",
    defaultStatus: "healthy",
    required: true,
    description: "Application health probe endpoint",
  },
  {
    id: "SH-003",
    serviceName: "incident-lifecycle",
    category: "operational",
    healthProbeRef: "incident:lifecycle",
    sloRef: "SLOT-006",
    sliRef: "SLIT-006",
    alertTypeRef: "ATY-010",
    defaultStatus: "unknown",
    required: true,
    description: "Incident lifecycle state machine health",
  },
  {
    id: "SH-004",
    serviceName: "alert-routing",
    category: "operational",
    healthProbeRef: "alert:taxonomy",
    alertTypeRef: "ATY-011",
    defaultStatus: "degraded",
    required: true,
    description: "Alert taxonomy and routing pipeline health",
  },
  {
    id: "SH-005",
    serviceName: "oncall-response",
    category: "operational",
    healthProbeRef: "oncall:governance",
    alertTypeRef: "ATY-012",
    defaultStatus: "healthy",
    required: true,
    description: "On-call response and escalation pipeline",
  },
  {
    id: "SH-006",
    serviceName: "deployment-verify",
    category: "deployment",
    healthProbeRef: "verify:deployment",
    sloRef: "SLOT-005",
    sliRef: "SLIT-005",
    alertTypeRef: "ATY-007",
    defaultStatus: "healthy",
    required: true,
    description: "Deployment verify chain health",
  },
  {
    id: "SH-007",
    serviceName: "readiness-probe",
    category: "deployment",
    healthProbeRef: "/api/readiness",
    sloRef: "SLOT-004",
    sliRef: "SLIT-004",
    alertTypeRef: "ATY-002",
    defaultStatus: "healthy",
    required: true,
    description: "Kubernetes-style readiness probe surface",
  },
  {
    id: "SH-008",
    serviceName: "slo-monitoring",
    category: "slo",
    healthProbeRef: "slo:governance",
    sloRef: "SLOT-003",
    sliRef: "SLIT-003",
    alertTypeRef: "ATY-009",
    defaultStatus: "healthy",
    required: true,
    description: "SLO governance and error budget monitoring",
  },
];

export function buildServiceHealthManifest(): ServiceHealthManifest {
  const services = SERVICE_HEALTH_CATALOG;
  const statuses = new Set(services.map((s) => s.defaultStatus));
  const catalogComplete = services.length >= 6 && statuses.size >= 3;

  return {
    version: V67_OBSERVABILITY_DASHBOARD_VERSION,
    serviceCount: services.length,
    statusCount: statuses.size,
    catalogComplete,
    services,
    summary: [
      `service-health count=${services.length}`,
      `statuses=${statuses.size}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function getServiceHealthById(id: string): ServiceHealthDefinition | undefined {
  return SERVICE_HEALTH_CATALOG.find((s) => s.id === id);
}

export function getServiceHealthBySloRef(sloRef: string): ServiceHealthDefinition[] {
  return SERVICE_HEALTH_CATALOG.filter((s) => s.sloRef === sloRef);
}

export function isAlertTypeRefsAligned(): boolean {
  const alertIds = new Set(ALERT_TYPE_CATALOG.map((a) => a.id));
  return SERVICE_HEALTH_CATALOG.every((s) => !s.alertTypeRef || alertIds.has(s.alertTypeRef));
}

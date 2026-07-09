/**
 * V68 P1 — Service status catalog (declarative)
 */
import type { ServiceStatusEntry, ServiceStatusManifest } from "./catalog.types";
import { V68_SERVICE_CATALOG_VERSION } from "./catalog.types";

export const SERVICE_STATUS_CATALOG: ServiceStatusEntry[] = [
  {
    id: "SVC-STS-001",
    serviceDefRef: "SVC-DEF-001",
    statusKind: "operational",
    healthRef: "SH-001",
    declarativeState: "healthy",
    required: true,
    description: "Production API operational status",
  },
  {
    id: "SVC-STS-002",
    serviceDefRef: "SVC-DEF-002",
    statusKind: "operational",
    healthRef: "SH-002",
    declarativeState: "healthy",
    required: true,
    description: "Health probe operational status",
  },
  {
    id: "SVC-STS-003",
    serviceDefRef: "SVC-DEF-003",
    statusKind: "unknown",
    healthRef: "SH-003",
    declarativeState: "unknown",
    required: true,
    description: "Incident lifecycle status — event-driven",
  },
  {
    id: "SVC-STS-004",
    serviceDefRef: "SVC-DEF-004",
    statusKind: "degraded",
    healthRef: "SH-004",
    declarativeState: "degraded",
    required: true,
    description: "Alert routing degraded status template",
  },
  {
    id: "SVC-STS-005",
    serviceDefRef: "SVC-DEF-005",
    statusKind: "operational",
    healthRef: "SH-005",
    declarativeState: "healthy",
    required: true,
    description: "On-call response operational status",
  },
  {
    id: "SVC-STS-006",
    serviceDefRef: "SVC-DEF-006",
    statusKind: "operational",
    healthRef: "SH-006",
    declarativeState: "healthy",
    required: true,
    description: "Deployment verify operational status",
  },
  {
    id: "SVC-STS-007",
    serviceDefRef: "SVC-DEF-007",
    statusKind: "maintenance",
    healthRef: "SH-007",
    declarativeState: "maintenance",
    required: true,
    description: "Readiness probe maintenance window template",
  },
  {
    id: "SVC-STS-008",
    serviceDefRef: "SVC-DEF-008",
    statusKind: "operational",
    healthRef: "SH-008",
    declarativeState: "healthy",
    required: true,
    description: "SLO monitoring operational status",
  },
];

export function buildServiceStatusManifest(): ServiceStatusManifest {
  const statuses = SERVICE_STATUS_CATALOG;
  const statusKinds = new Set(statuses.map((s) => s.statusKind));
  const catalogComplete = statuses.length >= 6 && statusKinds.size >= 3;

  return {
    version: V68_SERVICE_CATALOG_VERSION,
    entryCount: statuses.length,
    statusKindCount: statusKinds.size,
    catalogComplete,
    statuses,
    summary: [
      `service-status count=${statuses.length}`,
      `kinds=${statusKinds.size}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function getStatusByServiceDefRef(serviceDefRef: string): ServiceStatusEntry | undefined {
  return SERVICE_STATUS_CATALOG.find((s) => s.serviceDefRef === serviceDefRef);
}

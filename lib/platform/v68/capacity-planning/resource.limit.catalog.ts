/**
 * V68 P5 — Resource limit catalog (declarative)
 */
import type { ResourceLimitEntry, ResourceLimitManifest } from "./governance.types";
import { V68_CAPACITY_PLANNING_VERSION } from "./governance.types";

export const RESOURCE_LIMIT_CATALOG: ResourceLimitEntry[] = [
  {
    id: "CAP-LIM-001",
    serviceDefRef: "SVC-DEF-001",
    resourceKind: "requests",
    maxValue: 3000,
    unit: "rps",
    hardLimit: true,
    required: true,
    description: "Production API hard request rate cap",
  },
  {
    id: "CAP-LIM-002",
    serviceDefRef: "SVC-DEF-002",
    resourceKind: "cpu",
    maxValue: 80,
    unit: "percent",
    hardLimit: false,
    required: true,
    description: "Health probe soft CPU cap",
  },
  {
    id: "CAP-LIM-003",
    serviceDefRef: "SVC-DEF-003",
    resourceKind: "connections",
    maxValue: 200,
    unit: "count",
    hardLimit: true,
    required: true,
    description: "Incident lifecycle connection hard cap",
  },
  {
    id: "CAP-LIM-004",
    serviceDefRef: "SVC-DEF-004",
    resourceKind: "requests",
    maxValue: 1500,
    unit: "rps",
    hardLimit: true,
    required: true,
    description: "Alert routing hard throughput cap",
  },
  {
    id: "CAP-LIM-005",
    serviceDefRef: "SVC-DEF-005",
    resourceKind: "connections",
    maxValue: 50,
    unit: "count",
    hardLimit: false,
    required: true,
    description: "On-call paging soft connection cap",
  },
  {
    id: "CAP-LIM-006",
    serviceDefRef: "SVC-DEF-006",
    resourceKind: "cpu",
    maxValue: 90,
    unit: "percent",
    hardLimit: true,
    required: true,
    description: "Deployment verify hard CPU cap",
  },
  {
    id: "CAP-LIM-007",
    serviceDefRef: "SVC-DEF-007",
    resourceKind: "memory",
    maxValue: 2048,
    unit: "gb",
    hardLimit: true,
    required: true,
    description: "Readiness probe hard memory cap",
  },
  {
    id: "CAP-LIM-008",
    serviceDefRef: "SVC-DEF-008",
    resourceKind: "storage",
    maxValue: 50,
    unit: "gb",
    hardLimit: true,
    required: true,
    description: "SLO metrics storage hard cap",
  },
];

export function buildResourceLimitManifest(): ResourceLimitManifest {
  const limits = RESOURCE_LIMIT_CATALOG;
  const resourceKinds = new Set(limits.map((l) => l.resourceKind));
  const catalogComplete = limits.length >= 6 && resourceKinds.size >= 4;

  return {
    version: V68_CAPACITY_PLANNING_VERSION,
    entryCount: limits.length,
    resourceKindCount: resourceKinds.size,
    catalogComplete,
    limits,
    summary: [
      `resource-limits count=${limits.length}`,
      `resourceKinds=${resourceKinds.size}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function getResourceLimitByServiceRef(serviceDefRef: string): ResourceLimitEntry[] {
  return RESOURCE_LIMIT_CATALOG.filter((l) => l.serviceDefRef === serviceDefRef);
}

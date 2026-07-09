/**
 * V68 P1 — Service definition catalog (declarative)
 */
import type { ServiceDefinition, ServiceDefinitionManifest } from "./catalog.types";
import { V68_SERVICE_CATALOG_VERSION } from "./catalog.types";

export const SERVICE_DEFINITION_CATALOG: ServiceDefinition[] = [
  {
    id: "SVC-DEF-001",
    name: "production-api",
    tier: "critical",
    lifecycle: "active",
    monitoringRef: "SH-001",
    required: true,
    description: "Primary production API — V67 observability SH-001",
  },
  {
    id: "SVC-DEF-002",
    name: "health-probe",
    tier: "standard",
    lifecycle: "active",
    monitoringRef: "SH-002",
    required: true,
    description: "Application health probe service",
  },
  {
    id: "SVC-DEF-003",
    name: "incident-lifecycle",
    tier: "internal",
    lifecycle: "active",
    monitoringRef: "SH-003",
    required: true,
    description: "Incident lifecycle state machine service",
  },
  {
    id: "SVC-DEF-004",
    name: "alert-routing",
    tier: "internal",
    lifecycle: "active",
    monitoringRef: "SH-004",
    required: true,
    description: "Alert taxonomy and routing pipeline",
  },
  {
    id: "SVC-DEF-005",
    name: "oncall-response",
    tier: "internal",
    lifecycle: "active",
    monitoringRef: "SH-005",
    required: true,
    description: "On-call response and escalation pipeline",
  },
  {
    id: "SVC-DEF-006",
    name: "deployment-verify",
    tier: "standard",
    lifecycle: "active",
    monitoringRef: "SH-006",
    required: true,
    description: "Deployment verify chain service",
  },
  {
    id: "SVC-DEF-007",
    name: "readiness-probe",
    tier: "standard",
    lifecycle: "active",
    monitoringRef: "SH-007",
    required: true,
    description: "Readiness probe surface",
  },
  {
    id: "SVC-DEF-008",
    name: "slo-monitoring",
    tier: "critical",
    lifecycle: "active",
    monitoringRef: "SH-008",
    required: true,
    description: "SLO governance and error budget monitoring",
  },
];

export function buildServiceDefinitionManifest(): ServiceDefinitionManifest {
  const definitions = SERVICE_DEFINITION_CATALOG;
  const tiers = new Set(definitions.map((d) => d.tier));
  const catalogComplete = definitions.length >= 6 && tiers.size >= 3;

  return {
    version: V68_SERVICE_CATALOG_VERSION,
    serviceCount: definitions.length,
    tierCount: tiers.size,
    catalogComplete,
    definitions,
    summary: [
      `service-definitions count=${definitions.length}`,
      `tiers=${tiers.size}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function getServiceDefinitionById(id: string): ServiceDefinition | undefined {
  return SERVICE_DEFINITION_CATALOG.find((d) => d.id === id);
}

export function getServiceDefinitionByMonitoringRef(ref: string): ServiceDefinition | undefined {
  return SERVICE_DEFINITION_CATALOG.find((d) => d.monitoringRef === ref);
}

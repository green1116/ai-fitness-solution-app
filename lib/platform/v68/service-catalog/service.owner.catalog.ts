/**
 * V68 P1 — Service owner catalog (declarative)
 */
import type { ServiceOwnerEntry, ServiceOwnerManifest } from "./catalog.types";
import { V68_SERVICE_CATALOG_VERSION } from "./catalog.types";

export const SERVICE_OWNER_CATALOG: ServiceOwnerEntry[] = [
  {
    id: "SVC-OWN-001",
    serviceDefRef: "SVC-DEF-001",
    ownerRole: "platform-oncall",
    team: "platform",
    oncallRef: "OC-001",
    required: true,
    description: "Production API owned by platform on-call",
  },
  {
    id: "SVC-OWN-002",
    serviceDefRef: "SVC-DEF-002",
    ownerRole: "monitoring-oncall",
    team: "platform",
    oncallRef: "OC-006",
    required: true,
    description: "Health probe owned by monitoring on-call",
  },
  {
    id: "SVC-OWN-003",
    serviceDefRef: "SVC-DEF-003",
    ownerRole: "incident-commander",
    team: "incident-response",
    oncallRef: "OC-008",
    required: true,
    description: "Incident lifecycle owned by incident commander",
  },
  {
    id: "SVC-OWN-004",
    serviceDefRef: "SVC-DEF-004",
    ownerRole: "monitoring-oncall",
    team: "platform",
    oncallRef: "OC-006",
    required: true,
    description: "Alert routing owned by monitoring on-call",
  },
  {
    id: "SVC-OWN-005",
    serviceDefRef: "SVC-DEF-005",
    ownerRole: "platform-oncall",
    team: "platform",
    oncallRef: "OC-001",
    required: true,
    description: "On-call response owned by platform on-call",
  },
  {
    id: "SVC-OWN-006",
    serviceDefRef: "SVC-DEF-006",
    ownerRole: "deployer-oncall",
    team: "release",
    oncallRef: "OC-002",
    required: true,
    description: "Deployment verify owned by deployer on-call",
  },
  {
    id: "SVC-OWN-007",
    serviceDefRef: "SVC-DEF-007",
    ownerRole: "deployer-oncall",
    team: "release",
    oncallRef: "OC-002",
    required: true,
    description: "Readiness probe owned by deployer on-call",
  },
  {
    id: "SVC-OWN-008",
    serviceDefRef: "SVC-DEF-008",
    ownerRole: "monitoring-oncall",
    team: "platform",
    oncallRef: "OC-006",
    required: true,
    description: "SLO monitoring owned by monitoring on-call",
  },
];

export function buildServiceOwnerManifest(): ServiceOwnerManifest {
  const owners = SERVICE_OWNER_CATALOG;
  const catalogComplete = owners.length >= 6;

  return {
    version: V68_SERVICE_CATALOG_VERSION,
    entryCount: owners.length,
    catalogComplete,
    owners,
    summary: [
      `service-owners count=${owners.length}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function getOwnerByServiceDefRef(serviceDefRef: string): ServiceOwnerEntry | undefined {
  return SERVICE_OWNER_CATALOG.find((o) => o.serviceDefRef === serviceDefRef);
}

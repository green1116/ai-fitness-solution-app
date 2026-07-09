/**
 * V68 P1 — Service metadata catalog (declarative)
 */
import type { ServiceMetadataEntry, ServiceMetadataManifest } from "./catalog.types";
import { V68_SERVICE_CATALOG_VERSION } from "./catalog.types";

export const SERVICE_METADATA_CATALOG: ServiceMetadataEntry[] = [
  {
    id: "SVC-META-001",
    serviceDefRef: "SVC-DEF-001",
    displayName: "Production API",
    tags: ["api", "production", "critical"],
    repository: "app/api",
    docsPath: "docs/monitoring/V67-OBSERVABILITY-DASHBOARD.md",
    dependencies: ["SVC-DEF-002", "SVC-DEF-008"],
    required: true,
    description: "Core production API metadata",
  },
  {
    id: "SVC-META-002",
    serviceDefRef: "SVC-DEF-002",
    displayName: "Health Probe",
    tags: ["health", "probe", "operational"],
    repository: "app/api/health",
    docsPath: "docs/deployment/V66-DEPLOYMENT-EXECUTION.md",
    dependencies: [],
    required: true,
    description: "Health probe endpoint metadata",
  },
  {
    id: "SVC-META-003",
    serviceDefRef: "SVC-DEF-003",
    displayName: "Incident Lifecycle",
    tags: ["incident", "lifecycle", "internal"],
    repository: "lib/monitoring/v67/incident",
    docsPath: "docs/monitoring/V67-INCIDENT-LIFECYCLE.md",
    dependencies: ["SVC-DEF-004"],
    required: true,
    description: "Incident state machine metadata",
  },
  {
    id: "SVC-META-004",
    serviceDefRef: "SVC-DEF-004",
    displayName: "Alert Routing",
    tags: ["alert", "routing", "taxonomy"],
    repository: "lib/monitoring/v67/alerting",
    docsPath: "docs/monitoring/V67-ALERT-TAXONOMY.md",
    dependencies: ["SVC-DEF-003"],
    required: true,
    description: "Alert taxonomy routing metadata",
  },
  {
    id: "SVC-META-005",
    serviceDefRef: "SVC-DEF-005",
    displayName: "On-call Response",
    tags: ["oncall", "escalation", "response"],
    repository: "lib/monitoring/v67/oncall",
    docsPath: "docs/monitoring/V67-ONCALL-GOVERNANCE.md",
    dependencies: ["SVC-DEF-004"],
    required: true,
    description: "On-call governance metadata",
  },
  {
    id: "SVC-META-006",
    serviceDefRef: "SVC-DEF-006",
    displayName: "Deployment Verify",
    tags: ["deployment", "verify", "release"],
    repository: "lib/deployment/v66",
    docsPath: "docs/deployment/V66-DEPLOYMENT-SIGNOFF.md",
    dependencies: ["SVC-DEF-002"],
    required: true,
    description: "Deployment verify chain metadata",
  },
  {
    id: "SVC-META-007",
    serviceDefRef: "SVC-DEF-007",
    displayName: "Readiness Probe",
    tags: ["readiness", "probe", "kubernetes"],
    repository: "app/api/readiness",
    docsPath: "docs/deployment/V66-DEPLOYMENT-EXECUTION.md",
    dependencies: ["SVC-DEF-002"],
    required: true,
    description: "Readiness probe metadata",
  },
  {
    id: "SVC-META-008",
    serviceDefRef: "SVC-DEF-008",
    displayName: "SLO Monitoring",
    tags: ["slo", "monitoring", "governance"],
    repository: "lib/monitoring/v67/slo",
    docsPath: "docs/monitoring/V67-SLO-GOVERNANCE.md",
    dependencies: ["SVC-DEF-001"],
    required: true,
    description: "SLO governance metadata",
  },
];

export function buildServiceMetadataManifest(): ServiceMetadataManifest {
  const metadata = SERVICE_METADATA_CATALOG;
  const catalogComplete = metadata.length >= 6;

  return {
    version: V68_SERVICE_CATALOG_VERSION,
    entryCount: metadata.length,
    catalogComplete,
    metadata,
    summary: [
      `service-metadata count=${metadata.length}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function getMetadataByServiceDefRef(serviceDefRef: string): ServiceMetadataEntry | undefined {
  return SERVICE_METADATA_CATALOG.find((m) => m.serviceDefRef === serviceDefRef);
}

/**
 * V67 P7 — Archive index catalog (declarative postmortem archival)
 */
import type { ArchiveIndexEntry, ArchiveIndexManifest } from "./governance.types";
import { V67_POSTMORTEM_FOUNDATION_VERSION } from "./governance.types";

export const ARCHIVE_INDEX_CATALOG: ArchiveIndexEntry[] = [
  {
    id: "ARC-001",
    status: "draft",
    postmortemStatus: "draft",
    reportTypeRef: "IRT-005",
    incidentIdPattern: "INC-{yyyy}-{seq}",
    retentionDays: 90,
    indexFields: ["incident-id", "severity", "created-at", "owner"],
    dashboardRef: "DBD-003",
    required: true,
    description: "Draft postmortem index for in-progress reviews",
  },
  {
    id: "ARC-002",
    status: "indexed",
    postmortemStatus: "draft",
    reportTypeRef: "IRT-002",
    incidentIdPattern: "INC-{yyyy}-{seq}",
    retentionDays: 180,
    indexFields: ["incident-id", "timeline", "mttr", "slo-impact"],
    dashboardRef: "DBD-003",
    required: true,
    description: "Indexed timeline reports searchable by incident",
  },
  {
    id: "ARC-003",
    status: "published",
    postmortemStatus: "published",
    reportTypeRef: "IRT-006",
    incidentIdPattern: "INC-{yyyy}-{seq}",
    retentionDays: 365,
    indexFields: ["incident-id", "rca-ref", "action-items", "published-at"],
    dashboardRef: "DBD-002",
    required: true,
    description: "Published SLO breach postmortems — 1 year retention",
  },
  {
    id: "ARC-004",
    status: "archived",
    postmortemStatus: "published",
    reportTypeRef: "IRT-008",
    incidentIdPattern: "INC-{yyyy}-{seq}",
    retentionDays: 730,
    indexFields: ["incident-id", "executive-summary", "lessons-learned"],
    dashboardRef: "DBD-004",
    required: true,
    description: "Major incident postmortem long-term archive",
  },
  {
    id: "ARC-005",
    status: "indexed",
    postmortemStatus: "pending",
    reportTypeRef: "IRT-001",
    incidentIdPattern: "INC-{yyyy}-{seq}",
    retentionDays: 180,
    indexFields: ["incident-id", "availability-impact", "duration"],
    dashboardRef: "DBD-001",
    required: true,
    description: "Availability incident summary index",
  },
  {
    id: "ARC-006",
    status: "published",
    postmortemStatus: "published",
    reportTypeRef: "IRT-004",
    incidentIdPattern: "INC-{yyyy}-{seq}",
    retentionDays: 365,
    indexFields: ["incident-id", "security-classification", "mitigation"],
    required: true,
    description: "Security incident postmortem archive",
  },
  {
    id: "ARC-007",
    status: "draft",
    postmortemStatus: "na",
    reportTypeRef: "IRT-007",
    incidentIdPattern: "INC-{yyyy}-{seq}",
    retentionDays: 30,
    indexFields: ["incident-id", "resolution"],
    required: true,
    description: "Low-severity manual incidents — short retention",
  },
  {
    id: "ARC-008",
    status: "archived",
    postmortemStatus: "published",
    reportTypeRef: "IRT-003",
    incidentIdPattern: "INC-{yyyy}-{seq}",
    retentionDays: 365,
    indexFields: ["incident-id", "error-rate", "customer-impact", "slo-ref"],
    dashboardRef: "DBD-001",
    required: true,
    description: "Error rate impact reports archive",
  },
];

export function buildArchiveIndexManifest(): ArchiveIndexManifest {
  const entries = ARCHIVE_INDEX_CATALOG;
  const statuses = new Set(entries.map((e) => e.status));
  const catalogComplete = entries.length >= 6 && statuses.size >= 3;

  return {
    version: V67_POSTMORTEM_FOUNDATION_VERSION,
    entryCount: entries.length,
    statusCount: statuses.size,
    catalogComplete,
    entries,
    summary: [
      `archive-index count=${entries.length}`,
      `statuses=${statuses.size}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function getArchiveByReportTypeRef(reportTypeRef: string): ArchiveIndexEntry[] {
  return ARCHIVE_INDEX_CATALOG.filter((e) => e.reportTypeRef === reportTypeRef);
}

export function getArchiveByStatus(status: ArchiveIndexEntry["status"]): ArchiveIndexEntry[] {
  return ARCHIVE_INDEX_CATALOG.filter((e) => e.status === status);
}

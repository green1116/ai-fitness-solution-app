/**
 * V67 P7 — Postmortem foundation types (read-only)
 */
import type { AlertSeverityTier } from "../alerting/taxonomy.types";
import type { IncidentType, PostmortemStatus } from "../incident/lifecycle.types";

export const V67_POSTMORTEM_FOUNDATION_VERSION = "v67-postmortem-foundation-1" as const;

export type ReportKind =
  | "incident_summary"
  | "timeline"
  | "impact"
  | "mitigation"
  | "postmortem_draft"
  | "postmortem_final";

export type RcaMethodKind =
  | "five_whys"
  | "fishbone"
  | "timeline"
  | "contributing_factors"
  | "declarative";

export type ActionItemKind = "preventive" | "corrective" | "detective" | "process";

export type ActionItemPriority = "P0" | "P1" | "P2" | "P3";

export type ArchiveStatus = "draft" | "indexed" | "published" | "archived";

export type PostmortemFoundationSignals = {
  observabilityReady?: boolean;
  reportTypesComplete?: boolean;
  rcaCatalogComplete?: boolean;
  actionItemComplete?: boolean;
  archiveIndexComplete?: boolean;
  lifecycleAligned?: boolean;
};

export type IncidentReportTypeDefinition = {
  id: string;
  kind: ReportKind;
  name: string;
  incidentType: IncidentType;
  severityRef: AlertSeverityTier;
  lifecycleTransitionRef?: string;
  eventRef?: string;
  dashboardRef?: string;
  requiredSections: string[];
  required: boolean;
  description: string;
};

export type IncidentReportTypeManifest = {
  version: typeof V67_POSTMORTEM_FOUNDATION_VERSION;
  typeCount: number;
  kindCount: number;
  catalogComplete: boolean;
  types: IncidentReportTypeDefinition[];
  summary: string;
};

export type RcaCatalogEntry = {
  id: string;
  method: RcaMethodKind;
  name: string;
  incidentType: IncidentType;
  rootCauseCategory: string;
  investigationSteps: string[];
  sloRef?: string;
  required: boolean;
  description: string;
};

export type RcaCatalogManifest = {
  version: typeof V67_POSTMORTEM_FOUNDATION_VERSION;
  entryCount: number;
  methodCount: number;
  catalogComplete: boolean;
  entries: RcaCatalogEntry[];
  summary: string;
};

export type ActionItemRule = {
  id: string;
  kind: ActionItemKind;
  priority: ActionItemPriority;
  name: string;
  rcaRef: string;
  ownerRole: string;
  dueDays: number;
  verificationCriteria: string;
  required: boolean;
  description: string;
};

export type ActionItemContractManifest = {
  version: typeof V67_POSTMORTEM_FOUNDATION_VERSION;
  ruleCount: number;
  kindCount: number;
  contractComplete: boolean;
  rules: ActionItemRule[];
  summary: string;
};

export type ArchiveIndexEntry = {
  id: string;
  status: ArchiveStatus;
  postmortemStatus: PostmortemStatus;
  reportTypeRef: string;
  incidentIdPattern: string;
  retentionDays: number;
  indexFields: string[];
  dashboardRef?: string;
  required: boolean;
  description: string;
};

export type ArchiveIndexManifest = {
  version: typeof V67_POSTMORTEM_FOUNDATION_VERSION;
  entryCount: number;
  statusCount: number;
  catalogComplete: boolean;
  entries: ArchiveIndexEntry[];
  summary: string;
};

export type PostmortemFoundationReport = {
  version: typeof V67_POSTMORTEM_FOUNDATION_VERSION;
  reportId: string;
  generatedAt: string;
  deploymentId: string;
  observabilityVersion: string;
  observabilityReady: boolean;
  reportTypes: IncidentReportTypeManifest;
  rcaCatalog: RcaCatalogManifest;
  actionItemContract: ActionItemContractManifest;
  archiveIndex: ArchiveIndexManifest;
  foundationReady: boolean;
  readinessScore: number;
  summary: string;
};

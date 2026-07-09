/**
 * V67 P7 — Incident report type catalog (declarative)
 */
import type { IncidentReportTypeDefinition, IncidentReportTypeManifest } from "./governance.types";
import { V67_POSTMORTEM_FOUNDATION_VERSION } from "./governance.types";

export const INCIDENT_REPORT_TYPE_CATALOG: IncidentReportTypeDefinition[] = [
  {
    id: "IRT-001",
    kind: "incident_summary",
    name: "availability_incident_summary",
    incidentType: "availability",
    severityRef: "P0",
    lifecycleTransitionRef: "TR-001",
    eventRef: "EVT-001",
    dashboardRef: "DBD-001",
    requiredSections: ["summary", "impact", "timeline", "mitigation"],
    required: true,
    description: "Availability incident executive summary report",
  },
  {
    id: "IRT-002",
    kind: "timeline",
    name: "incident_timeline_report",
    incidentType: "latency",
    severityRef: "P1",
    lifecycleTransitionRef: "TR-002",
    eventRef: "EVT-002",
    dashboardRef: "DBD-003",
    requiredSections: ["trigger", "ack", "mitigate", "resolve"],
    required: true,
    description: "Chronological incident timeline report",
  },
  {
    id: "IRT-003",
    kind: "impact",
    name: "error_rate_impact_report",
    incidentType: "error-rate",
    severityRef: "P1",
    lifecycleTransitionRef: "TR-005",
    eventRef: "EVT-003",
    dashboardRef: "DBD-001",
    requiredSections: ["customer-impact", "slo-impact", "duration"],
    required: true,
    description: "Error rate incident customer and SLO impact",
  },
  {
    id: "IRT-004",
    kind: "mitigation",
    name: "security_mitigation_report",
    incidentType: "security",
    severityRef: "P0",
    lifecycleTransitionRef: "TR-004",
    eventRef: "EVT-004",
    dashboardRef: "DBD-008",
    requiredSections: ["root-cause", "mitigation-steps", "verification"],
    required: true,
    description: "Security incident mitigation actions report",
  },
  {
    id: "IRT-005",
    kind: "postmortem_draft",
    name: "deployment_postmortem_draft",
    incidentType: "deployment",
    severityRef: "P0",
    lifecycleTransitionRef: "TR-008",
    eventRef: "EVT-005",
    dashboardRef: "DBD-006",
    requiredSections: ["summary", "timeline", "rca", "action-items"],
    required: true,
    description: "Deployment incident postmortem draft template",
  },
  {
    id: "IRT-006",
    kind: "postmortem_final",
    name: "slo_breach_postmortem_final",
    incidentType: "slo-breach",
    severityRef: "P1",
    lifecycleTransitionRef: "TR-009",
    eventRef: "EVT-006",
    dashboardRef: "DBD-002",
    requiredSections: ["summary", "rca", "action-items", "lessons-learned"],
    required: true,
    description: "SLO breach published postmortem template",
  },
  {
    id: "IRT-007",
    kind: "incident_summary",
    name: "manual_incident_summary",
    incidentType: "manual",
    severityRef: "P2",
    lifecycleTransitionRef: "TR-010",
    dashboardRef: "DBD-003",
    requiredSections: ["summary", "resolution"],
    required: true,
    description: "Manually triggered incident summary",
  },
  {
    id: "IRT-008",
    kind: "postmortem_final",
    name: "major_incident_postmortem",
    incidentType: "availability",
    severityRef: "P0",
    lifecycleTransitionRef: "TR-011",
    eventRef: "EVT-001",
    dashboardRef: "DBD-004",
    requiredSections: ["executive-summary", "timeline", "rca", "action-items", "follow-up"],
    required: true,
    description: "Major incident full postmortem with on-call review",
  },
];

export function buildIncidentReportTypeManifest(): IncidentReportTypeManifest {
  const types = INCIDENT_REPORT_TYPE_CATALOG;
  const kinds = new Set(types.map((t) => t.kind));
  const catalogComplete = types.length >= 6 && kinds.size >= 4;

  return {
    version: V67_POSTMORTEM_FOUNDATION_VERSION,
    typeCount: types.length,
    kindCount: kinds.size,
    catalogComplete,
    types,
    summary: [
      `report-types count=${types.length}`,
      `kinds=${kinds.size}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function getReportTypeById(id: string): IncidentReportTypeDefinition | undefined {
  return INCIDENT_REPORT_TYPE_CATALOG.find((t) => t.id === id);
}

export function getReportTypesByKind(
  kind: IncidentReportTypeDefinition["kind"],
): IncidentReportTypeDefinition[] {
  return INCIDENT_REPORT_TYPE_CATALOG.filter((t) => t.kind === kind);
}

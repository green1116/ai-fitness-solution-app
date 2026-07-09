/**
 * V67 P7 — RCA catalog (declarative root cause analysis methods)
 */
import type { RcaCatalogEntry, RcaCatalogManifest } from "./governance.types";
import { V67_POSTMORTEM_FOUNDATION_VERSION } from "./governance.types";

export const RCA_CATALOG: RcaCatalogEntry[] = [
  {
    id: "RCA-001",
    method: "five_whys",
    name: "availability_five_whys",
    incidentType: "availability",
    rootCauseCategory: "infrastructure",
    investigationSteps: [
      "why service unreachable",
      "why health probe failed",
      "why deployment regression",
      "why verify gate missed",
      "why monitoring gap",
    ],
    sloRef: "SLOT-001",
    required: true,
    description: "Five whys for availability incidents",
  },
  {
    id: "RCA-002",
    method: "timeline",
    name: "latency_timeline_rca",
    incidentType: "latency",
    rootCauseCategory: "performance",
    investigationSteps: [
      "identify latency spike start",
      "correlate deploy events",
      "check dependency latency",
      "validate rollback window",
    ],
    sloRef: "SLOT-002",
    required: true,
    description: "Timeline-based RCA for latency breaches",
  },
  {
    id: "RCA-003",
    method: "contributing_factors",
    name: "error_rate_contributing_factors",
    incidentType: "error-rate",
    rootCauseCategory: "application",
    investigationSteps: [
      "identify error class distribution",
      "map to recent code changes",
      "check config drift",
      "assess blast radius",
    ],
    sloRef: "SLOT-003",
    required: true,
    description: "Contributing factors analysis for error spikes",
  },
  {
    id: "RCA-004",
    method: "fishbone",
    name: "security_fishbone",
    incidentType: "security",
    rootCauseCategory: "security",
    investigationSteps: [
      "people: access control",
      "process: gate bypass",
      "technology: vulnerability",
      "environment: config exposure",
    ],
    required: true,
    description: "Fishbone diagram for security incidents",
  },
  {
    id: "RCA-005",
    method: "five_whys",
    name: "deployment_five_whys",
    incidentType: "deployment",
    rootCauseCategory: "process",
    investigationSteps: [
      "why verify failed",
      "why rollout continued",
      "why rollback delayed",
      "why runbook not followed",
      "why automation gap",
    ],
    sloRef: "SLOT-005",
    required: true,
    description: "Five whys for deployment incidents",
  },
  {
    id: "RCA-006",
    method: "contributing_factors",
    name: "slo_breach_contributing_factors",
    incidentType: "slo-breach",
    rootCauseCategory: "operational",
    investigationSteps: [
      "identify burn-rate spike",
      "map alert suppression",
      "check on-call response",
      "assess error budget consumption",
    ],
    sloRef: "SLOT-001",
    required: true,
    description: "SLO breach contributing factors RCA",
  },
  {
    id: "RCA-007",
    method: "declarative",
    name: "manual_incident_rca",
    incidentType: "manual",
    rootCauseCategory: "unknown",
    investigationSteps: ["document trigger", "identify scope", "determine resolution path"],
    required: true,
    description: "Lightweight RCA for manual incidents",
  },
  {
    id: "RCA-008",
    method: "timeline",
    name: "major_incident_timeline_rca",
    incidentType: "availability",
    rootCauseCategory: "systemic",
    investigationSteps: [
      "executive timeline",
      "escalation path review",
      "communication audit",
      "recovery point validation",
    ],
    sloRef: "SLOT-006",
    required: true,
    description: "Major incident full timeline RCA with MTTR review",
  },
];

export function buildRcaCatalogManifest(): RcaCatalogManifest {
  const entries = RCA_CATALOG;
  const methods = new Set(entries.map((e) => e.method));
  const catalogComplete = entries.length >= 6 && methods.size >= 4;

  return {
    version: V67_POSTMORTEM_FOUNDATION_VERSION,
    entryCount: entries.length,
    methodCount: methods.size,
    catalogComplete,
    entries,
    summary: [
      `rca-entries count=${entries.length}`,
      `methods=${methods.size}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function getRcaById(id: string): RcaCatalogEntry | undefined {
  return RCA_CATALOG.find((e) => e.id === id);
}

export function getRcaByIncidentType(incidentType: RcaCatalogEntry["incidentType"]): RcaCatalogEntry[] {
  return RCA_CATALOG.filter((e) => e.incidentType === incidentType);
}

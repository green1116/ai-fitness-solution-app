import type {
  Incident,
  IncidentAssessment,
  IncidentImpactAssessment,
  IncidentPriority,
  IncidentRiskAssessment,
  IncidentSeverity,
  UrgencyAssessment,
} from "./types";
import type { GovernanceIntelligenceRuntimeResult } from "../governance/intelligence/intelligence-types";

function buildImpactAssessment(incident: Incident, intelligence: GovernanceIntelligenceRuntimeResult): IncidentImpactAssessment {
  const base =
    incident.severity === "critical" ? 85 : incident.severity === "high" ? 65 : incident.severity === "medium" ? 45 : 25;
  return {
    assessmentId: `incident-impact-${incident.incidentId}`,
    incidentId: incident.incidentId,
    serviceImpact: incident.incidentType === "availability" ? base + 10 : base,
    userImpact: incident.incidentType === "security" || incident.incidentType === "compliance" ? base + 5 : base - 5,
    federationImpact: incident.incidentType === "dependency" || incident.incidentType === "recovery" ? base + 8 : base,
    overallImpact: Math.min(100, base + (incident.priority === "critical" ? 10 : 0)),
  };
}

function buildUrgencyAssessment(incident: Incident): UrgencyAssessment {
  const score =
    incident.priority === "critical" ? 95 : incident.priority === "high" ? 75 : incident.priority === "medium" ? 50 : 25;
  return {
    assessmentId: `incident-urgency-${incident.incidentId}`,
    incidentId: incident.incidentId,
    urgency: incident.priority,
    score,
    timeToActMinutes: incident.priority === "critical" ? 15 : incident.priority === "high" ? 60 : 240,
  };
}

function buildRiskAssessment(incident: Incident, intelligence: GovernanceIntelligenceRuntimeResult): IncidentRiskAssessment {
  const factors = [`type=${incident.incidentType}`, `source=${incident.source}`];
  if (intelligence.analysis.trendDirection === "degrading") factors.push("degrading-trend");
  if (intelligence.riskIntelligence.projectedRisk === "critical") factors.push("projected-critical-risk");

  return {
    assessmentId: `incident-risk-${incident.incidentId}`,
    incidentId: incident.incidentId,
    riskLevel: incident.severity,
    score:
      incident.severity === "critical" ? 90 : incident.severity === "high" ? 70 : incident.severity === "medium" ? 45 : 20,
    factors,
  };
}

export function assessIncidents(input: {
  deploymentId: string;
  incidents: Incident[];
  intelligence: GovernanceIntelligenceRuntimeResult;
}): IncidentAssessment[] {
  return input.incidents.map((incident) => {
    const impact = buildImpactAssessment(incident, input.intelligence);
    const urgency = buildUrgencyAssessment(incident);
    const risk = buildRiskAssessment(incident, input.intelligence);

    const compositeScore = Math.round((urgency.score + (100 - impact.overallImpact) + (100 - risk.score)) / 3);
    const responseReady =
      incident.severity !== "critical" ||
      (input.intelligence.recommendations.length > 0 && risk.score < 95);

    return {
      assessmentId: `incident-assessment-${incident.incidentId}`,
      incidentId: incident.incidentId,
      impact,
      urgency,
      risk,
      compositeScore,
      responseReady,
    };
  });
}

export function overallIncidentSeverity(assessments: IncidentAssessment[]): IncidentSeverity {
  if (assessments.some((a) => a.risk.riskLevel === "critical")) return "critical";
  if (assessments.some((a) => a.risk.riskLevel === "high")) return "high";
  if (assessments.some((a) => a.risk.riskLevel === "medium")) return "medium";
  return "low";
}

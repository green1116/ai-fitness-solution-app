import type {
  Incident,
  IncidentClassification,
  IncidentPriority,
  IncidentSeverity,
  IncidentType,
} from "./types";
import type { GovernanceIntelligenceRuntimeResult } from "../governance/intelligence/intelligence-types";
import type { OperationalAutonomousExecutionRuntimeResult } from "../execution/types";
import type { AutonomousChangeManagementRuntimeResult } from "../change/types";

const CATEGORY_LABELS: Record<IncidentType, string> = {
  availability: "Availability Incident",
  performance: "Performance Incident",
  security: "Security Incident",
  compliance: "Compliance Incident",
  execution: "Execution Incident",
  change: "Change Incident",
  dependency: "Dependency Incident",
  recovery: "Recovery Incident",
};

function anomalyToIncidentType(category: string): IncidentType {
  if (category === "consensus_instability" || category === "federation_fragmentation") return "availability";
  if (category === "propagation_degradation") return "dependency";
  if (category === "lifecycle_abnormality") return "change";
  if (category === "recovery_failure_trend") return "recovery";
  return "performance";
}

function severityFromGovernance(severity: string): IncidentSeverity {
  if (severity === "critical") return "critical";
  if (severity === "high") return "high";
  if (severity === "medium") return "medium";
  return "low";
}

function priorityFromSeverity(severity: IncidentSeverity): IncidentPriority {
  return severity;
}

export function discoverIncidents(input: {
  deploymentId: string;
  intelligence: GovernanceIntelligenceRuntimeResult;
  execution?: OperationalAutonomousExecutionRuntimeResult;
  change?: AutonomousChangeManagementRuntimeResult;
}): Incident[] {
  const incidents: Incident[] = input.intelligence.anomalies.map((anomaly) => {
    const incidentType = anomalyToIncidentType(anomaly.category);
    const severity = severityFromGovernance(anomaly.severity);

    return {
      incidentId: `incident-${anomaly.anomalyId}`,
      title: anomaly.category.replace(/_/g, "-"),
      description: anomaly.description,
      incidentType,
      severity,
      priority: priorityFromSeverity(severity),
      status: "open",
      owner: severity === "critical" ? "incident-commander" : "autonomous-agent",
      source: "intelligence",
      detectedAt: anomaly.detectedAt,
      sourceAnomalyId: anomaly.anomalyId,
    };
  });

  if (input.execution && input.execution.metrics.failures > 0) {
    incidents.push({
      incidentId: `incident-execution-failure-${input.deploymentId}`,
      title: "execution-failure",
      description: `execution failures=${input.execution.metrics.failures}`,
      incidentType: "execution",
      severity: "high",
      priority: "high",
      status: "open",
      owner: "autonomous-agent",
      source: "execution",
      detectedAt: new Date().toISOString(),
    });
  }

  if (input.change && input.change.metrics.rejected > 0) {
    incidents.push({
      incidentId: `incident-change-rejection-${input.deploymentId}`,
      title: "change-rejection",
      description: `rejected changes=${input.change.metrics.rejected}`,
      incidentType: "change",
      severity: "medium",
      priority: "medium",
      status: "open",
      owner: "operator",
      source: "change",
      detectedAt: new Date().toISOString(),
    });
  }

  if (input.intelligence.riskIntelligence.projectedRisk === "critical") {
    incidents.push({
      incidentId: `incident-risk-critical-${input.deploymentId}`,
      title: "projected-critical-risk",
      description: `projectedRisk=${input.intelligence.riskIntelligence.projectedRisk}`,
      incidentType: "compliance",
      severity: "critical",
      priority: "critical",
      status: "open",
      owner: "incident-commander",
      source: "governance",
      detectedAt: new Date().toISOString(),
    });
  }

  return incidents.slice(0, 10);
}

export function classifyIncidents(input: {
  deploymentId: string;
  incidents: Incident[];
}): IncidentClassification[] {
  return input.incidents.map((incident) => ({
    classificationId: `incident-classification-${incident.incidentId}`,
    incidentId: incident.incidentId,
    incidentType: incident.incidentType,
    category: CATEGORY_LABELS[incident.incidentType],
    tags: [incident.source, incident.severity, incident.priority],
  }));
}

export { CATEGORY_LABELS, anomalyToIncidentType };

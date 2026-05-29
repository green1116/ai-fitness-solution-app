import type {
  RecoveryClassification,
  RecoveryPriority,
  RecoveryRequest,
  RecoverySeverity,
  RecoveryType,
} from "./types";
import type { GovernanceAutonomousRuntimeResult } from "../governance/autonomous/autonomous-types";
import type { GovernanceIntelligenceRuntimeResult } from "../governance/intelligence/intelligence-types";
import type { OperationalAutonomousExecutionRuntimeResult } from "../execution/types";
import type { AutonomousChangeManagementRuntimeResult } from "../change/types";
import type { AutonomousIncidentManagementRuntimeResult } from "../incident/types";

const RECOVERY_CATEGORY_LABELS: Record<RecoveryType, string> = {
  execution: "Execution Recovery",
  change: "Change Recovery",
  incident: "Incident Recovery",
  dependency: "Dependency Recovery",
  configuration: "Configuration Recovery",
  policy: "Policy Recovery",
  version: "Version Recovery",
  service: "Service Recovery",
};

function incidentTypeToRecoveryType(incidentType: string): RecoveryType {
  if (incidentType === "execution") return "execution";
  if (incidentType === "change") return "change";
  if (incidentType === "dependency") return "dependency";
  if (incidentType === "compliance" || incidentType === "security") return "policy";
  if (incidentType === "recovery") return "service";
  if (incidentType === "availability" || incidentType === "performance") return "service";
  return "configuration";
}

function severityFromString(severity: string): RecoverySeverity {
  if (severity === "critical") return "critical";
  if (severity === "high") return "high";
  if (severity === "medium") return "medium";
  return "low";
}

export function discoverRecoveryRequests(input: {
  deploymentId: string;
  intelligence: GovernanceIntelligenceRuntimeResult;
  autonomous: GovernanceAutonomousRuntimeResult;
  execution?: OperationalAutonomousExecutionRuntimeResult;
  change?: AutonomousChangeManagementRuntimeResult;
  incident?: AutonomousIncidentManagementRuntimeResult;
}): RecoveryRequest[] {
  const requests: RecoveryRequest[] = [];

  if (input.incident) {
    for (const incident of input.incident.incidents.filter((i) => i.severity !== "low")) {
      requests.push({
        requestId: `recovery-from-incident-${incident.incidentId}`,
        title: `recover-${incident.title}`,
        description: incident.description,
        recoveryType: incidentTypeToRecoveryType(incident.incidentType),
        severity: severityFromString(incident.severity),
        priority: severityFromString(incident.priority),
        status: "requested",
        owner: incident.severity === "critical" ? "recovery-lead" : "autonomous-agent",
        source: "incident",
        detectedAt: incident.detectedAt,
        sourceIncidentId: incident.incidentId,
      });
    }
  }

  for (const remediation of input.autonomous.remediations.filter((r) => r.priority !== "low")) {
    requests.push({
      requestId: `recovery-remediation-${remediation.remediationId}`,
      title: remediation.action,
      description: `category=${remediation.category}`,
      recoveryType: remediation.category === "recovery" ? "service" : "dependency",
      severity: remediation.priority === "urgent" ? "critical" : "high",
      priority: remediation.priority === "urgent" ? "critical" : "high",
      status: "requested",
      owner: "autonomous-agent",
      source: "governance",
      detectedAt: new Date().toISOString(),
    });
  }

  if (input.execution && (input.execution.status === "failed" || input.execution.metrics.failures > 0)) {
    requests.push({
      requestId: `recovery-execution-${input.deploymentId}`,
      title: "execution-recovery",
      description: `execution status=${input.execution.status}`,
      recoveryType: "execution",
      severity: "high",
      priority: "high",
      status: "requested",
      owner: "autonomous-agent",
      source: "execution",
      detectedAt: new Date().toISOString(),
    });
  }

  if (input.change && input.change.metrics.rejected > 0) {
    requests.push({
      requestId: `recovery-change-${input.deploymentId}`,
      title: "change-recovery",
      description: `rejected=${input.change.metrics.rejected}`,
      recoveryType: "change",
      severity: "medium",
      priority: "medium",
      status: "requested",
      owner: "operator",
      source: "change",
      detectedAt: new Date().toISOString(),
    });
  }

  if (input.intelligence.recommendations.some((r) => r.category === "recovery")) {
    const rec = input.intelligence.recommendations.find((r) => r.category === "recovery")!;
    requests.push({
      requestId: `recovery-recommendation-${rec.recommendationId}`,
      title: rec.action,
      description: rec.rationale,
      recoveryType: "service",
      severity: rec.priority === "urgent" ? "critical" : "high",
      priority: rec.priority === "urgent" ? "critical" : "medium",
      status: "requested",
      owner: "recovery-lead",
      source: "intelligence",
      detectedAt: new Date().toISOString(),
    });
  }

  return requests.slice(0, 10);
}

export function classifyRecoveryRequests(input: {
  deploymentId: string;
  requests: RecoveryRequest[];
}): RecoveryClassification[] {
  return input.requests.map((request) => ({
    classificationId: `recovery-classification-${request.requestId}`,
    requestId: request.requestId,
    recoveryType: request.recoveryType,
    category: RECOVERY_CATEGORY_LABELS[request.recoveryType],
    tags: [request.source, request.severity, request.priority],
  }));
}

export { RECOVERY_CATEGORY_LABELS, incidentTypeToRecoveryType };

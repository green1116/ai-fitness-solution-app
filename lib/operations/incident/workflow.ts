import type {
  Incident,
  IncidentStatus,
  ResponseAction,
  ResponseDependency,
  ResponsePlan,
  ResponseStage,
} from "./types";
import type { EscalationDecision } from "./types";
import type { GovernanceIntelligenceRuntimeResult } from "../governance/intelligence/intelligence-types";

export function buildIncidentResponsePlans(input: {
  deploymentId: string;
  incidents: Incident[];
  escalations: EscalationDecision[];
  intelligence: GovernanceIntelligenceRuntimeResult;
}): ResponsePlan[] {
  return input.incidents
    .filter((incident) => {
      const escalation = input.escalations.find((e) => e.incidentId === incident.incidentId);
      return escalation?.escalated || incident.severity !== "low";
    })
    .map((incident) => {
      const recommendation = input.intelligence.recommendations.find(
        (r) => r.category === "recovery" || r.category === "risk_mitigation",
      );

      const stages: ResponseStage[] = [
        {
          stageId: `response-contain-${incident.incidentId}`,
          order: 1,
          name: "contain",
          action: `contain-${incident.incidentType}`,
          status: "responding",
        },
        {
          stageId: `response-diagnose-${incident.incidentId}`,
          order: 2,
          name: "diagnose",
          action: `diagnose-${incident.incidentType}`,
          status: "investigating",
        },
        {
          stageId: `response-remediate-${incident.incidentId}`,
          order: 3,
          name: "remediate",
          action: recommendation?.action ?? `remediate-${incident.incidentType}`,
          status: "responding",
        },
        {
          stageId: `response-verify-${incident.incidentId}`,
          order: 4,
          name: "verify",
          action: `verify-${incident.incidentType}`,
          status: "open",
        },
      ];

      const actions: ResponseAction[] = stages.map((stage) => ({
        actionId: `action-${stage.stageId}`,
        stageId: stage.stageId,
        name: stage.action,
        category:
          stage.name === "contain"
            ? "contain"
            : stage.name === "diagnose"
              ? "diagnose"
              : stage.name === "remediate"
                ? "remediate"
                : "verify",
      }));

      const dependencies: ResponseDependency[] = [
        {
          dependencyId: `dep-contain-diagnose-${incident.incidentId}`,
          fromStageId: stages[0]!.stageId,
          toStageId: stages[1]!.stageId,
          relation: "requires",
        },
        {
          dependencyId: `dep-diagnose-remediate-${incident.incidentId}`,
          fromStageId: stages[1]!.stageId,
          toStageId: stages[2]!.stageId,
          relation: "requires",
        },
        {
          dependencyId: `dep-remediate-verify-${incident.incidentId}`,
          fromStageId: stages[2]!.stageId,
          toStageId: stages[3]!.stageId,
          relation: "requires",
        },
      ];

      return {
        planId: `response-plan-${incident.incidentId}`,
        incidentId: incident.incidentId,
        stages,
        actions,
        dependencies,
        sequence: stages.map((s) => s.order),
      };
    });
}

export function resolveIncidentStatus(input: {
  incidents: Incident[];
  responsePlans: ResponsePlan[];
  executionStatus?: string;
}): IncidentStatus {
  if (input.incidents.length === 0) return "closed";
  if (input.executionStatus === "failed") return "failed";
  if (input.responsePlans.length > 0) return "responding";
  if (input.incidents.some((i) => i.severity === "critical")) return "escalated";
  return "investigating";
}

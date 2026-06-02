import type { AutonomousIncidentManagementRuntimeResult } from "../../incident/types";
import type { CommandExecutionPlan, IncidentDispatch } from "./types";

export function dispatchIncident(input: {
  deploymentId: string;
  plan: CommandExecutionPlan;
  incident: AutonomousIncidentManagementRuntimeResult;
}): IncidentDispatch[] {
  const targets = input.plan.targets.filter((t) => t.domain === "incident");
  if (targets.length === 0) return [];

  const inc = input.incident.incidents[0];
  const responsePlan = input.incident.responsePlans[0];
  const runtimeId = input.incident.registry.incidentManagementId;

  return targets.map((target) => {
    const canDispatch = input.incident.flags.workflow && !!inc;

    return {
      dispatchId: `incident-dispatch-${target.intentId}-${target.targetId}`,
      intentId: target.intentId,
      planId: input.plan.planId,
      runtimeId,
      incidentRef: inc?.incidentId ?? "none",
      responsePlanRef: responsePlan?.planId ?? "none",
      status: canDispatch ? "dispatched" : "skipped",
      outcome: canDispatch
        ? `incidentStatus=${input.incident.status} open=${input.incident.incidents.filter((i) => i.status !== "resolved").length}`
        : "skipped-no-incident",
    } as IncidentDispatch;
  });
}

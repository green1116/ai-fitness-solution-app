/**
 * E07-P4 — Workforce Orchestration Planner
 * Composes ordered role-deploy plans from orchestration definitions
 */

import { getRoleById } from "../marketplace/role.registry";
import { assertOrchestrationDefinition } from "./orchestration.registry";
import type {
  OrchestrationDefinition,
  OrchestrationPlan,
  OrchestrationPlanStep,
} from "./orchestration.types";

export function planOrchestration(
  orchestration: OrchestrationDefinition,
): OrchestrationPlan {
  assertOrchestrationDefinition(orchestration);

  const steps: OrchestrationPlanStep[] = orchestration.roleIds.map(
    (roleId, index) => {
      const role = getRoleById(roleId);
      if (!role) {
        throw new Error(`unknown role ${roleId} on ${orchestration.id}`);
      }
      return {
        id: `${orchestration.id}.step-${index + 1}`,
        order: index + 1,
        roleId: role.id,
        roleCategory: role.category,
        employeeId: role.employeeId,
        title: role.title,
        detail: `${role.description} → employee ${role.employeeId}`,
        readOnly: true,
      };
    },
  );

  const narrative = [
    `${orchestration.name} plans ${steps.length} role deployments`,
    `for goal "${orchestration.goal}"`,
    `(${steps.map((s) => s.roleCategory).join(" → ")})`,
  ].join(" ");

  return {
    orchestrationId: orchestration.id,
    kind: orchestration.kind,
    goal: orchestration.goal,
    stepCount: steps.length,
    steps: Object.freeze([...steps]) as OrchestrationPlanStep[],
    narrative,
    readOnly: true,
  };
}

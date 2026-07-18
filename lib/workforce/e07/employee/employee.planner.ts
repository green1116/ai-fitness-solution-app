/**
 * E07-P2 — AI Employee Task Planner
 * Composes ordered task plans from employee duty definitions
 */

import { getWorkerById } from "../core/workforce.registry";
import { getSkillById } from "../skill/skill.registry";
import { assertEmployeeDefinition } from "./employee.registry";
import type {
  EmployeeDefinition,
  EmployeeTaskPlan,
  EmployeeTaskPlanStep,
} from "./employee.types";

export function planEmployeeTasks(
  employee: EmployeeDefinition,
): EmployeeTaskPlan {
  assertEmployeeDefinition(employee);

  const steps: EmployeeTaskPlanStep[] = employee.tasks.map((task, index) => {
    const worker = getWorkerById(task.workerId);
    const skill = getSkillById(task.skillId);
    if (!worker || !skill) {
      throw new Error(
        `unresolved task binding on ${employee.id}: ${task.workerId}/${task.skillId}`,
      );
    }
    return {
      id: `${employee.id}.task-${index + 1}`,
      order: index + 1,
      workerId: worker.id,
      workerRole: worker.role,
      skillId: skill.id,
      skillKind: skill.kind,
      objective: task.objective,
      title: `${worker.name} · ${skill.name}`,
      readOnly: true,
    };
  });

  const narrative = [
    `${employee.jobTitle} plans ${steps.length} tasks`,
    `(${steps.map((s) => `${s.workerRole}:${s.skillKind}`).join(" → ")})`,
  ].join(" ");

  return {
    employeeId: employee.id,
    jobKind: employee.jobKind,
    taskCount: steps.length,
    steps: Object.freeze([...steps]) as EmployeeTaskPlanStep[],
    narrative,
    readOnly: true,
  };
}

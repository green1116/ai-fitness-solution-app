/**
 * E07-P2 — AI Employee Registry
 * Employees bind ordered worker task assignments to job kinds
 */

import { getWorkerById } from "../core/workforce.registry";
import { getSkillById } from "../skill/skill.registry";
import {
  E07_EMPLOYEE_BASE,
  E07_EMPLOYEE_FREEZE_VERSION,
  E07_EMPLOYEE_RUNTIME_ID,
  E07_EMPLOYEE_VERSION,
  EMPLOYEE_JOB_KINDS,
} from "./employee.constants";
import type {
  EmployeeDefinition,
  EmployeeJobKind,
  EmployeeRegistryManifest,
} from "./employee.types";

export const EMPLOYEE_CATALOG: EmployeeDefinition[] = [
  {
    id: "e07.employee.bid-specialist",
    name: "Bid Specialist",
    jobKind: "specialist",
    jobTitle: "AI Bidding Specialist",
    description: "Senses opportunities, analyzes pricing, verifies compliance",
    tasks: [
      {
        workerId: "e07.worker.observer",
        skillId: "e07.skill.sense",
        objective: "Sense tender opportunity signals",
        readOnly: true,
      },
      {
        workerId: "e07.worker.analyst",
        skillId: "e07.skill.analyze",
        objective: "Analyze pricing posture",
        readOnly: true,
      },
      {
        workerId: "e07.worker.auditor",
        skillId: "e07.skill.verify",
        objective: "Verify compliance readiness",
        readOnly: true,
      },
    ],
    optional: false,
    readOnly: true,
  },
  {
    id: "e07.employee.risk-officer",
    name: "Risk Officer",
    jobKind: "supervisor",
    jobTitle: "AI Risk Officer",
    description: "Observes signals, executes mitigations, audits outcomes",
    tasks: [
      {
        workerId: "e07.worker.observer",
        skillId: "e07.skill.analyze",
        objective: "Observe risk-bearing signals",
        readOnly: true,
      },
      {
        workerId: "e07.worker.executor",
        skillId: "e07.skill.execute",
        objective: "Execute risk mitigation",
        readOnly: true,
      },
      {
        workerId: "e07.worker.auditor",
        skillId: "e07.skill.report",
        objective: "Report audited risk posture",
        readOnly: true,
      },
    ],
    optional: false,
    readOnly: true,
  },
  {
    id: "e07.employee.delivery-manager",
    name: "Delivery Manager",
    jobKind: "manager",
    jobTitle: "AI Delivery Manager",
    description: "Escalates delivery posture and coordinates the workforce",
    tasks: [
      {
        workerId: "e07.worker.executor",
        skillId: "e07.skill.sense",
        objective: "Sense delivery risk pressure",
        readOnly: true,
      },
      {
        workerId: "e07.worker.escalator",
        skillId: "e07.skill.report",
        objective: "Report delivery escalation",
        readOnly: true,
      },
      {
        workerId: "e07.worker.orchestrator",
        skillId: "e07.skill.coordinate",
        objective: "Coordinate workforce synthesis",
        readOnly: true,
      },
    ],
    optional: false,
    readOnly: true,
  },
];

export function assertEmployeeDefinition(employee: EmployeeDefinition): void {
  if (!employee.id.trim()) throw new Error("employee.id is required");
  if (!employee.name.trim()) throw new Error("employee.name is required");
  if (!(EMPLOYEE_JOB_KINDS as readonly string[]).includes(employee.jobKind)) {
    throw new Error(`invalid job kind: ${employee.jobKind}`);
  }
  if (employee.readOnly !== true) throw new Error("readOnly must be true");
  if (employee.tasks.length === 0) {
    throw new Error(`employee ${employee.id} requires tasks`);
  }

  for (const task of employee.tasks) {
    const worker = getWorkerById(task.workerId);
    if (!worker) {
      throw new Error(`missing E07 worker: ${task.workerId}`);
    }
    if (!getSkillById(task.skillId)) {
      throw new Error(`unknown skill ${task.skillId} on ${employee.id}`);
    }
    if (!worker.skillIds.includes(task.skillId)) {
      throw new Error(
        `skill ${task.skillId} not owned by ${worker.id} (employee ${employee.id})`,
      );
    }
    if (!task.objective.trim()) {
      throw new Error(`task objective required on ${employee.id}`);
    }
  }
}

export function getEmployeeById(id: string): EmployeeDefinition | undefined {
  return EMPLOYEE_CATALOG.find((e) => e.id === id);
}

export function getEmployeeByJobKind(
  jobKind: EmployeeJobKind,
): EmployeeDefinition | undefined {
  return EMPLOYEE_CATALOG.find((e) => e.jobKind === jobKind);
}

export function listEmployeesForWorker(
  workerId: string,
): EmployeeDefinition[] {
  return EMPLOYEE_CATALOG.filter((e) =>
    e.tasks.some((t) => t.workerId === workerId),
  );
}

export function buildEmployeeRegistryManifest(
  employees: EmployeeDefinition[] = EMPLOYEE_CATALOG,
): EmployeeRegistryManifest {
  for (const employee of employees) {
    assertEmployeeDefinition(employee);
  }

  const jobKinds = [...new Set(employees.map((e) => e.jobKind))];
  const catalogComplete = EMPLOYEE_JOB_KINDS.every((k) =>
    jobKinds.includes(k),
  );
  if (!catalogComplete) {
    throw new Error("Employee catalog incomplete: missing job kinds");
  }

  return {
    runtimeId: E07_EMPLOYEE_RUNTIME_ID,
    version: E07_EMPLOYEE_VERSION,
    freezeVersion: E07_EMPLOYEE_FREEZE_VERSION,
    base: E07_EMPLOYEE_BASE,
    employeeCount: employees.length,
    jobKinds,
    employees,
    catalogComplete: true,
    readOnly: true,
  };
}

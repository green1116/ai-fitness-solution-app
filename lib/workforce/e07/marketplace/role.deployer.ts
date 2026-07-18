/**
 * E07-P3 — Role Agent Deployer
 * Deploys marketplace roles by executing bound E07 AI employees
 */

import { getEmployeeById } from "../employee/employee.registry";
import { executeEmployee } from "../employee/employee.executor";
import { assertRoleListing } from "./role.registry";
import {
  appendRoleTraceEvent,
  createRoleRuntimeTrace,
  type RoleRuntimeTrace,
} from "./role.trace";
import type {
  RoleDeploymentResult,
  RoleListing,
} from "./role.types";

export type RoleDeployBundle = {
  result: RoleDeploymentResult;
  trace: RoleRuntimeTrace;
};

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

export function deployRoleAgent(
  role: RoleListing,
  options?: {
    taskId?: string;
    input?: Readonly<Record<string, unknown>>;
    metadata?: Readonly<Record<string, string>>;
    instanceId?: string;
  },
): RoleDeployBundle {
  assertRoleListing(role);

  const startedAt = Date.now();
  const instanceId = options?.instanceId?.trim() || createId("role-inst");
  const taskId = options?.taskId?.trim() || createId("role-task");
  const input = Object.freeze({ ...(options?.input ?? {}) });

  let trace = createRoleRuntimeTrace({
    instanceId,
    roleId: role.id,
    taskId,
  });

  trace = appendRoleTraceEvent(trace, "ready", `role ${role.id} ready`, {
    category: role.category,
    employeeId: role.employeeId,
  });

  try {
    if (role.listingStatus !== "deployable") {
      throw new Error(
        `role ${role.id} is not deployable (status=${role.listingStatus})`,
      );
    }

    trace = appendRoleTraceEvent(
      trace,
      "select",
      `selected ${role.title} from marketplace`,
      { tags: role.tags.join(",") },
    );

    const employee = getEmployeeById(role.employeeId);
    if (!employee) {
      throw new Error(`employee missing: ${role.employeeId}`);
    }

    trace = appendRoleTraceEvent(
      trace,
      "deploy",
      `deploying employee ${employee.id}`,
      { jobKind: employee.jobKind },
    );

    const employeeRun = executeEmployee(employee, {
      taskId: `${taskId}:employee`,
      input: {
        ...input,
        roleId: role.id,
        roleCategory: role.category,
        goal:
          typeof input.goal === "string"
            ? input.goal
            : `role:${role.category}`,
      },
      metadata: {
        ...(options?.metadata ?? {}),
        layer: "e07-marketplace",
        roleId: role.id,
      },
    });

    if (!employeeRun.result.success) {
      const status =
        employeeRun.result.status === "blocked" ? "blocked" : "failed";
      const message =
        employeeRun.result.errorMessage ?? `employee ${status}`;

      trace = appendRoleTraceEvent(trace, "error", message, {
        employeeStatus: employeeRun.result.status,
      });

      return {
        trace,
        result: {
          success: false,
          roleId: role.id,
          category: role.category,
          employeeId: role.employeeId,
          instanceId,
          taskId,
          traceId: trace.traceId,
          employee: employeeRun.result,
          output: {},
          duration: Date.now() - startedAt,
          status,
          errorMessage: message,
          readOnly: true,
        },
      };
    }

    trace = appendRoleTraceEvent(
      trace,
      "activate",
      `role ${role.id} activated with ${employeeRun.result.completedTasks} tasks`,
      { completedTasks: String(employeeRun.result.completedTasks) },
    );

    const duration = Date.now() - startedAt;
    const result: RoleDeploymentResult = {
      success: true,
      roleId: role.id,
      category: role.category,
      employeeId: role.employeeId,
      instanceId,
      taskId,
      traceId: trace.traceId,
      employee: employeeRun.result,
      output: Object.freeze({
        roleId: role.id,
        category: role.category,
        title: role.title,
        employeeId: role.employeeId,
        jobKind: employee.jobKind,
        completedTasks: employeeRun.result.completedTasks,
        tags: [...role.tags],
      }),
      duration,
      status: "result",
      readOnly: true,
    };

    trace = appendRoleTraceEvent(
      trace,
      "result",
      `result ready durationMs=${duration}`,
      { success: "true" },
    );

    return { result, trace };
  } catch (error) {
    const message = error instanceof Error ? error.message : "role deploy failed";
    const duration = Date.now() - startedAt;

    trace = appendRoleTraceEvent(trace, "error", message);

    return {
      trace,
      result: {
        success: false,
        roleId: role.id,
        category: role.category,
        employeeId: role.employeeId,
        instanceId,
        taskId,
        traceId: trace.traceId,
        output: {},
        duration,
        status: "failed",
        errorMessage: message,
        readOnly: true,
      },
    };
  }
}

export function deployRoleAgentOrThrow(
  role: RoleListing,
  options?: {
    taskId?: string;
    input?: Readonly<Record<string, unknown>>;
    metadata?: Readonly<Record<string, string>>;
    instanceId?: string;
  },
): RoleDeployBundle & {
  result: RoleDeploymentResult & { success: true; status: "result" };
} {
  const bundle = deployRoleAgent(role, options);
  if (!bundle.result.success || bundle.result.status !== "result") {
    throw new Error(
      `E07 role deploy failed: ${bundle.result.errorMessage ?? bundle.result.status}`,
    );
  }
  return bundle as RoleDeployBundle & {
    result: RoleDeploymentResult & { success: true; status: "result" };
  };
}

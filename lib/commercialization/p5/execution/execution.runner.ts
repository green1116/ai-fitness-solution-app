/**
 * Commercialization P5 — Execution runner
 */

import { EXECUTION_STATUSES } from "../delivery/delivery.constants";
import { getDeliveryPlan } from "../delivery/delivery.registry";
import type {
  DeliveryExecution,
  ExecutionStatus,
  StartExecutionInput,
} from "./execution.types";

const executions = new Map<string, DeliveryExecution>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneExecution(execution: DeliveryExecution): DeliveryExecution {
  return { ...execution, metadata: { ...execution.metadata } };
}

export function startExecution(
  input: StartExecutionInput,
): DeliveryExecution {
  const name = input.name.trim();
  const deliveryId = input.deliveryId.trim();
  if (!name) throw new Error("execution.name is required");

  const delivery = getDeliveryPlan(deliveryId);
  if (!delivery) throw new Error(`delivery plan not found: ${deliveryId}`);
  if (delivery.status === "DRAFT") {
    throw new Error(`execution requires scheduled/in-flight delivery`);
  }

  const id = input.id?.trim() || createId("exec");
  if (executions.has(id)) {
    throw new Error(`execution already exists: ${id}`);
  }

  const status: ExecutionStatus = "QUEUED";
  if (!(EXECUTION_STATUSES as readonly string[]).includes(status)) {
    throw new Error(`invalid execution status: ${status}`);
  }

  const now = nowIso();
  const execution: DeliveryExecution = {
    id,
    deliveryId,
    name,
    status,
    progress: 0,
    detail: `status=${status} progress=0`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: now,
    updatedAt: now,
  };
  executions.set(id, execution);
  return cloneExecution(execution);
}

export function applyExecutionState(
  id: string,
  status: ExecutionStatus,
  progress: number,
): DeliveryExecution {
  const execution = executions.get(id.trim());
  if (!execution) throw new Error(`execution not found: ${id}`);
  if (!(EXECUTION_STATUSES as readonly string[]).includes(status)) {
    throw new Error(`invalid execution status: ${status}`);
  }

  execution.status = status;
  execution.progress = Math.max(0, Math.min(100, Math.round(progress)));
  if (status === "RUNNING" && !execution.startedAt) {
    execution.startedAt = nowIso();
  }
  if (
    status === "SUCCEEDED" ||
    status === "FAILED" ||
    status === "CANCELLED"
  ) {
    execution.finishedAt = nowIso();
    if (status === "SUCCEEDED") execution.progress = 100;
  }
  execution.updatedAt = nowIso();
  execution.detail = `status=${status} progress=${execution.progress}`;
  executions.set(execution.id, execution);
  return cloneExecution(execution);
}

export function getDeliveryExecution(
  id: string,
): DeliveryExecution | undefined {
  const execution = executions.get(id.trim());
  return execution ? cloneExecution(execution) : undefined;
}

export function listDeliveryExecutions(filter?: {
  deliveryId?: string;
  status?: ExecutionStatus;
}): DeliveryExecution[] {
  let result = [...executions.values()];
  if (filter?.deliveryId) {
    const did = filter.deliveryId.trim();
    result = result.filter((e) => e.deliveryId === did);
  }
  if (filter?.status) result = result.filter((e) => e.status === filter.status);
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneExecution);
}

export function clearDeliveryExecutions(): void {
  executions.clear();
}

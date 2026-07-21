/**
 * E11-P7 — Runtime Orchestration
 * Plans and applies lifecycle actions across cloud runtimes
 */

import { recoverRuntime } from "../autonomous/autonomous.recovery";
import { listRuntimes } from "../registry/cloud.registry";
import {
  getRuntimeLifecycle,
  startRuntime,
  stopRuntime,
} from "../runtime/cloud.lifecycle";
import { ORCHESTRATION_ACTIONS } from "./control-plane.constants";
import type {
  CreateOrchestrationInput,
  OrchestrationAction,
  OrchestrationPlan,
  OrchestrationResult,
  OrchestrationStep,
} from "./control-plane.types";

const plans = new Map<string, OrchestrationPlan>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function clonePlan(plan: OrchestrationPlan): OrchestrationPlan {
  return {
    ...plan,
    steps: plan.steps.map((s) => ({ ...s })),
    metadata: { ...plan.metadata },
  };
}

function applyStep(
  runtimeId: string,
  action: OrchestrationAction,
): OrchestrationStep {
  const lifecycle = getRuntimeLifecycle(runtimeId);
  if (!lifecycle) {
    return {
      runtimeId,
      action,
      reason: "orchestration",
      applied: false,
      message: `lifecycle missing: ${runtimeId}`,
    };
  }

  try {
    switch (action) {
      case "START": {
        startRuntime(runtimeId);
        return {
          runtimeId,
          action,
          reason: "orchestration",
          applied: true,
          message: "started",
        };
      }
      case "STOP": {
        stopRuntime(runtimeId);
        return {
          runtimeId,
          action,
          reason: "orchestration",
          applied: true,
          message: "stopped",
        };
      }
      case "RECOVER": {
        const recovery = recoverRuntime({ runtimeId });
        return {
          runtimeId,
          action,
          reason: "orchestration",
          applied: recovery.recovered,
          message: recovery.message,
        };
      }
      case "DRAIN": {
        if (lifecycle.current === "started") {
          stopRuntime(runtimeId);
        }
        return {
          runtimeId,
          action,
          reason: "orchestration",
          applied: true,
          message: "drained to stopped",
        };
      }
      case "REBALANCE": {
        return {
          runtimeId,
          action,
          reason: "orchestration",
          applied: true,
          message: `rebalance noop lifecycle=${lifecycle.current}`,
        };
      }
      default:
        return {
          runtimeId,
          action,
          reason: "orchestration",
          applied: false,
          message: `unsupported action: ${action}`,
        };
    }
  } catch (error) {
    return {
      runtimeId,
      action,
      reason: "orchestration",
      applied: false,
      message: error instanceof Error ? error.message : "orchestration failed",
    };
  }
}

export function createOrchestrationPlan(
  input: CreateOrchestrationInput,
): OrchestrationPlan {
  const title = input.title.trim();
  if (!title) throw new Error("orchestration.title is required");

  const runtimeIds =
    input.runtimeIds?.map((id) => id.trim()).filter(Boolean) ??
    listRuntimes().map((r) => r.id);

  const actions = input.actions ?? ["REBALANCE"];
  for (const action of actions) {
    if (!(ORCHESTRATION_ACTIONS as readonly string[]).includes(action)) {
      throw new Error(`invalid orchestration action: ${action}`);
    }
  }

  const id = input.id?.trim() || createId("orch");
  if (plans.has(id)) throw new Error(`orchestration plan exists: ${id}`);

  const steps: OrchestrationStep[] = [];
  for (const runtimeId of runtimeIds) {
    for (const action of actions) {
      steps.push({
        runtimeId,
        action,
        reason: title,
        applied: false,
        message: "pending",
      });
    }
  }

  const plan: OrchestrationPlan = {
    id,
    title,
    tenantId: input.tenantId?.trim() || undefined,
    steps,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: nowIso(),
  };
  plans.set(id, plan);
  return clonePlan(plan);
}

export function getOrchestrationPlan(id: string): OrchestrationPlan | undefined {
  const plan = plans.get(id.trim());
  return plan ? clonePlan(plan) : undefined;
}

export function listOrchestrationPlans(): OrchestrationPlan[] {
  return [...plans.values()]
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(clonePlan);
}

export function executeOrchestration(planId: string): OrchestrationResult {
  const plan = plans.get(planId.trim());
  if (!plan) throw new Error(`orchestration plan not found: ${planId}`);

  const appliedSteps: OrchestrationStep[] = [];
  let succeeded = 0;
  let failed = 0;

  for (const step of plan.steps) {
    const result = applyStep(step.runtimeId, step.action);
    appliedSteps.push(result);
    if (result.applied) succeeded += 1;
    else failed += 1;
  }

  plan.steps = appliedSteps;
  plan.finishedAt = nowIso();
  plans.set(plan.id, plan);

  return {
    planId: plan.id,
    succeeded,
    failed,
    steps: appliedSteps,
    message: `orchestration ${plan.id} succeeded=${succeeded} failed=${failed}`,
  };
}

export function clearOrchestrationPlans(): void {
  plans.clear();
}

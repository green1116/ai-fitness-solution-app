/**
 * E11-P7 — Command Center
 * Issues and dispatches control commands across integrated layers
 */

import type { AutonomousManager } from "../autonomous/autonomous.manager";
import type { ExecutionManager } from "../execution/execution.manager";
import type { GovernanceManager } from "../governance/governance.manager";
import { routeTenantRuntime } from "../tenant/tenant.router";
import {
  CONTROL_COMMAND_KINDS,
  CONTROL_COMMAND_STATUSES,
} from "./control-plane.constants";
import { captureComplianceState } from "./control-plane.compliance";
import {
  createOrchestrationPlan,
  executeOrchestration,
} from "./control-plane.orchestration";
import { evaluateGlobalPolicy } from "./control-plane.policy";
import { captureControlSnapshot } from "./control-plane.snapshot";
import type {
  CommandDispatchResult,
  ControlCommand,
  ControlCommandKind,
  ControlCommandStatus,
  IssueControlCommandInput,
} from "./control-plane.types";

const commands = new Map<string, ControlCommand>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneCommand(command: ControlCommand): ControlCommand {
  return {
    ...command,
    payload: { ...command.payload },
    metadata: { ...command.metadata },
  };
}

export function issueControlCommand(
  input: IssueControlCommandInput,
): ControlCommand {
  const title = input.title.trim();
  if (!title) throw new Error("command.title is required");
  if (!(CONTROL_COMMAND_KINDS as readonly string[]).includes(input.kind)) {
    throw new Error(`invalid command kind: ${input.kind}`);
  }

  const id = input.id?.trim() || createId("ccmd");
  if (commands.has(id)) throw new Error(`command already exists: ${id}`);

  const command: ControlCommand = {
    id,
    kind: input.kind,
    status: "PENDING",
    title,
    tenantId: input.tenantId?.trim() || undefined,
    runtimeId: input.runtimeId?.trim() || undefined,
    organizationId: input.organizationId?.trim() || undefined,
    payload: { ...(input.payload ?? {}) },
    metadata: { ...(input.metadata ?? {}) },
    issuedAt: nowIso(),
  };
  commands.set(id, command);
  return cloneCommand(command);
}

export function getControlCommand(id: string): ControlCommand | undefined {
  const command = commands.get(id.trim());
  return command ? cloneCommand(command) : undefined;
}

export function listControlCommands(filter?: {
  kind?: ControlCommandKind;
  status?: ControlCommandStatus;
  tenantId?: string;
}): ControlCommand[] {
  let result = [...commands.values()];
  if (filter?.kind) result = result.filter((c) => c.kind === filter.kind);
  if (filter?.status) result = result.filter((c) => c.status === filter.status);
  if (filter?.tenantId) {
    const tid = filter.tenantId.trim();
    result = result.filter((c) => c.tenantId === tid);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneCommand);
}

function updateCommand(
  id: string,
  patch: Partial<
    Pick<
      ControlCommand,
      "status" | "startedAt" | "finishedAt" | "result" | "error"
    >
  >,
): ControlCommand {
  const command = commands.get(id.trim());
  if (!command) throw new Error(`command not found: ${id}`);
  if (patch.status !== undefined) {
    if (
      !(CONTROL_COMMAND_STATUSES as readonly string[]).includes(patch.status)
    ) {
      throw new Error(`invalid command status: ${patch.status}`);
    }
    command.status = patch.status;
  }
  if (patch.startedAt !== undefined) command.startedAt = patch.startedAt;
  if (patch.finishedAt !== undefined) command.finishedAt = patch.finishedAt;
  if (patch.result !== undefined) command.result = patch.result;
  if (patch.error !== undefined) command.error = patch.error;
  commands.set(command.id, command);
  return cloneCommand(command);
}

export function dispatchControlCommand(
  commandId: string,
  deps: {
    autonomous?: AutonomousManager;
    governance?: GovernanceManager;
    execution?: ExecutionManager;
  },
): CommandDispatchResult {
  const command = commands.get(commandId.trim());
  if (!command) throw new Error(`command not found: ${commandId}`);

  updateCommand(command.id, { status: "RUNNING", startedAt: nowIso() });

  try {
  if (command.tenantId && command.runtimeId) {
    const route = routeTenantRuntime({
      tenantId: command.tenantId,
      runtimeId: command.runtimeId,
      organizationId: command.organizationId,
    });
    if (route.decision !== "ALLOW") {
      updateCommand(command.id, {
        status: "DENIED",
        finishedAt: nowIso(),
        error: route.reason,
      });
      return {
        commandId: command.id,
        kind: command.kind,
        status: "DENIED",
        message: route.reason,
      };
    }
  }

  let message = "";
  let details: Record<string, unknown> | undefined;

  switch (command.kind) {
    case "ORCHESTRATE": {
      const plan = createOrchestrationPlan({
        title: command.title,
        tenantId: command.tenantId,
        runtimeIds: command.runtimeId
          ? [command.runtimeId]
          : (command.payload.runtimeIds as string[] | undefined),
        actions: command.payload.actions as
          | import("./control-plane.types").OrchestrationAction[]
          | undefined,
      });
      const result = executeOrchestration(plan.id);
      message = result.message;
      details = { planId: result.planId, succeeded: result.succeeded };
      break;
    }
    case "RECOVER": {
      if (!deps.autonomous || !command.runtimeId) {
        throw new Error("RECOVER requires autonomous manager and runtimeId");
      }
      const recovery = deps.autonomous.recover({
        runtimeId: command.runtimeId,
        tenantId: command.tenantId,
      });
      message = recovery.message;
      details = { operationId: recovery.operationId, recovered: recovery.recovered };
      break;
    }
    case "HEAL": {
      if (!deps.autonomous) throw new Error("HEAL requires autonomous manager");
      const heal = deps.autonomous.heal({
        tenantId: command.tenantId,
        openIncidents: command.payload.openIncidents !== false,
      });
      message = heal.message;
      details = { operationId: heal.operationId, healed: heal.healed };
      break;
    }
    case "OPTIMIZE": {
      if (!deps.autonomous) {
        throw new Error("OPTIMIZE requires autonomous manager");
      }
      const opt = deps.autonomous.optimize({
        tenantId: command.tenantId,
        runtimeId: command.runtimeId,
        execution: deps.execution,
        utilizationTarget:
          typeof command.payload.utilizationTarget === "number"
            ? command.payload.utilizationTarget
            : undefined,
      });
      message = opt.message;
      details = { operationId: opt.operationId, optimized: opt.optimized };
      break;
    }
    case "ADMIT": {
      if (!deps.governance || !command.tenantId) {
        throw new Error("ADMIT requires governance manager and tenantId");
      }
      const resourceId = String(command.payload.resourceId ?? "");
      const evaluation = evaluateGlobalPolicy({
        kind: "ADMISSION",
        tenantId: command.tenantId,
        runtimeId: command.runtimeId,
        resourceId,
        amount:
          typeof command.payload.amount === "number"
            ? command.payload.amount
            : 1,
      });
      if (!evaluation.allowed) {
        updateCommand(command.id, {
          status: "DENIED",
          finishedAt: nowIso(),
          error: evaluation.reason,
        });
        return {
          commandId: command.id,
          kind: command.kind,
          status: "DENIED",
          message: evaluation.reason,
        };
      }
      const admission = deps.governance.admit({
        tenantId: command.tenantId,
        resourceId,
        runtimeId: command.runtimeId,
        amount:
          typeof command.payload.amount === "number"
            ? command.payload.amount
            : 1,
        priority: "NORMAL",
      });
      message = admission.reason;
      details = { decision: admission.decision };
      break;
    }
    case "EXECUTE": {
      if (
        !deps.governance ||
        !deps.execution ||
        !command.tenantId ||
        !command.runtimeId
      ) {
        throw new Error(
          "EXECUTE requires governance, execution, tenantId, runtimeId",
        );
      }
      const resourceId = String(command.payload.resourceId ?? "");
      const result = deps.governance.admitAndExecute(deps.execution, {
        tenantId: command.tenantId,
        resourceId,
        runtimeId: command.runtimeId,
        amount:
          typeof command.payload.amount === "number"
            ? command.payload.amount
            : 1,
        taskName: String(command.payload.taskName ?? command.title),
        kind: (command.payload.kind as "JOB" | "INVOKE" | "BATCH" | "PROBE") ??
          "PROBE",
      });
      message = result.admission.reason;
      details = {
        executed: result.executed,
        taskId: result.taskId,
        decision: result.admission.decision,
      };
      break;
    }
    case "COMPLIANCE_SCAN": {
      const report = captureComplianceState({ tenantId: command.tenantId });
      message = `compliance=${report.overall} findings=${report.findings.length}`;
      details = {
        overall: report.overall,
        findings: report.findings.length,
      };
      break;
    }
    case "SNAPSHOT": {
      const snap = captureControlSnapshot({
        tenantId: command.tenantId,
        metadata: command.payload,
        commandCount: commands.size,
      });
      message = `snapshot ${snap.snapshotId}`;
      details = { snapshotId: snap.snapshotId, compliance: snap.compliance };
      break;
    }
    default:
      throw new Error(`unsupported command kind: ${command.kind}`);
  }

  updateCommand(command.id, {
    status: "SUCCEEDED",
    finishedAt: nowIso(),
    result: message,
  });

  return {
    commandId: command.id,
    kind: command.kind,
    status: "SUCCEEDED",
    message,
    details,
  };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "dispatch failed";
    updateCommand(command.id, {
      status: "FAILED",
      finishedAt: nowIso(),
      error: msg,
    });
    return {
      commandId: command.id,
      kind: command.kind,
      status: "FAILED",
      message: msg,
    };
  }
}

export function clearControlCommands(): void {
  commands.clear();
}

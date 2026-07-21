/**
 * E11-P6 — Recovery Engine
 * Restores runtime lifecycle from failed/suspended/stopped toward ACTIVE
 */

import { getRuntime } from "../registry/cloud.registry";
import {
  getRuntimeLifecycle,
  startRuntime,
  stopRuntime,
} from "../runtime/cloud.lifecycle";
import { createOperation, updateOperation } from "./autonomous.operation";
import type { RecoveryResult } from "./autonomous.types";

function nowIso(): string {
  return new Date().toISOString();
}

export function recoverRuntime(input: {
  runtimeId: string;
  tenantId?: string;
  anomalyId?: string;
  incidentId?: string;
}): RecoveryResult {
  const runtimeId = input.runtimeId.trim();
  if (!runtimeId) throw new Error("runtimeId is required");

  const op = createOperation({
    kind: "RECOVER",
    title: `Recover runtime ${runtimeId}`,
    runtimeId,
    tenantId: input.tenantId,
    anomalyId: input.anomalyId,
    incidentId: input.incidentId,
  });
  updateOperation(op.id, { status: "RUNNING", startedAt: nowIso() });

  const runtime = getRuntime(runtimeId);
  if (!runtime) {
    updateOperation(op.id, {
      status: "FAILED",
      finishedAt: nowIso(),
      error: `runtime not found: ${runtimeId}`,
    });
    return {
      operationId: op.id,
      runtimeId,
      recovered: false,
      fromStatus: "missing",
      toStatus: "missing",
      message: `runtime not found: ${runtimeId}`,
    };
  }

  const fromStatus = runtime.status;
  const lifecycle = getRuntimeLifecycle(runtimeId);

  try {
    if (runtime.status === "ACTIVE") {
      updateOperation(op.id, {
        status: "SUCCEEDED",
        finishedAt: nowIso(),
        result: "already ACTIVE",
      });
      return {
        operationId: op.id,
        runtimeId,
        recovered: true,
        fromStatus,
        toStatus: "ACTIVE",
        message: "runtime already ACTIVE",
      };
    }

    // STOPPED or REGISTERED → start
    if (
      lifecycle &&
      (lifecycle.current === "stopped" ||
        lifecycle.current === "registered" ||
        lifecycle.current === "failed")
    ) {
      if (lifecycle.current === "failed") {
        // failed → stopped → started
        stopRuntime(runtimeId);
      }
      startRuntime(runtimeId);
    } else if (runtime.status === "SUSPENDED" && lifecycle?.current === "failed") {
      stopRuntime(runtimeId);
      startRuntime(runtimeId);
    } else if (runtime.status === "STOPPED" || runtime.status === "REGISTERED") {
      if (lifecycle) startRuntime(runtimeId);
      else {
        throw new Error(`lifecycle missing for recovery: ${runtimeId}`);
      }
    } else {
      throw new Error(
        `cannot recover from status=${runtime.status} lifecycle=${lifecycle?.current ?? "none"}`,
      );
    }

    const after = getRuntime(runtimeId);
    const recovered = after?.status === "ACTIVE";
    updateOperation(op.id, {
      status: recovered ? "SUCCEEDED" : "FAILED",
      finishedAt: nowIso(),
      result: recovered ? "recovered to ACTIVE" : "recovery incomplete",
      error: recovered ? undefined : `status=${after?.status}`,
    });

    return {
      operationId: op.id,
      runtimeId,
      recovered: Boolean(recovered),
      fromStatus,
      toStatus: after?.status ?? "missing",
      message: recovered
        ? `recovered ${fromStatus} → ACTIVE`
        : `recovery failed, status=${after?.status}`,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "recovery failed";
    updateOperation(op.id, {
      status: "FAILED",
      finishedAt: nowIso(),
      error: message,
    });
    return {
      operationId: op.id,
      runtimeId,
      recovered: false,
      fromStatus,
      toStatus: getRuntime(runtimeId)?.status ?? fromStatus,
      message,
    };
  }
}

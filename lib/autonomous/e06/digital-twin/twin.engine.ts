/**
 * E06-P6 — Enterprise Digital Twin Engine
 * MODEL -> SIMULATE -> PROJECT over the E06 self optimization loop
 */

import { getOptimizationById } from "../optimization/optimization.registry";
import { runSelfOptimizationLoop } from "../optimization/optimization.loop";
import { E06_TWIN_ID } from "./twin.constants";
import { buildTwinStateModel, projectTwinState } from "./twin.model";
import { assertTwinDefinition } from "./twin.registry";
import {
  appendTwinTraceEvent,
  createTwinRuntimeTrace,
  type TwinRuntimeTrace,
} from "./twin.trace";
import type {
  TwinDefinition,
  TwinSimulationResult,
} from "./twin.types";

export type TwinSimulationBundle = {
  result: TwinSimulationResult;
  trace: TwinRuntimeTrace;
};

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

export function simulateDigitalTwin(
  twin: TwinDefinition,
  options?: {
    taskId?: string;
    input?: Readonly<Record<string, unknown>>;
    metadata?: Readonly<Record<string, string>>;
    instanceId?: string;
  },
): TwinSimulationBundle {
  assertTwinDefinition(twin);

  const startedAt = Date.now();
  const instanceId = options?.instanceId?.trim() || createId("twin-inst");
  const taskId = options?.taskId?.trim() || createId("twin-task");
  const input = Object.freeze({ ...(options?.input ?? {}) });

  let trace = createTwinRuntimeTrace({
    instanceId,
    twinId: twin.id,
    taskId,
  });

  trace = appendTwinTraceEvent(trace, "ready", `twin ${twin.id} ready`, {
    optimizationId: twin.optimizationId,
    domain: twin.domain,
  });

  try {
    const optimization = getOptimizationById(twin.optimizationId);
    if (!optimization) {
      throw new Error(`optimization missing: ${twin.optimizationId}`);
    }

    // MODEL — build the twin state model from signals + live input
    const model = buildTwinStateModel(twin, input);
    trace = appendTwinTraceEvent(trace, "model", model.narrative, {
      health: model.health,
      score: String(model.score),
    });

    // SIMULATE — run the self optimization loop to obtain a measured delta
    const loop = runSelfOptimizationLoop(optimization, {
      taskId: `${taskId}:loop`,
      input,
      metadata: {
        ...(options?.metadata ?? {}),
        layer: "e06-digital-twin",
        twinId: twin.id,
      },
    });
    trace = appendTwinTraceEvent(
      trace,
      "simulate",
      `optimization ${loop.result.status} delta=${loop.result.measurement.delta}`,
      { reachedTarget: String(loop.result.measurement.reachedTarget) },
    );

    if (!loop.result.success) {
      throw new Error(
        `optimization loop failed: ${loop.result.errorMessage ?? "unknown"}`,
      );
    }

    // PROJECT — apply the measured delta to project the future twin state
    const projection = projectTwinState(
      twin,
      model,
      loop.result.measurement.delta,
    );
    trace = appendTwinTraceEvent(trace, "project", projection.verdict, {
      converged: String(projection.converged),
    });

    const duration = Date.now() - startedAt;
    const success = projection.converged;

    const result: TwinSimulationResult = {
      success,
      twinId: twin.id,
      name: twin.name,
      domain: twin.domain,
      optimizationId: twin.optimizationId,
      optimizationKind: optimization.kind,
      instanceId,
      taskId,
      traceId: trace.traceId,
      model,
      projection,
      output: Object.freeze({
        twinId: twin.id,
        domain: twin.domain,
        baselineScore: model.score,
        projectedScore: projection.projectedScore,
        projectedHealth: projection.projectedHealth,
        optimizationDelta: loop.result.measurement.delta,
        converged: projection.converged,
      }),
      duration,
      status: success ? "result" : "failed",
      errorMessage: success ? undefined : projection.verdict,
      readOnly: true,
    };

    trace = appendTwinTraceEvent(
      trace,
      success ? "result" : "error",
      `twin ${result.status} durationMs=${duration}`,
      { success: String(success) },
    );

    return { result, trace };
  } catch (error) {
    const message = error instanceof Error ? error.message : "twin failed";
    const duration = Date.now() - startedAt;

    trace = appendTwinTraceEvent(trace, "error", message);

    const model = buildTwinStateModel(twin, input);
    return {
      trace,
      result: {
        success: false,
        twinId: twin.id,
        name: twin.name,
        domain: twin.domain,
        optimizationId: twin.optimizationId,
        optimizationKind:
          getOptimizationById(twin.optimizationId)?.kind ?? "throughput",
        instanceId,
        taskId,
        traceId: trace.traceId,
        model,
        projection: projectTwinState(twin, model, 0),
        output: {},
        duration,
        status: "failed",
        errorMessage: message,
        readOnly: true,
      },
    };
  }
}

export function simulateDigitalTwinOrThrow(
  twin: TwinDefinition,
  options?: {
    taskId?: string;
    input?: Readonly<Record<string, unknown>>;
    metadata?: Readonly<Record<string, string>>;
    instanceId?: string;
  },
): TwinSimulationBundle & {
  result: TwinSimulationResult & { success: true; status: "result" };
} {
  const bundle = simulateDigitalTwin(twin, options);
  if (!bundle.result.success || bundle.result.status !== "result") {
    throw new Error(
      `E06 digital twin simulation failed: ${bundle.result.errorMessage ?? bundle.result.status}`,
    );
  }
  return bundle as TwinSimulationBundle & {
    result: TwinSimulationResult & { success: true; status: "result" };
  };
}

export const E06_TWIN_ENGINE_ID = E06_TWIN_ID;

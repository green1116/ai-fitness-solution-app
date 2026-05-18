import { toDeliveryEnvelope } from "../release/surfaceAdapters";
import { buildRuntimeVisualization } from "./buildRuntimeVisualization";
import type {
  ExecutiveRuntimeVisualizationResult,
  ExecutiveRuntimeVisualizationRuntimeInput,
} from "../types";
import { appendVisualizationEvent, createVisualizationTrace } from "./visualizationTrace";

/**
 * V3.4-E12 Executive Runtime Visualization Runtime
 */
export function runExecutiveRuntimeVisualization(
  input: ExecutiveRuntimeVisualizationRuntimeInput,
): ExecutiveRuntimeVisualizationResult {
  const started = Date.now();
  const ranAt = new Date().toISOString();
  let trace = createVisualizationTrace(input.runId);

  trace = appendVisualizationEvent(trace, "collect_runtime", "收集各层 runtime 状态");
  trace = appendVisualizationEvent(trace, "build_metrics", "构建可视化指标");
  trace = appendVisualizationEvent(trace, "build_panel", "构建 Executive 面板");
  trace = appendVisualizationEvent(trace, "build_pipeline_stages", "构建流水线阶段");
  const pkg = buildRuntimeVisualization({ ...input, runId: input.runId, ranAt });
  const surfaceForDelivery = input.executiveReleaseSurface ?? {
    status:
      pkg.executiveGate === "approved"
        ? "approved"
        : pkg.executiveGate === "conditional"
          ? "conditional"
          : "blocked",
    decision: pkg.releaseDecision,
    releasable: pkg.releasable,
    executiveScore: pkg.executiveScore,
    gateStatus: pkg.executiveGate,
    gateReasons: pkg.blockReasons,
    labels: [],
    blockReasons: pkg.blockReasons,
  };
  const delivery = toDeliveryEnvelope(surfaceForDelivery, pkg.manifest);
  trace = appendVisualizationEvent(trace, "debug", "生成 visualization debug");

  return {
    ...pkg,
    runId: input.runId,
    ranAt,
    durationMs: Date.now() - started,
    trace,
    delivery,
  };
}

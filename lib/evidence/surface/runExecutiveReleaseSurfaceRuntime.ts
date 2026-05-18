import { buildExecutiveReleaseSurface } from "../runtime/buildExecutiveReleaseSurface";
import { toDeliveryEnvelope } from "../release/surfaceAdapters";
import type {
  ExecutiveReleaseSurfaceRuntimeInput,
  ExecutiveReleaseSurfaceRuntimeResult,
} from "../types";
import { appendSurfaceEvent, createExecutiveSurfaceTrace } from "./surfaceTrace";

/**
 * V3.4-E11 Executive Release Surface Runtime
 */
export function runExecutiveReleaseSurfaceRuntime(
  input: ExecutiveReleaseSurfaceRuntimeInput,
): ExecutiveReleaseSurfaceRuntimeResult {
  const started = Date.now();
  const ranAt = new Date().toISOString();
  let trace = createExecutiveSurfaceTrace(input.runId);

  trace = appendSurfaceEvent(trace, "map_gate", "映射 Executive Gate 到 Release Surface");
  const pkg = buildExecutiveReleaseSurface({
    executiveApprovalGate: input.executiveApprovalGate,
    executiveOversight: input.executiveOversight,
    runId: input.runId,
    documentId: input.documentId,
  });

  trace = appendSurfaceEvent(trace, "build_labels", pkg.labels.join(","));
  trace = appendSurfaceEvent(trace, "build_manifest", `${pkg.manifest.lines.length} lines`);
  const delivery = toDeliveryEnvelope(pkg, pkg.manifest);
  trace = appendSurfaceEvent(trace, "surface_adapters", "生成交付/下载/Manifest 适配");
  trace = appendSurfaceEvent(trace, "debug", "生成 surface debug");

  return {
    ...pkg,
    runId: input.runId,
    ranAt,
    durationMs: Date.now() - started,
    documentId: input.documentId,
    trace,
    delivery,
  };
}

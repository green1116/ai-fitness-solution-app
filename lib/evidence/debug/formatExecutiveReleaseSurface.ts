import type { ExecutiveReleaseSurfaceRuntimeResult } from "../types";

export function summarizeExecutiveReleaseSurface(
  result: ExecutiveReleaseSurfaceRuntimeResult,
): string {
  return [
    `Release Surface ${result.version}`,
    `status=${result.status}`,
    `decision=${result.decision}`,
    `releasable=${result.releasable}`,
    `score=${result.executiveScore}`,
    result.labels.length ? `labels=${result.labels.slice(0, 4).join(",")}` : "",
  ]
    .filter(Boolean)
    .join(" | ");
}

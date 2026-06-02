import type {
  ExecutiveReleaseManifest,
  ExecutiveReleaseSurface,
  ExecutiveReleaseSurfaceDebugOutput,
} from "../types";
import { toDownloadSurfaceHeaders } from "../release/surfaceAdapters";

export function formatExecutiveReleaseSurfaceDebug(input: {
  surface: ExecutiveReleaseSurface;
  manifest: ExecutiveReleaseManifest;
}): ExecutiveReleaseSurfaceDebugOutput {
  const { surface, manifest } = input;
  const headers = toDownloadSurfaceHeaders(surface);

  const summary = [
    "[ExecutiveReleaseSurfaceRuntime]",
    `Surface Status: ${surface.status}`,
    `Release Decision: ${surface.decision}`,
    `Releasable: ${surface.releasable}`,
    `Executive Score: ${surface.executiveScore}`,
    `Gate Status: ${surface.gateStatus}`,
    `Labels: ${surface.labels.join(", ")}`,
  ].join("\n");

  const deliveryLayer = [
    "Delivery Layer:",
    `Gate: ${surface.gateStatus}`,
    `Decision: ${surface.decision}`,
    `TenderRelease: ${surface.tenderReleaseDecision ?? "—"}`,
    `Oversight: ${surface.executiveRecommendation ?? "—"}`,
  ].join("\n");

  const downloadLayer = [
    "Download Layer Headers:",
    ...Object.entries(headers).map(([k, v]) => `${k}=${v}`),
  ].join("\n");

  const manifestPreview = [
    "Release Manifest Preview:",
    ...manifest.lines.slice(0, 12),
  ].join("\n");

  return {
    summary,
    deliveryLayer,
    downloadLayer,
    manifestPreview,
  };
}

/**
 * V66 P3 — Observability surface catalog (declarative, read-only)
 */
import type {
  ObservabilitySurfaceEntry,
  ObservabilitySurfaceManifest,
} from "./observability.types";
import { V66_DEPLOYMENT_OBSERVABILITY_VERSION } from "./observability.types";

export const OBSERVABILITY_SURFACE: ObservabilitySurfaceEntry[] = [
  {
    id: "OBS-001",
    label: "Structured deployment log schema",
    kind: "schema",
    target: "lib/deployment/v66/deployment.log.formatter.ts",
    required: true,
    description: "V66 structured JSON deployment log entries",
  },
  {
    id: "OBS-002",
    label: "Deployment log event inventory",
    kind: "module",
    target: "lib/deployment/v66/deployment.log.inventory.ts",
    required: true,
    description: "Canonical deployment log event catalog",
  },
  {
    id: "OBS-003",
    label: "Ops event catalog",
    kind: "module",
    target: "lib/deployment/v66/ops.event.catalog.ts",
    required: true,
    description: "Ops visibility event definitions",
  },
  {
    id: "OBS-004",
    label: "V60 platform events (frozen)",
    kind: "frozen-layer",
    target: "lib/portal/v60/observability/platform-events.ts",
    required: true,
    description: "Upstream frozen platform event model",
  },
  {
    id: "OBS-005",
    label: "Production health API observability",
    kind: "frozen-layer",
    target: "app/api/production/health/route.ts",
    required: true,
    description: "Existing health route — not modified by V66 P3",
  },
  {
    id: "OBS-006",
    label: "V66 P1 baseline verify",
    kind: "script",
    target: "npm run verify:v66-p1-deployment-baseline",
    required: true,
    description: "Baseline observability gate",
  },
  {
    id: "OBS-007",
    label: "V66 P2 execution verify",
    kind: "script",
    target: "npm run verify:v66-p2-deployment-execution",
    required: true,
    description: "Execution observability gate",
  },
  {
    id: "OBS-008",
    label: "V66 P3 observability verify",
    kind: "script",
    target: "npm run verify:v66-p3-deployment-observability",
    required: true,
    description: "Observability baseline verify gate",
  },
  {
    id: "OBS-009",
    label: "V66 observability module entry",
    kind: "module",
    target: "lib/deployment/v66/observability.ts",
    required: true,
    description: "P3 observability barrel export",
  },
  {
    id: "OBS-010",
    label: "Deployment observability documentation",
    kind: "module",
    target: "docs/deployment/V66-DEPLOYMENT-OBSERVABILITY.md",
    required: true,
    description: "Ops visibility baseline documentation",
  },
];

export function buildObservabilitySurfaceManifest(): ObservabilitySurfaceManifest {
  const entries = OBSERVABILITY_SURFACE;
  const requiredEntryCount = entries.filter((e) => e.required).length;
  const surfaceComplete = entries.length >= 8 && requiredEntryCount >= 7;

  return {
    version: V66_DEPLOYMENT_OBSERVABILITY_VERSION,
    entryCount: entries.length,
    requiredEntryCount,
    surfaceComplete,
    entries,
    summary: [
      `observability-surface entries=${entries.length}`,
      `required=${requiredEntryCount}`,
      `complete=${surfaceComplete}`,
    ].join(" "),
  };
}

export function getObservabilitySurfaceByKind(
  kind: ObservabilitySurfaceEntry["kind"],
): ObservabilitySurfaceEntry[] {
  return OBSERVABILITY_SURFACE.filter((e) => e.kind === kind);
}

/**
 * V66 P2 — Deployment readiness probe surface (declarative catalog)
 */
import type { ReadinessProbeEntry, ReadinessProbeManifest } from "./execution.types";
import { V66_DEPLOYMENT_EXECUTION_VERSION } from "./execution.types";

export const READINESS_PROBE_SURFACE: ReadinessProbeEntry[] = [
  {
    id: "RP-001",
    label: "Production health API",
    kind: "http",
    target: "/api/production/health",
    method: "GET",
    required: true,
    description: "Existing V60 system health aggregation (frozen route)",
  },
  {
    id: "RP-002",
    label: "Prisma preflight script",
    kind: "script",
    target: "npm run prisma:preflight",
    required: true,
    description: "Schema drift and migration safety gate",
  },
  {
    id: "RP-003",
    label: "V66 deployment baseline verify",
    kind: "script",
    target: "npm run verify:v66-p1-deployment-baseline",
    required: true,
    description: "P1 env contract and deployment checklist",
  },
  {
    id: "RP-004",
    label: "V66 deployment execution verify",
    kind: "script",
    target: "npm run verify:v66-p2-deployment-execution",
    required: true,
    description: "P2 health checks and startup verification",
  },
  {
    id: "RP-005",
    label: "V65 production upstream gate",
    kind: "script",
    target: "npm run verify:v65-production",
    required: true,
    description: "Frozen upstream production readiness chain",
  },
  {
    id: "RP-006",
    label: "V66 execution module",
    kind: "module",
    target: "lib/deployment/v66/execution.ts",
    required: true,
    description: "Deployment execution layer entry",
  },
  {
    id: "RP-007",
    label: "V66 baseline module",
    kind: "module",
    target: "lib/deployment/v66/baseline.ts",
    required: true,
    description: "P1 deployment baseline entry",
  },
  {
    id: "RP-008",
    label: "Production env audit",
    kind: "script",
    target: "npm run v92:env-audit",
    required: false,
    description: "Optional live env audit (non-blocking for P2 declarative layer)",
  },
];

export function buildReadinessProbeManifest(): ReadinessProbeManifest {
  const probes = READINESS_PROBE_SURFACE;
  const requiredProbeCount = probes.filter((p) => p.required).length;
  const surfaceComplete = probes.length >= 6 && requiredProbeCount >= 5;

  return {
    version: V66_DEPLOYMENT_EXECUTION_VERSION,
    probeCount: probes.length,
    requiredProbeCount,
    surfaceComplete,
    probes,
    summary: [
      `readiness-probes count=${probes.length}`,
      `required=${requiredProbeCount}`,
      `complete=${surfaceComplete}`,
    ].join(" "),
  };
}

export function getReadinessProbeByKind(
  kind: ReadinessProbeEntry["kind"],
): ReadinessProbeEntry[] {
  return READINESS_PROBE_SURFACE.filter((p) => p.kind === kind);
}

/**
 * V80 DEPLOY P1 — Runtime entry points (API + workflow + PDF + worker)
 */
import { buildV80DeploymentBinding } from "@/lib/scaffold/v80/ops/deployment.model";
import type { RuntimeEntryPoint } from "./deploy.types";

const binding = buildV80DeploymentBinding();

export const RUNTIME_ENTRY_POINTS: RuntimeEntryPoint[] = [
  {
    id: "DEP-RT-001",
    kind: "api",
    name: "v80-saas-api",
    path: "app/api/v80/**/route.ts",
    healthProbe: "GET /api/v80/ops/health",
    required: true,
  },
  {
    id: "DEP-RT-002",
    kind: "workflow",
    name: "tender-pack-orchestrator",
    path: "lib/scaffold/v80/workflow/runner.service.ts",
    startCommand: "POST /api/v80/autopilot/job/run",
    healthProbe: "workflowKey=tender-pack-complete",
    required: true,
  },
  {
    id: "DEP-RT-003",
    kind: "pdf",
    name: "pdf-render-pipeline",
    path: "lib/scaffold/v80/pdf/",
    startCommand: "POST /api/v80/proposal-pdf/render | GET /api/v80/pdf",
    healthProbe: "pdf-lib render + artifact save",
    required: true,
  },
  {
    id: "DEP-RT-004",
    kind: "worker",
    name: "v80-background-worker",
    path: "scripts/v80-worker-start.ts",
    startCommand: "npm run v80:worker",
    healthProbe: "V80_WORKER_ENABLED=1 + prisma ping",
    required: true,
  },
  {
    id: "DEP-RT-005",
    kind: "ops",
    name: "v80-ops-probes",
    path: "app/api/v80/ops/",
    healthProbe: "GET /api/v80/ops/health | /metrics | /governance/audit",
    required: true,
  },
  ...binding.routes.map(
    (route, i): RuntimeEntryPoint => ({
      id: `DEP-RT-API-${String(i + 1).padStart(3, "0")}`,
      kind: "api",
      name: route.replace("/api/v80/", "").replace(/\//g, "-") || "root",
      path: `app/api/v80${route.replace("/api/v80", "")}/route.ts`,
      healthProbe: route,
      required: true,
    }),
  ),
];

export function isRuntimeEntryComplete(): boolean {
  const kinds = new Set(RUNTIME_ENTRY_POINTS.map((e) => e.kind));
  return (
    RUNTIME_ENTRY_POINTS.length >= 13 &&
    kinds.has("api") &&
    kinds.has("workflow") &&
    kinds.has("pdf") &&
    kinds.has("worker") &&
    kinds.has("ops")
  );
}

export function getRuntimeEntryByKind(kind: RuntimeEntryPoint["kind"]) {
  return RUNTIME_ENTRY_POINTS.filter((e) => e.kind === kind);
}

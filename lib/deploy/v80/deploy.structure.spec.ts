/**
 * V80 DEPLOY P1 — Production deployment structure (Next.js + worker + queue)
 */
import { buildV80DeploymentBinding } from "@/lib/scaffold/v80/ops/deployment.model";
import type { DeployStructureNode } from "./deploy.types";

export const DEPLOY_STRUCTURE: DeployStructureNode[] = [
  {
    id: "DEP-STR-001",
    tier: "edge",
    component: "next-js-app-router",
    path: "app/ + app/api/v80/**",
    scaling: "Vercel auto-scale; force-dynamic on v80 routes",
    productionRef: "PRD-DEP-001",
    required: true,
  },
  {
    id: "DEP-STR-002",
    tier: "compute",
    component: "v80-api-handlers",
    path: "lib/scaffold/v80/routes/ → app/api/v80/",
    scaling: "60s API timeout; withProductionHandler middleware",
    productionRef: "PRD-DEP-002",
    required: true,
  },
  {
    id: "DEP-STR-003",
    tier: "worker",
    component: "pdf-render-worker",
    path: "lib/scaffold/v80/pdf/ + scripts/v80-worker-start.ts",
    scaling: "max 2 concurrent PDF/org (queue binding)",
    productionRef: "PRD-DEP-003",
    required: true,
  },
  {
    id: "DEP-STR-004",
    tier: "worker",
    component: "workflow-orchestrator",
    path: "lib/scaffold/v80/workflow/runner.service.ts",
    scaling: "sync in API or worker process; queue depth 100",
    productionRef: "PRD-DEP-004",
    required: true,
  },
  {
    id: "DEP-STR-005",
    tier: "queue",
    component: "in-process-queue",
    path: "lib/scaffold/v80/runtime/lock.ts + deployment.model queue",
    scaling: "Per-org mutex; no external broker required for launch",
    productionRef: "PRD-DEP-004",
    required: true,
  },
  {
    id: "DEP-STR-006",
    tier: "data",
    component: "postgresql-prisma",
    path: "prisma/schema.prisma V80Scaffold* + patches/v80_scaffold_runtime_idempotent.sql",
    scaling: "PgBouncer pooler; memory fallback when DB offline",
    productionRef: "PRD-DEP-005",
    required: true,
  },
  {
    id: "DEP-STR-007",
    tier: "data",
    component: "pdf-artifact-store",
    path: "V80ScaffoldDocumentExport.data (Bytes) + memory backend",
    scaling: "Inline buffer at launch; blob CDN optional post-launch",
    productionRef: "PRD-DEP-006",
    required: true,
  },
];

export function isDeployStructureComplete(): boolean {
  const binding = buildV80DeploymentBinding();
  const tiers = new Set(DEPLOY_STRUCTURE.map((n) => n.tier));
  return (
    DEPLOY_STRUCTURE.length === 7 &&
    tiers.has("edge") &&
    tiers.has("worker") &&
    tiers.has("queue") &&
    tiers.has("data") &&
    binding.routes.length === 8
  );
}

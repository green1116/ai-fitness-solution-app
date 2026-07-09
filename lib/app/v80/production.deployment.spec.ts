/**
 * V80 APP P4 — Deployment architecture (Next.js, API, PDF workers, scaling)
 */
import { API_IMPLEMENTATION_SPECS } from "./blueprint.api.impl";
import type { DeploymentComponentSpec } from "./production.types";

export const DEPLOYMENT_ARCHITECTURE: DeploymentComponentSpec[] = [
  {
    id: "PRD-DEP-001",
    tier: "edge",
    component: "next-js-app-router",
    runtime: "Vercel Edge / Node SSR",
    scaling: "auto-scale by request; ISR for dashboard",
    blueprintRef: "BLP-API-*",
    required: true,
    description: "Next.js App Router — UI + API route handlers",
  },
  {
    id: "PRD-DEP-002",
    tier: "compute",
    component: "api-route-handlers",
    runtime: "Node.js serverless functions",
    scaling: "concurrency pool per region; 60s timeout API / 120s PDF",
    blueprintRef: "BLP-API-003",
    required: true,
    description: "app/api/** route.ts — sync API layer",
  },
  {
    id: "PRD-DEP-003",
    tier: "worker",
    component: "pdf-render-worker",
    runtime: "Node worker queue (PlanJob consumer)",
    scaling: "horizontal workers; max 2 concurrent PDF/job per org",
    blueprintRef: "BLP-PDF-002",
    required: true,
    description: "pdf-lib render jobs — budget/plan/proposal off hot path",
  },
  {
    id: "PRD-DEP-004",
    tier: "worker",
    component: "workflow-orchestrator",
    runtime: "autopilot job runner",
    scaling: "queue depth autoscale; BLP-WFL-001 DAG steps",
    blueprintRef: "BLP-WFL-001",
    required: true,
    description: "tender-pack-complete workflow execution",
  },
  {
    id: "PRD-DEP-005",
    tier: "data",
    component: "postgresql-prisma",
    runtime: "Supabase Postgres + Prisma ORM",
    scaling: "connection pool PgBouncer; read replica for reports",
    blueprintRef: "BLP-REL-*",
    required: true,
    description: "Primary data store — tenant-scoped queries",
  },
  {
    id: "PRD-DEP-006",
    tier: "data",
    component: "blob-storage",
    runtime: "S3-compatible object store",
    scaling: "per-tenant prefix isolation; CDN for PDF download",
    blueprintRef: "BLP-PDF-004",
    required: true,
    description: "DocumentExport artifacts + enterprise zip bundles",
  },
];

export function isDeploymentArchitectureComplete(): boolean {
  const tiers = new Set(DEPLOYMENT_ARCHITECTURE.map((d) => d.tier));
  return (
    DEPLOYMENT_ARCHITECTURE.length === 6 &&
    tiers.has("edge") &&
    tiers.has("compute") &&
    tiers.has("worker") &&
    tiers.has("data") &&
    API_IMPLEMENTATION_SPECS.length >= 8
  );
}

export function getDeploymentByTier(tier: DeploymentComponentSpec["tier"]) {
  return DEPLOYMENT_ARCHITECTURE.filter((d) => d.tier === tier);
}

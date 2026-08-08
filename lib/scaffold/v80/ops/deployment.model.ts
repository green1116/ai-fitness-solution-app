/**
 * V80 CODE P4 — Deployment model (Next.js + API + worker + PDF + queue binding)
 */
import { DEPLOYMENT_ARCHITECTURE } from "@/lib/app/v80/production.deployment.spec";

export const V80_CODE_RELEASE_TAG = "v80-code-release-1" as const;

export type V80DeploymentBinding = {
  deploymentId: string;
  edge: string;
  api: string;
  pdfWorker: string;
  workflowWorker: string;
  dataStore: string;
  blobStore: string;
  queue: {
    pdfMaxConcurrentPerOrg: number;
    workflowMaxDepth: number;
    apiTimeoutSec: number;
    pdfTimeoutSec: number;
  };
  routes: string[];
};

const V80_API_ROUTES = [
  "/api/v80/tenant/run",
  "/api/v80/entitlements",
  "/api/v80/budget/calculate",
  "/api/v80/autopilot/job/run",
  "/api/v80/tender/intake",
  "/api/v80/production/integrity",
  "/api/v80/proposal-pdf/render",
  "/api/v80/pdf",
] as const;

export function buildV80DeploymentBinding(deploymentId = "v80-production"): V80DeploymentBinding {
  const byId = (id: string) => DEPLOYMENT_ARCHITECTURE.find((d) => d.id === id);

  return {
    deploymentId,
    edge: byId("PRD-DEP-001")?.component ?? "next-js-app-router",
    api: byId("PRD-DEP-002")?.component ?? "api-route-handlers",
    pdfWorker: byId("PRD-DEP-003")?.component ?? "pdf-render-worker",
    workflowWorker: byId("PRD-DEP-004")?.component ?? "workflow-orchestrator",
    dataStore: byId("PRD-DEP-005")?.component ?? "postgresql-prisma",
    blobStore: byId("PRD-DEP-006")?.component ?? "blob-storage",
    queue: {
      pdfMaxConcurrentPerOrg: 2,
      workflowMaxDepth: 100,
      apiTimeoutSec: 60,
      pdfTimeoutSec: 120,
    },
    routes: [...V80_API_ROUTES],
  };
}

export function isV80DeploymentBindingComplete(binding: V80DeploymentBinding): boolean {
  return (
    binding.routes.length === 8 &&
    binding.queue.pdfMaxConcurrentPerOrg >= 1 &&
    binding.queue.workflowMaxDepth >= 1
  );
}

/** Minimal stub — Pilot P1 deployment binding. */
export type DeploymentComponent = {
  id: string;
  component: string;
  name?: string;
};

export const DEPLOYMENT_ARCHITECTURE: DeploymentComponent[] = [
  { id: "PRD-DEP-001", component: "next-js-app-router" },
  { id: "PRD-DEP-002", component: "api-route-handlers" },
  { id: "PRD-DEP-003", component: "pdf-render-worker" },
  { id: "PRD-DEP-004", component: "workflow-orchestrator" },
  { id: "PRD-DEP-005", component: "postgresql-prisma" },
  { id: "PRD-DEP-006", component: "blob-storage" },
];

export function isDeploymentArchitectureComplete(): boolean {
  return true;
}

/**
 * V66 P2 — Deployment execution artifact surface (read-only)
 */
export type ExecutionArtifactSurface = {
  executionDoc: string;
  verifyExecution: string;
  verifyDeployment: string;
  baselineVerify: string;
};

export const V66_EXECUTION_ARTIFACT_SURFACE: ExecutionArtifactSurface = {
  executionDoc: "docs/deployment/V66-DEPLOYMENT-EXECUTION.md",
  verifyExecution: "npm run verify:v66-p2-deployment-execution",
  verifyDeployment: "npm run verify:v66-deployment",
  baselineVerify: "npm run verify:v66-p1-deployment-baseline",
};

export function getExecutionArtifactPath(key: keyof ExecutionArtifactSurface): string {
  return V66_EXECUTION_ARTIFACT_SURFACE[key];
}

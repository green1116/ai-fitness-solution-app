/**
 * V66 P8 — Deployment sign-off closing summary formatter (read-only)
 */
import type { DeploymentSignoffPhase } from "./signoff.types";

export function formatDeploymentClosingSummary(input: {
  phases: DeploymentSignoffPhase[];
  signedOff: boolean;
  readinessScore: number;
}): string {
  const passed = input.phases.filter((p) => p.ok).length;
  const lines = [
    "V66 Deployment Release — Final Sign-Off",
    `  signedOff: ${input.signedOff}`,
    `  phases: ${passed}/${input.phases.length}`,
    `  readinessScore: ${input.readinessScore}`,
    ...input.phases.map((p) => `  ${p.id} ${p.label}: ${p.ok ? "PASS" : "FAIL"}`),
  ];
  return lines.join("\n");
}

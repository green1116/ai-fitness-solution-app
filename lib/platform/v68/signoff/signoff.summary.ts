/**
 * V68 P8 — Platform sign-off closing summary formatter (read-only)
 */
import type { PlatformSignoffPhase } from "./signoff.types";

export function formatPlatformClosingSummary(input: {
  phases: PlatformSignoffPhase[];
  signedOff: boolean;
  readinessScore: number;
}): string {
  const passed = input.phases.filter((p) => p.ok).length;
  const lines = [
    "V68 Platform Governance — Final Sign-Off",
    `  signedOff: ${input.signedOff}`,
    `  phases: ${passed}/${input.phases.length}`,
    `  readinessScore: ${input.readinessScore}`,
    ...input.phases.map((p) => `  ${p.id} ${p.label}: ${p.ok ? "PASS" : "FAIL"}`),
  ];
  return lines.join("\n");
}

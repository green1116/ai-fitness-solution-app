/**
 * V69 P8 — Technical governance sign-off closing summary formatter (read-only)
 */
import type { TechnicalSignoffPhase } from "./signoff.types";

export function formatTechnicalClosingSummary(input: {
  phases: TechnicalSignoffPhase[];
  signedOff: boolean;
  readinessScore: number;
}): string {
  const passed = input.phases.filter((p) => p.ok).length;
  const lines = [
    "V69 Technical Governance — Final Sign-Off",
    `  signedOff: ${input.signedOff}`,
    `  phases: ${passed}/${input.phases.length}`,
    `  readinessScore: ${input.readinessScore}`,
    ...input.phases.map((p) => `  ${p.id} ${p.label}: ${p.ok ? "PASS" : "FAIL"}`),
  ];
  return lines.join("\n");
}

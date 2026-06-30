/**
 * V65 P8 — Production sign-off closing summary (read-only)
 */
import type { ProductionSignoffPhase } from "./signoff.types";

export function formatProductionClosingSummary(input: {
  phases: ProductionSignoffPhase[];
  signedOff: boolean;
  readinessScore: number;
}): string {
  const passed = input.phases.filter((p) => p.ok).length;
  const lines = [
    "V65 Production Release — Final Sign-Off",
    `  signedOff: ${input.signedOff}`,
    `  phases: ${passed}/${input.phases.length}`,
    `  readinessScore: ${input.readinessScore}`,
    ...input.phases.map((p) => `  ${p.id} ${p.label}: ${p.ok ? "PASS" : "FAIL"}`),
  ];
  return lines.join("\n");
}

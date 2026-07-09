/**
 * V67 P8 — Monitoring sign-off closing summary formatter (read-only)
 */
import type { MonitoringSignoffPhase } from "./signoff.types";

export function formatMonitoringClosingSummary(input: {
  phases: MonitoringSignoffPhase[];
  signedOff: boolean;
  readinessScore: number;
}): string {
  const passed = input.phases.filter((p) => p.ok).length;
  const lines = [
    "V67 Monitoring & Incident Response — Final Sign-Off",
    `  signedOff: ${input.signedOff}`,
    `  phases: ${passed}/${input.phases.length}`,
    `  readinessScore: ${input.readinessScore}`,
    ...input.phases.map((p) => `  ${p.id} ${p.label}: ${p.ok ? "PASS" : "FAIL"}`),
  ];
  return lines.join("\n");
}

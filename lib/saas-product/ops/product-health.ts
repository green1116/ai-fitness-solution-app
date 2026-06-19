import type { HealthFinding, ProductHealthLevel } from "../shared/ops-runtime-types";

export function calculateProductHealth(findings: HealthFinding[]): ProductHealthLevel {
  if (findings.some((finding) => finding.level === "CRITICAL")) {
    return "CRITICAL";
  }
  if (findings.some((finding) => finding.level === "WARNING")) {
    return "WARNING";
  }
  return "HEALTHY";
}

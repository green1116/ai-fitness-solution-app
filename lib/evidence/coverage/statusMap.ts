import type { CoverageLevel, CoverageStatus } from "../types";

export function coverageStatusToLegacyLevel(
  status: CoverageStatus,
  mandatory: boolean,
): CoverageLevel {
  switch (status) {
    case "covered":
      return "fully_evidenced";
    case "partial":
      return "partially_evidenced";
    case "conflict":
      return mandatory ? "risky" : "partially_evidenced";
    case "missing":
      return mandatory ? "risky" : "unsupported";
    case "unknown":
    default:
      return "unsupported";
  }
}

export function legacyLevelToCoverageStatus(level: CoverageLevel): CoverageStatus {
  switch (level) {
    case "fully_evidenced":
      return "covered";
    case "partially_evidenced":
      return "partial";
    case "risky":
      return "missing";
    case "unsupported":
    default:
      return "missing";
  }
}

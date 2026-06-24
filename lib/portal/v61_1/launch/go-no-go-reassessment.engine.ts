/**
 * V61.1 P6 — GO / NO-GO reassessment with launch blocker closure
 */

import { runLaunchReverification } from "./launch-reverification.engine";

export type GoNoGoReassessment = {
  decision: "GO" | "NO-GO";
  launchScore: number;
  blockers: string[];
  reasons: string[];
  freezeTag: string;
  evaluatedAt: string;
};

export async function reassessGoNoGo(organizationId?: string): Promise<GoNoGoReassessment> {
  const report = await runLaunchReverification(organizationId);
  const reasons: string[] = [];

  if (report.migration.projectOrgColumnOk && report.migration.quoteOrgColumnOk) {
    reasons.push("B1: Project/Quote organizationId integrity closed");
  }
  if (report.schema.migrationClosurePresent && report.schema.prismaValidateOk) {
    reasons.push("P2: Prisma migration closure present");
  }
  if (report.auth.sessionSecretProductionGrade && report.auth.mockAuthDisabled) {
    reasons.push("B3: Production auth closure complete");
  }
  if (report.commercial.enabled && report.commercial.flowComplete) {
    reasons.push("B2: Commercial registration enabled");
  }
  if (report.goNoGo.decision === "GO") {
    reasons.push(`V61 launch score ${report.goNoGo.overallLaunchScore}`);
  }

  const decision: "GO" | "NO-GO" =
    report.allBlockers.length === 0 && report.goNoGo.decision === "GO" ? "GO" : "NO-GO";

  return {
    decision,
    launchScore: report.launchScore,
    blockers: report.allBlockers,
    reasons,
    freezeTag: decision === "GO" ? "v61-commercial-launch-final" : "v61-launch-blocked",
    evaluatedAt: new Date().toISOString(),
  };
}

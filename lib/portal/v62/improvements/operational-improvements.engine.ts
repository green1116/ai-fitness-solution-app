/**
 * V62 P9 — Operational improvements from pilot exposure
 */

import { buildIssueTriageReport } from "../issues/issue-triage.engine";
import {
  listOperationalImprovements,
  logOperationalImprovement,
} from "../store/operational-improvements.store";

export type OperationalImprovementLog = {
  improvements: ReturnType<typeof listOperationalImprovements>;
  autoLoggedFromBlockers: number;
  generatedAt: string;
};

export function buildOperationalImprovementLog(): OperationalImprovementLog {
  const issues = buildIssueTriageReport();
  let autoLogged = 0;

  for (const issue of issues.issues) {
    if (issue.severity !== "blocker" && issue.severity !== "high") continue;
    if (!["new", "triaged"].includes(issue.status)) continue;
    const exists = listOperationalImprovements().some((i) => i.issueId === issue.id);
    if (exists) continue;
    logOperationalImprovement({
      issueId: issue.id,
      title: `Pilot fix: ${issue.title}`,
      description: issue.description,
      scope: issue.severity === "blocker" ? "pilot_blocker" : "pilot_high",
    });
    autoLogged++;
  }

  return {
    improvements: listOperationalImprovements(),
    autoLoggedFromBlockers: autoLogged,
    generatedAt: new Date().toISOString(),
  };
}

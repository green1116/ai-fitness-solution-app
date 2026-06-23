/**
 * V62 P4 — Issue triage center
 */

import {
  ISSUE_SEVERITIES,
  ISSUE_STATUSES,
  listPilotIssues,
  type IssueSeverity,
  type IssueStatus,
  type PilotIssueRecord,
} from "../store/pilot-issues.store";

export type IssueTriageReport = {
  issues: PilotIssueRecord[];
  bySeverity: Record<IssueSeverity, number>;
  byStatus: Record<IssueStatus, number>;
  blockerCount: number;
  backlogCount: number;
  score: number;
  generatedAt: string;
};

export function buildIssueTriageReport(organizationId?: string): IssueTriageReport {
  const issues = listPilotIssues(organizationId);

  const bySeverity = Object.fromEntries(ISSUE_SEVERITIES.map((s) => [s, 0])) as Record<
    IssueSeverity,
    number
  >;
  const byStatus = Object.fromEntries(ISSUE_STATUSES.map((s) => [s, 0])) as Record<
    IssueStatus,
    number
  >;

  for (const issue of issues) {
    bySeverity[issue.severity]++;
    byStatus[issue.status]++;
  }

  const blockerCount = issues.filter(
    (i) => i.severity === "blocker" && !["resolved", "closed"].includes(i.status),
  ).length;
  const backlogCount = issues.filter((i) =>
    ["new", "triaged", "in_progress"].includes(i.status),
  ).length;

  const penalty = blockerCount * 25 + backlogCount * 5;
  const score = Math.max(0, 100 - penalty);

  return {
    issues,
    bySeverity,
    byStatus,
    blockerCount,
    backlogCount,
    score,
    generatedAt: new Date().toISOString(),
  };
}

export { ISSUE_SEVERITIES, ISSUE_STATUSES };
export type { IssueSeverity, IssueStatus, PilotIssueRecord };

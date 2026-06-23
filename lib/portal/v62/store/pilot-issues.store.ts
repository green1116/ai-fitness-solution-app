/**
 * V62 P4 — Issue triage store
 */

export const ISSUE_SEVERITIES = ["blocker", "high", "medium", "low"] as const;
export type IssueSeverity = (typeof ISSUE_SEVERITIES)[number];

export const ISSUE_STATUSES = [
  "new",
  "triaged",
  "in_progress",
  "resolved",
  "closed",
] as const;

export type IssueStatus = (typeof ISSUE_STATUSES)[number];

export type PilotIssueRecord = {
  id: string;
  organizationId: string;
  userId?: string;
  title: string;
  description: string;
  severity: IssueSeverity;
  status: IssueStatus;
  category?: string;
  createdAt: string;
  updatedAt: string;
};

declare global {
  // eslint-disable-next-line no-var
  var __v62PilotIssues: PilotIssueRecord[] | undefined;
}

function store(): PilotIssueRecord[] {
  globalThis.__v62PilotIssues ||= [];
  return globalThis.__v62PilotIssues;
}

let seq = 0;

export function reportPilotIssue(input: {
  organizationId: string;
  userId?: string;
  title: string;
  description: string;
  severity: IssueSeverity;
  category?: string;
}): PilotIssueRecord {
  const now = new Date().toISOString();
  const record: PilotIssueRecord = {
    id: `pis_${++seq}_${Date.now()}`,
    organizationId: input.organizationId,
    userId: input.userId,
    title: input.title.trim(),
    description: input.description.trim(),
    severity: input.severity,
    status: "new",
    category: input.category,
    createdAt: now,
    updatedAt: now,
  };
  store().push(record);
  return record;
}

export function updateIssueStatus(
  id: string,
  status: IssueStatus,
  severity?: IssueSeverity,
): PilotIssueRecord | null {
  const item = store().find((i) => i.id === id);
  if (!item) return null;
  item.status = status;
  if (severity) item.severity = severity;
  item.updatedAt = new Date().toISOString();
  return item;
}

export function listPilotIssues(organizationId?: string): PilotIssueRecord[] {
  const items = [...store()].reverse();
  return organizationId ? items.filter((i) => i.organizationId === organizationId) : items;
}

export function clearPilotIssuesForTests(): void {
  globalThis.__v62PilotIssues = [];
}

import type { TrialOutcome, TrialRecord } from "./types";

export function buildTrialRecords(input?: { deploymentId?: string }): TrialRecord[] {
  const deploymentId = input?.deploymentId ?? "trial-default";
  const now = new Date();
  const daysAgo = (d: number) => new Date(now.getTime() - d * 86_400_000).toISOString();
  const daysAhead = (d: number) => new Date(now.getTime() + d * 86_400_000).toISOString();

  const samples: Array<{ company: string; outcome: TrialOutcome; startOffset: number; endOffset: number; usage: TrialRecord["usageDuringTrial"] }> = [
    { company: "某酒店集团", outcome: "active", startOffset: 7, endOffset: -7, usage: { projectsCreated: 2, proposalsGenerated: 1, downloads: 3 } },
    { company: "某科技公司", outcome: "converted", startOffset: 30, endOffset: -5, usage: { projectsCreated: 5, proposalsGenerated: 4, downloads: 8 } },
    { company: "某物业公司", outcome: "expired", startOffset: 45, endOffset: 15, usage: { projectsCreated: 1, proposalsGenerated: 0, downloads: 1 } },
  ];

  return samples.map((s, i) => ({
    trialId: `trial-${deploymentId}-${i + 1}`,
    customerId: `customer-${deploymentId}-trial-${i + 1}`,
    companyName: s.company,
    trialStart: daysAgo(s.startOffset),
    trialEnd: s.outcome === "active" ? daysAhead(s.endOffset) : daysAgo(s.endOffset),
    usageDuringTrial: s.usage,
    outcome: s.outcome,
    mode: "readiness-stub" as const,
  }));
}

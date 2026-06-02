import type { CommandReviewDecision, CommandReviewTrail, CommandReviewTrailRecord } from "./types";

export function appendReviewTrailRecord(input: {
  trail: CommandReviewTrail;
  intentId: string;
  action: CommandReviewDecision;
  operator: string;
  detail: string;
  outcome: CommandReviewTrailRecord["outcome"];
}): CommandReviewTrail {
  const record: CommandReviewTrailRecord = {
    recordId: `review-trail-${input.intentId}-${input.trail.records.length}`,
    intentId: input.intentId,
    action: input.action,
    operator: input.operator,
    detail: input.detail,
    outcome: input.outcome,
    timestamp: new Date().toISOString(),
  };

  const records = [...input.trail.records, record];
  const passCount = records.filter((r) => r.outcome === "pass").length;

  return {
    trailId: input.trail.trailId,
    records,
    summary: `records=${records.length} pass=${passCount}`,
  };
}

export function createEmptyReviewTrail(deploymentId: string): CommandReviewTrail {
  return {
    trailId: `command-review-trail-${deploymentId}`,
    records: [],
    summary: "records=0 pass=0",
  };
}

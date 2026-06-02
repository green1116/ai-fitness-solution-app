import type { MilestoneStatus, ProjectMilestone } from "./types";

function buildMilestone(
  id: string,
  name: string,
  status: MilestoneStatus,
  dayOffset: number,
  owner: string,
): ProjectMilestone {
  const dueAt = new Date(Date.now() + dayOffset * 24 * 60 * 60 * 1000).toISOString();
  return {
    milestoneId: id,
    name,
    status,
    dueAt,
    owner,
  };
}

export function buildMilestones(input?: { owner?: string }): ProjectMilestone[] {
  const owner = input?.owner ?? "delivery-owner@aifitness.example";
  return [
    buildMilestone("ms-initiated", "Initiated", "completed", -7, owner),
    buildMilestone("ms-planning", "Planning", "completed", -4, owner),
    buildMilestone("ms-proposal-delivered", "Proposal Delivered", "completed", -1, owner),
    buildMilestone("ms-trial-active", "Trial Active", "in-progress", 3, owner),
    buildMilestone("ms-implementation", "Implementation", "in-progress", 10, owner),
    buildMilestone("ms-completed", "Completed", "planned", 25, owner),
    buildMilestone("ms-renewal", "Renewal", "planned", 40, owner),
  ];
}

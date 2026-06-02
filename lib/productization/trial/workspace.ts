import type { TrialProfile, TrialStatus, TrialWorkspace } from "./types";

const PRODUCT_NAME = "AI Fitness Solution";

function resolveStatus(createdAt: Date, expiresAt: Date): TrialStatus {
  const now = new Date();
  if (now > expiresAt) return "expired";
  if (now < createdAt) return "suspended";
  return "active";
}

export function buildTrialWorkspace(input?: {
  deploymentId?: string;
  organization?: string;
  owner?: string;
  trialDays?: number;
}): TrialWorkspace {
  const deploymentId = input?.deploymentId ?? "trial-workspace-default";
  const createdAt = new Date();
  const trialDays = input?.trialDays ?? 14;
  const expiresAt = new Date(createdAt.getTime() + trialDays * 24 * 60 * 60 * 1000);

  return {
    workspaceId: `trial-ws-${deploymentId}`,
    organization: input?.organization ?? "Demo Organization",
    owner: input?.owner ?? "trial-owner@aifitness.example",
    createdAt: createdAt.toISOString(),
    expiresAt: expiresAt.toISOString(),
    status: resolveStatus(createdAt, expiresAt),
  };
}

export function buildTrialProfile(input?: {
  deploymentId?: string;
  organization?: string;
  owner?: string;
  trialDays?: number;
}): TrialProfile {
  const workspace = buildTrialWorkspace(input);
  return {
    profileId: `trial-profile-${workspace.workspaceId}`,
    productName: PRODUCT_NAME,
    workspace,
    trialDays: input?.trialDays ?? 14,
  };
}

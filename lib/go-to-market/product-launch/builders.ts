import type { LaunchHistoryEntry, ProductLaunch } from "./types";

export function buildCurrentLaunch(input?: { deploymentId?: string }): ProductLaunch {
  const deploymentId = input?.deploymentId ?? "launch-default";
  return {
    launchId: `launch-${deploymentId}`,
    launchVersion: "v17.0",
    status: "active",
    channel: "web",
    lifecycleStage: "activate",
    productName: "AI Fitness Solution GTM",
    launchReadiness: 92,
    mode: "readiness-stub",
  };
}

export function buildLaunchHistory(input?: { deploymentId?: string }): LaunchHistoryEntry[] {
  const deploymentId = input?.deploymentId ?? "launch-default";
  return [
    { entryId: `history-v16-${deploymentId}`, launchVersion: "v16.0", launchedAt: "2026-01-15", channel: "partner", outcome: "customer-success-release" },
    { entryId: `history-v15-${deploymentId}`, launchVersion: "v15.0", launchedAt: "2025-12-01", channel: "direct-sales", outcome: "revenue-ops-release" },
    { entryId: `history-v14-${deploymentId}`, launchVersion: "v14.0", launchedAt: "2025-10-20", channel: "web", outcome: "commercial-delivery-release" },
  ];
}

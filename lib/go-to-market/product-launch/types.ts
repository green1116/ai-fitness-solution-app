import type { GO_TO_MARKET_VERSION, ReadinessStubMode } from "../shared/types";

export const PRODUCT_LAUNCH_RUNTIME_VERSION = "v17.0-product-launch-1" as const;

export const LAUNCH_STATUSES = ["planned", "active", "completed", "archived"] as const;
export type LaunchStatus = (typeof LAUNCH_STATUSES)[number];

export const LAUNCH_CHANNELS = ["web", "partner", "direct-sales", "event"] as const;
export type LaunchChannel = (typeof LAUNCH_CHANNELS)[number];

export const LAUNCH_LIFECYCLE_STAGES = ["prepare", "announce", "activate", "measure"] as const;
export type LaunchLifecycleStage = (typeof LAUNCH_LIFECYCLE_STAGES)[number];

export interface ProductLaunch {
  launchId: string;
  launchVersion: string;
  status: LaunchStatus;
  channel: LaunchChannel;
  lifecycleStage: LaunchLifecycleStage;
  productName: string;
  launchReadiness: number;
  mode: ReadinessStubMode;
}

export interface LaunchHistoryEntry {
  entryId: string;
  launchVersion: string;
  launchedAt: string;
  channel: LaunchChannel;
  outcome: string;
}

export interface ProductLaunchRuntimePayload {
  version: typeof PRODUCT_LAUNCH_RUNTIME_VERSION;
  gtmVersion: typeof GO_TO_MARKET_VERSION;
  currentLaunch: ProductLaunch;
  launchHistory: LaunchHistoryEntry[];
  launchReadiness: number;
  summary: string;
}

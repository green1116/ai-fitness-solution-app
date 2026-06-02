export const COMMAND_PLATFORM_API_VERSION = "v4-a5-a4-command-platform-api-1" as const;

export type CommandPlatformCounts = {
  commands: number;
  approvals: {
    pending: number;
    approved: number;
    rejected: number;
  };
  admission: {
    admitted: number;
    blocked: number;
  };
  bridgeReadiness: {
    ready: number;
    partial: number;
    blocked: number;
    notReady: number;
  };
  audit: {
    command: number;
    review: number;
    admission: number;
    total: number;
  };
};

export type CommandPlatformSummaryBlock = {
  blocked: { count: number; intentIds: string[] };
  admitted: { count: number; intentIds: string[] };
  pending: { count: number; intentIds: string[] };
};

export type CommandApiEnvelope<T> = {
  version: typeof COMMAND_PLATFORM_API_VERSION;
  platformStatus: string;
  deploymentId: string;
  counts: CommandPlatformCounts;
  blockedSummary: CommandPlatformSummaryBlock["blocked"];
  admittedSummary: CommandPlatformSummaryBlock["admitted"];
  pendingSummary: CommandPlatformSummaryBlock["pending"];
  data: T;
};

export type CommandReviewAction =
  | "approve"
  | "reject"
  | "override"
  | "suspend"
  | "cancel"
  | "escalate"
  | "rollback-request"
  | "confirm";

export type CommandControlAction =
  | "suspend"
  | "cancel"
  | "override"
  | "escalate"
  | "rollback-request";

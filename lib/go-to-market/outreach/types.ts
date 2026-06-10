import type { GO_TO_MARKET_VERSION, ReadinessStubMode } from "../shared/types";

export const OUTREACH_RUNTIME_VERSION = "v17.0-outreach-runtime-1" as const;

export const OUTREACH_CHANNELS = ["email", "demo", "follow-up", "proposal-sharing"] as const;
export type OutreachChannel = (typeof OUTREACH_CHANNELS)[number];

export const OUTREACH_OUTCOMES = ["responded", "scheduled", "converted", "no-response"] as const;
export type OutreachOutcome = (typeof OUTREACH_OUTCOMES)[number];

export interface OutreachRecord {
  recordId: string;
  channel: OutreachChannel;
  action: string;
  response: string;
  outcome: OutreachOutcome;
  leadId: string;
  mode: ReadinessStubMode;
}

export interface OutreachRuntimePayload {
  version: typeof OUTREACH_RUNTIME_VERSION;
  gtmVersion: typeof GO_TO_MARKET_VERSION;
  records: OutreachRecord[];
  responseRate: number;
  conversionRate: number;
  summary: string;
}

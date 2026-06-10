import type { REVENUE_OPERATIONS_VERSION, ReadinessStubMode } from "../shared/types";

export const LEAD_RUNTIME_VERSION = "v15.0-lead-runtime-1" as const;

export const LEAD_STATUSES = ["new", "qualified", "contacted", "converted", "lost"] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

export const LEAD_SOURCES = ["website", "referral", "trade-show", "partner", "inbound"] as const;
export type LeadSource = (typeof LEAD_SOURCES)[number];

export interface Lead {
  leadId: string;
  source: LeadSource;
  status: LeadStatus;
  score: number;
  companyName: string;
  contactName: string;
  mode: ReadinessStubMode;
}

export interface LeadRuntimePayload {
  version: typeof LEAD_RUNTIME_VERSION;
  revOpsVersion: typeof REVENUE_OPERATIONS_VERSION;
  leads: Lead[];
  leadCount: number;
  summary: string;
}

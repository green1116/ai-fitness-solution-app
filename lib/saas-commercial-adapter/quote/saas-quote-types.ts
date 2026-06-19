import type { TenantContext } from "@/lib/saas-runtime/tenant-context/context-types";
import type { V47CommercialContext } from "../mapping/tenant-to-v47-mapper";
import type { SaasQuoteSource, SaasQuoteStatus } from "../shared/constants";

export interface SaasQuote {
  id: string;
  tenantId: string;
  workspaceId: string;
  source: SaasQuoteSource;
  status: SaasQuoteStatus;
  payload: unknown;
}

export interface SaasQuoteSnapshot {
  quoteId: string;
  snapshot: unknown;
  createdAt: Date;
}

export interface SaasQuoteCreateInput {
  tenantId: string;
  workspaceId: string;
  source?: SaasQuoteSource;
  payload: unknown;
  quoteId?: string;
}

export interface HydrateQuoteInput {
  quoteId: string;
  tenantId?: string;
}

export interface HydrateQuoteResult {
  quoteId: string;
  snapshot: SaasQuoteSnapshot;
  status: "hydrated";
}

export interface ExecuteCommercialQuoteInput {
  quoteId: string;
  ctx: TenantContext;
}

export interface ExecuteCommercialQuoteResult {
  quoteId: string;
  status: "executed";
  v47Context: V47CommercialContext;
  result: unknown;
}

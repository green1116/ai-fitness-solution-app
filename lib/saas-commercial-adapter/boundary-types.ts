/**
 * V47 Commercial Engine bridge boundary.
 * Phase 1: types only. Phase 4 will implement runtime hydration.
 */

/** SaaS-side quote bridge record (persisted in P4, typed in P1). */
export interface SaasQuoteBridgeRecord {
  tenantId: string;
  workspaceId: string;
  quoteId: string;
  payload: unknown;
}

/** Input for future V47 snapshot hydration (P4 only). */
export interface V47HydrateInput {
  quoteId: string;
  snapshot: unknown;
}

/** Future bridge contract; no V47 imports in Phase 1. */
export interface CommercialEngineBridge {
  hydrateQuote(input: V47HydrateInput): Promise<void>;
  executeQuoteCreate(input: unknown): Promise<unknown>;
}

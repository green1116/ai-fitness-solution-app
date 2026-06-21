export type QuoteProductExecutionStatus = "RUNNING" | "DONE" | "FAILED";

export interface QuoteProductContext {
  workspaceId: string;
  tenantId?: string;
  sessionId?: string;
  quoteId?: string;
}

export interface QuoteProductResult {
  success: boolean;
  executionId?: string;
  status: QuoteProductExecutionStatus;
  error?: string;
  quoteId?: string;
  logs?: string[];
}

export interface QuoteProductSubmission {
  context: QuoteProductContext;
  title?: string;
}

export type QuoteProductSurfaceStatus = QuoteProductExecutionStatus | "IDLE";

export interface QuoteProductSurface {
  context: QuoteProductContext;
  workspaceId: string;
  title: string;
  portalRoute: string;
  productStatus: QuoteProductSurfaceStatus;
}

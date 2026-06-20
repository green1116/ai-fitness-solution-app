export interface QuoteApiExposurePort {
  getQuoteSurface(workspaceId: string): unknown;
  getQuoteReadiness(workspaceId: string): string;
}

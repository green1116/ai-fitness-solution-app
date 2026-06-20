export type QuoteCommercialEligibility = "ELIGIBLE" | "INELIGIBLE";

export interface QuoteCommercialSurfaceFlags {
  eligible: boolean;
  visible: boolean;
  active: boolean;
}

export interface QuoteCommercialPort {
  getQuoteEligibility(workspaceId: string): QuoteCommercialEligibility;
  getQuoteSurfaceFlags(workspaceId: string): QuoteCommercialSurfaceFlags;
}

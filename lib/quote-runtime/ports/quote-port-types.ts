import type { QuoteApiExposurePort } from "./quote-api-exposure.port";
import type { QuoteCommercialPort } from "./quote-commercial.port";
import type { QuotePersistencePort } from "./quote-persistence.port";

export type { QuoteApiExposurePort } from "./quote-api-exposure.port";
export type { QuoteCommercialEligibility, QuoteCommercialPort, QuoteCommercialSurfaceFlags } from "./quote-commercial.port";
export type { QuotePersistencePort } from "./quote-persistence.port";

export interface QuotePortRegistry {
  persistence: QuotePersistencePort;
  api: QuoteApiExposurePort;
  commercial: QuoteCommercialPort;
}

export interface QuotePortValidation {
  valid: boolean;
  summary: string;
}

export type QuotePortRegistryStub = Readonly<QuotePortRegistry>;

import type { QuoteSnapshot } from "../shared/types";
import type {
  DeliverablePdfSource,
  DeliverableRouteType,
} from "../shared/deliverable-types";

export type { DeliverableRouteType as DeliverableType, DeliverablePdfSource };

export interface DeliverablePdfRequest {
  type: DeliverableRouteType;
  quoteId: string;
  planId?: string;
  budgetId?: string;
  snapshot?: QuoteSnapshot;
}

export interface DeliverablePdfResult {
  filename: string;
  mimeType: "application/pdf" | "application/zip";
  buffer: Uint8Array;
  source: DeliverablePdfSource;
}

export interface DeliverableRoutingContext {
  quoteId: string;
  type: DeliverableRouteType;
  planId: string;
  budgetId: string;
  projectName: string;
  sku?: string;
  hasSnapshot: boolean;
}

export interface CommercialDeliverableRouterValidation {
  valid: boolean;
  summaryRouteOk: boolean;
  planRouteOk: boolean;
  budgetRouteOk: boolean;
  zipRouteOk: boolean;
  apiPathRegistered: boolean;
  summary: string;
}

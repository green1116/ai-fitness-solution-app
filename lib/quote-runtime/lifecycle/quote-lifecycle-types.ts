import type { QuoteDomainView } from "../domain/quote-domain-types";

export type QuoteLifecyclePhase = QuoteDomainView["lifecyclePhase"];

export type QuoteLifecycleStatus = "PENDING" | "OPEN" | "READY";

export const QUOTE_LIFECYCLE_FOUNDATION_PHASE_VALUES: QuoteLifecyclePhase[] = [
  "INTAKE",
  "DRAFT",
  "REVIEW",
];

export const QUOTE_LIFECYCLE_STATUS_VALUES: QuoteLifecycleStatus[] = ["PENDING", "OPEN", "READY"];

export interface QuoteLifecycleView {
  workspaceId: string;
  version: string;
  lifecyclePhase: QuoteLifecyclePhase;
  lifecycleStatus: QuoteLifecycleStatus;
  quoteReadiness: QuoteDomainView["quoteReadiness"];
  domainState: QuoteDomainView["domainState"];
}

export interface QuoteLifecycleRegistryEntry {
  workspaceId: string;
  view: QuoteLifecycleView;
}

export interface QuoteLifecycleRegistry {
  register(view: QuoteLifecycleView): QuoteLifecycleRegistryEntry;
  resolve(workspaceId: string): QuoteLifecycleView | undefined;
  has(workspaceId: string): boolean;
  clear(): void;
}

export interface QuoteLifecycleFactory {
  createView(domainView: QuoteDomainView): QuoteLifecycleView;
}

export interface QuoteLifecycleValidation {
  valid: boolean;
  summary: string;
}

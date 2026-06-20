import type { QuoteContextSnapshot } from "../context/quote-context-snapshot";

export type QuoteDomainReadiness = QuoteContextSnapshot["quoteReadiness"];

export type QuoteDomainLifecyclePhase = QuoteContextSnapshot["lifecyclePhase"];

export type QuoteDomainState = QuoteContextSnapshot["domainState"];

export const QUOTE_DOMAIN_READINESS_VALUES: QuoteDomainReadiness[] = ["READY", "PARTIAL", "BLOCKED"];

export const QUOTE_DOMAIN_LIFECYCLE_PHASE_VALUES: QuoteDomainLifecyclePhase[] = [
  "INTAKE",
  "DRAFT",
  "REVIEW",
];

export const QUOTE_DOMAIN_STATE_VALUES: QuoteDomainState[] = ["ACTIVE", "SHELL", "SUSPENDED"];

export interface QuoteDomainView {
  workspaceId: string;
  version: string;
  quoteReadiness: QuoteDomainReadiness;
  lifecyclePhase: QuoteDomainLifecyclePhase;
  domainState: QuoteDomainState;
  surfaceEligible: boolean;
  surfaceVisible: boolean;
  surfaceActive: boolean;
}

export interface QuoteDomainRegistryEntry {
  workspaceId: string;
  view: QuoteDomainView;
}

export interface QuoteDomainRegistry {
  register(view: QuoteDomainView): QuoteDomainRegistryEntry;
  resolve(workspaceId: string): QuoteDomainView | undefined;
  has(workspaceId: string): boolean;
  clear(): void;
}

export interface QuoteDomainFactory {
  createView(snapshot: QuoteContextSnapshot): QuoteDomainView;
}

export interface QuoteDomainValidation {
  valid: boolean;
  summary: string;
}

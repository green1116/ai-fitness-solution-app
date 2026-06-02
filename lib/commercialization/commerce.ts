/** RC1 compat entry — @/lib/commercialization/commerce */
export {
  COMMERCE_FOUNDATION_VERSION,
  runCommercialCommerceFoundation,
} from "./_rc1-foundation-compat";

import { runCommercialCommerceFoundation } from "./_rc1-foundation-compat";

type CommercialCommerceFoundationResult = ReturnType<
  typeof runCommercialCommerceFoundation
>;

export function formatCommercialTermsReadyHook(
  result: CommercialCommerceFoundationResult,
): string {
  return result.quotable
    ? `commercial-terms-ready=${result.version}`
    : "commercial-terms-ready=false";
}

export function formatPricingSurfaceReadyHook(
  result: CommercialCommerceFoundationResult,
): string {
  return result.quotable
    ? `pricing-surface-ready=${result.version}`
    : "pricing-surface-ready=false";
}

export function formatPricingTableReadyHook(
  result: CommercialCommerceFoundationResult,
): string {
  return result.quotable
    ? `pricing-table-ready=${result.version}`
    : "pricing-table-ready=false";
}

export function formatQuoteBuilderReadyHook(
  result: CommercialCommerceFoundationResult,
): string {
  return result.quotable
    ? `quote-builder-ready=${result.version}`
    : "quote-builder-ready=false";
}

export * from "./shared/constants";
export * from "./quote/saas-quote-types";
export {
  saveSaasQuote,
  getSaasQuote,
  updateSaasQuoteStatus,
  saveSaasQuoteSnapshot,
  getSaasQuoteSnapshot,
  assertSaasQuoteTenant,
  clearSaasQuoteRepository,
  getSaasQuoteRepositorySize,
} from "./quote/saas-quote-repository";
export { mapTenantToV47Context } from "./mapping/tenant-to-v47-mapper";
export type { V47CommercialContext } from "./mapping/tenant-to-v47-mapper";
export { hydrateQuote } from "./bridge/quote-hydrator";
export { executeCommercialQuote } from "./bridge/commercial-executor";
export * from "./boundary-types";

export const SAAS_COMMERCIAL_ADAPTER_META = {
  version: "v48-saas-commercial-adapter-p4",
  tag: "v48-saas-commercial-adapter-p4",
  v47Mode: "read-only-call",
} as const;

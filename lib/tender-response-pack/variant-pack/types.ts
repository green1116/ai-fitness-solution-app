import type { TENDER_RESPONSE_PACK_VERSION } from "../shared/types";
import type { TenderResponsePack } from "../response-pack-assembly/types";

export const VARIANT_PACK_RUNTIME_VERSION = "v19.6-variant-pack-1" as const;

export interface VariantPackRuntimePayload {
  version: typeof VARIANT_PACK_RUNTIME_VERSION;
  packVersion: typeof TENDER_RESPONSE_PACK_VERSION;
  responsePacks: TenderResponsePack[];
  variantCount: number;
  variantSpreadScore: number;
  summary: string;
}

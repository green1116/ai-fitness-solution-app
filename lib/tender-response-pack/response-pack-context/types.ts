import type { TENDER_RESPONSE_PACK_VERSION } from "../shared/types";
import type { ResponsePackContext } from "../bridge/response-bridge";

export const RESPONSE_PACK_CONTEXT_RUNTIME_VERSION = "v19.6-response-pack-context-1" as const;

export interface ResponsePackContextRuntimePayload {
  version: typeof RESPONSE_PACK_CONTEXT_RUNTIME_VERSION;
  packVersion: typeof TENDER_RESPONSE_PACK_VERSION;
  context: ResponsePackContext;
  contextReadiness: number;
  summary: string;
}

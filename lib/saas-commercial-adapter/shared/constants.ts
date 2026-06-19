export const SAAS_COMMERCIAL_ADAPTER_VERSION = "v48-saas-commercial-adapter-p4" as const;
export const SAAS_COMMERCIAL_ADAPTER_P4_TAG = "v48-saas-commercial-adapter-p4" as const;

export const SAAS_QUOTE_STATUS = ["draft", "hydrated", "executed"] as const;
export type SaasQuoteStatus = (typeof SAAS_QUOTE_STATUS)[number];

export const SAAS_QUOTE_SOURCE = ["manual", "import", "generated"] as const;
export type SaasQuoteSource = (typeof SAAS_QUOTE_SOURCE)[number];

export const SAAS_ADAPTER_ERROR_CODES = {
  QUOTE_NOT_FOUND: "QUOTE_NOT_FOUND",
  SNAPSHOT_IMMUTABLE: "SNAPSHOT_IMMUTABLE",
  TENANT_MISMATCH: "TENANT_MISMATCH",
  PERMISSION_DENIED: "PERMISSION_DENIED",
  INVALID_PAYLOAD: "INVALID_PAYLOAD",
  HYDRATE_FAILED: "HYDRATE_FAILED",
  EXECUTE_FAILED: "EXECUTE_FAILED",
} as const;

export class SaasCommercialAdapterError extends Error {
  readonly code: (typeof SAAS_ADAPTER_ERROR_CODES)[keyof typeof SAAS_ADAPTER_ERROR_CODES];

  constructor(
    code: (typeof SAAS_ADAPTER_ERROR_CODES)[keyof typeof SAAS_ADAPTER_ERROR_CODES],
    message: string,
  ) {
    super(message);
    this.name = "SaasCommercialAdapterError";
    this.code = code;
  }
}

export const REQUIRED_EXECUTE_PERMISSIONS = ["quote:create", "delivery:execute"] as const;

export const QUOTE_ERROR_PERSISTENCE = "PERSISTENCE_ERROR" as const;
export const QUOTE_ERROR_API_EXPOSURE = "API_EXPOSURE_ERROR" as const;
export const QUOTE_ERROR_WORKFLOW = "WORKFLOW_ERROR" as const;
export const QUOTE_ERROR_VALIDATION = "VALIDATION_ERROR" as const;
export const QUOTE_ERROR_UNKNOWN = "UNKNOWN_ERROR" as const;

export type QuoteErrorType =
  | typeof QUOTE_ERROR_PERSISTENCE
  | typeof QUOTE_ERROR_API_EXPOSURE
  | typeof QUOTE_ERROR_WORKFLOW
  | typeof QUOTE_ERROR_VALIDATION
  | typeof QUOTE_ERROR_UNKNOWN;

export const QUOTE_ERROR_TYPE_VALUES: QuoteErrorType[] = [
  QUOTE_ERROR_PERSISTENCE,
  QUOTE_ERROR_API_EXPOSURE,
  QUOTE_ERROR_WORKFLOW,
  QUOTE_ERROR_VALIDATION,
  QUOTE_ERROR_UNKNOWN,
];

export interface QuoteError {
  type: QuoteErrorType;
  message: string;
  recoverable: boolean;
  timestamp: string;
}

export function createQuoteError(input: {
  type: QuoteErrorType;
  message: string;
  recoverable?: boolean;
  timestamp?: string;
}): QuoteError {
  return {
    type: input.type,
    message: input.message,
    recoverable: input.recoverable ?? isRecoverableQuoteError(input.type),
    timestamp: input.timestamp ?? new Date().toISOString(),
  };
}

export function isRecoverableQuoteError(type: QuoteErrorType): boolean {
  return type === QUOTE_ERROR_PERSISTENCE || type === QUOTE_ERROR_API_EXPOSURE;
}

export function describeQuoteError(error: QuoteError): string {
  return `[${error.type}] ${error.message}`;
}

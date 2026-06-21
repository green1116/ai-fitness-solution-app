export interface QuoteErrorSurface {
  code: string;
  message: string;
  retryable: boolean;
  visible: boolean;
}

export function buildQuoteErrorSurface(input: {
  message?: string;
  code?: string;
  retryable?: boolean;
}): QuoteErrorSurface | undefined {
  const message = input.message?.trim();
  if (!message) {
    return undefined;
  }

  return {
    code: input.code?.trim() || "QUOTE_UI_ERROR",
    message,
    retryable: input.retryable ?? false,
    visible: true,
  };
}

export function normalizeQuoteUIError(
  input: unknown,
  fallbackCode = "QUOTE_UI_ERROR",
): QuoteErrorSurface {
  if (typeof input === "string" && input.trim().length > 0) {
    return {
      code: fallbackCode,
      message: input.trim(),
      retryable: false,
      visible: true,
    };
  }

  if (input instanceof Error) {
    return {
      code: fallbackCode,
      message: input.message,
      retryable: false,
      visible: true,
    };
  }

  return {
    code: fallbackCode,
    message: "Quote UI error",
    retryable: false,
    visible: true,
  };
}

export function clearQuoteErrorSurface(): undefined {
  return undefined;
}

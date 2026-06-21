import type { QuoteErrorType } from "./quote-error";
import { QUOTE_ERROR_API_EXPOSURE, QUOTE_ERROR_PERSISTENCE } from "./quote-error";

export const QUOTE_RETRY_POLICY_NONE = "NONE" as const;
export const QUOTE_RETRY_POLICY_IMMEDIATE = "IMMEDIATE" as const;
export const QUOTE_RETRY_POLICY_EXPONENTIAL_BACKOFF = "EXPONENTIAL_BACKOFF" as const;

export type QuoteRetryPolicyType =
  | typeof QUOTE_RETRY_POLICY_NONE
  | typeof QUOTE_RETRY_POLICY_IMMEDIATE
  | typeof QUOTE_RETRY_POLICY_EXPONENTIAL_BACKOFF;

export const QUOTE_RETRY_POLICY_VALUES: QuoteRetryPolicyType[] = [
  QUOTE_RETRY_POLICY_NONE,
  QUOTE_RETRY_POLICY_IMMEDIATE,
  QUOTE_RETRY_POLICY_EXPONENTIAL_BACKOFF,
];

export interface QuoteRetryPolicy {
  type: QuoteRetryPolicyType;
  maxAttempts: number;
  baseDelayMs: number;
  retryableErrors: QuoteErrorType[];
}

export const DEFAULT_QUOTE_RETRY_POLICY: QuoteRetryPolicy = {
  type: QUOTE_RETRY_POLICY_IMMEDIATE,
  maxAttempts: 2,
  baseDelayMs: 100,
  retryableErrors: [QUOTE_ERROR_PERSISTENCE, QUOTE_ERROR_API_EXPOSURE],
};

export function createQuoteRetryPolicy(
  overrides: Partial<QuoteRetryPolicy> = {},
): QuoteRetryPolicy {
  return {
    ...DEFAULT_QUOTE_RETRY_POLICY,
    ...overrides,
  };
}

export function resolveRetryAttempts(policy: QuoteRetryPolicy): number {
  if (policy.type === QUOTE_RETRY_POLICY_NONE) {
    return 1;
  }
  return Math.max(1, policy.maxAttempts);
}

export function resolveRetryDelayMs(policy: QuoteRetryPolicy, attempt: number): number {
  if (policy.type === QUOTE_RETRY_POLICY_NONE) {
    return 0;
  }
  if (policy.type === QUOTE_RETRY_POLICY_IMMEDIATE) {
    return 0;
  }
  return policy.baseDelayMs * 2 ** Math.max(0, attempt - 1);
}

export interface QuoteRetryAttemptRecord {
  attempt: number;
  delayMs: number;
  succeeded: boolean;
}

export function executeWithQuoteRetryPolicy<T>(input: {
  policy: QuoteRetryPolicy;
  operation: () => T;
  isSuccess: (result: T) => boolean;
  onAttempt?: (record: QuoteRetryAttemptRecord) => void;
}): { result: T; attempts: number; attemptRecords: QuoteRetryAttemptRecord[] } {
  const maxAttempts = resolveRetryAttempts(input.policy);
  const attemptRecords: QuoteRetryAttemptRecord[] = [];
  let lastResult = input.operation();

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const delayMs = resolveRetryDelayMs(input.policy, attempt);
    const succeeded = input.isSuccess(lastResult);
    const record: QuoteRetryAttemptRecord = { attempt, delayMs, succeeded };
    attemptRecords.push(record);
    input.onAttempt?.(record);

    if (succeeded || attempt === maxAttempts) {
      return { result: lastResult, attempts: attempt, attemptRecords };
    }

    lastResult = input.operation();
  }

  return { result: lastResult, attempts: maxAttempts, attemptRecords };
}

export function describeQuoteRetryPolicy(policy: QuoteRetryPolicy): string {
  return `retryPolicy=${policy.type} maxAttempts=${policy.maxAttempts}`;
}

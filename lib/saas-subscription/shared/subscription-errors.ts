import { SUBSCRIPTION_ERROR_CODES, type SubscriptionErrorCode } from "./subscription-types";

export class SaasSubscriptionError extends Error {
  readonly code: SubscriptionErrorCode;

  constructor(code: SubscriptionErrorCode, message: string) {
    super(message);
    this.name = "SaasSubscriptionError";
    this.code = code;
  }
}

export function isSaasSubscriptionError(error: unknown): error is SaasSubscriptionError {
  return error instanceof SaasSubscriptionError;
}

export { SUBSCRIPTION_ERROR_CODES };

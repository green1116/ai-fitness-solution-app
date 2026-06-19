import { SAAS_ERROR_CODES, SaasFoundationError } from "../shared/errors";
import { SAAS_PLANS } from "./plan-catalog";

const PLAN_CODE_PATTERN = /^[a-z0-9_]+$/;

export function isValidPlanCode(code: string): boolean {
  return PLAN_CODE_PATTERN.test(code);
}

export function validatePlanCatalog(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const codes = new Set<string>();

  for (const plan of SAAS_PLANS) {
    if (!isValidPlanCode(plan.code)) {
      errors.push(`invalid plan code: ${plan.code}`);
    }
    if (codes.has(plan.code)) {
      errors.push(`duplicate plan code: ${plan.code}`);
    }
    codes.add(plan.code);
  }

  return { valid: errors.length === 0, errors };
}

export function assertValidSubscriptionPeriod(start: Date, end: Date): void {
  if (!(start instanceof Date) || !(end instanceof Date) || end <= start) {
    throw new SaasFoundationError(
      SAAS_ERROR_CODES.INVALID_SUBSCRIPTION_PERIOD,
      "Subscription currentPeriodEnd must be after currentPeriodStart",
    );
  }
}

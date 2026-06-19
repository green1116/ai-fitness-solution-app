import {
  SaasLifecycleError,
  SAAS_LIFECYCLE_ERROR_CODES,
  TRIAL_DURATION_DAYS,
  TRIAL_PLAN_CODE,
} from "../shared/constants";
import type { BootstrapTrialSubscriptionInput } from "../shared/types";
import type { SaasLifecycleDb } from "../tenant/create-tenant";

export async function bootstrapTrialSubscription(db: SaasLifecycleDb, input: BootstrapTrialSubscriptionInput) {
  const trialPlan = await db.saasPlan.findUnique({
    where: { code: TRIAL_PLAN_CODE },
  });

  if (!trialPlan) {
    throw new SaasLifecycleError(
      SAAS_LIFECYCLE_ERROR_CODES.TRIAL_PLAN_NOT_FOUND,
      `Plan not found: ${TRIAL_PLAN_CODE}`,
    );
  }

  const currentPeriodStart = new Date();
  const currentPeriodEnd = new Date(Date.now() + TRIAL_DURATION_DAYS * 24 * 3600 * 1000);

  return db.saasSubscription.create({
    data: {
      tenantId: input.tenantId,
      planId: trialPlan.id,
      status: "trialing",
      currentPeriodStart,
      currentPeriodEnd,
    },
  });
}

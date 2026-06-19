import type { PrismaClient } from "@prisma/client";
import { SAAS_PLANS } from "../subscription/plan-catalog";

export async function seedPlans(db: PrismaClient): Promise<number> {
  for (const plan of SAAS_PLANS) {
    await db.saasPlan.upsert({
      where: { code: plan.code },
      create: {
        code: plan.code,
        name: plan.name,
        priceMonthly: plan.priceMonthly,
        features: plan.features,
        quotas: plan.quotas,
        isActive: true,
      },
      update: {
        name: plan.name,
        priceMonthly: plan.priceMonthly,
        features: plan.features,
        quotas: plan.quotas,
        isActive: true,
      },
    });
  }
  return SAAS_PLANS.length;
}

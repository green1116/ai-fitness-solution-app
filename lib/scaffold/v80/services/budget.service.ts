/** @scaffold BLP-API-003 → budget calculation */
import { randomUUID } from "node:crypto";

import { V80RuntimeError } from "../runtime/errors";
import { withV80Lock } from "../runtime/lock";
import { budgetIdempotencyKey, v80Persist } from "../runtime/store";

export type CalculateBudgetInput = {
  quoteId: string;
  companySize: number;
  budgetTier: "low" | "mid" | "high";
  organizationId: string;
};

const TIER_RATE: Record<CalculateBudgetInput["budgetTier"], number> = {
  low: 500,
  mid: 800,
  high: 1200,
};

export async function calculateBudgetScaffold(input: CalculateBudgetInput) {
  const idempotencyKey = budgetIdempotencyKey(input);

  return withV80Lock(`budget:${input.quoteId}`, async () => {
    const existing = await v80Persist.findBudgetByIdempotency(idempotencyKey);
    if (existing) {
      return {
        budgetId: existing.id,
        totals: {
          equipment: existing.totalAmount,
          tier: existing.tier,
          companySize: existing.companySize,
        },
        idempotent: true as const,
      };
    }

    const quote = await v80Persist.getQuote(input.quoteId);
    if (!quote) {
      throw new V80RuntimeError("Quote not found", "QUOTE_NOT_FOUND", 404);
    }
    if (quote.organizationId !== input.organizationId) {
      throw new V80RuntimeError("Quote org mismatch", "FORBIDDEN", 403);
    }

    const org = await v80Persist.getOrg(input.organizationId);
    if (!org) {
      throw new V80RuntimeError("Organization not found", "NO_SUBSCRIPTION", 404);
    }
    if (org.plan === "BASIC") {
      throw new V80RuntimeError("Budget feature not enabled", "FEATURE_GATE", 403);
    }

    const totalAmount = Math.round(input.companySize * TIER_RATE[input.budgetTier]);
    const budgetId = randomUUID();

    await v80Persist.saveBudget({
      id: budgetId,
      quoteId: input.quoteId,
      tier: input.budgetTier,
      companySize: input.companySize,
      totalAmount,
      idempotencyKey,
      createdAt: new Date(),
    });

    await v80Persist.incrementUsage(input.organizationId, "budget_calculate");

    return {
      budgetId,
      totals: { equipment: totalAmount, tier: input.budgetTier, companySize: input.companySize },
    };
  });
}

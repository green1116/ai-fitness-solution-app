import type { QuoteSnapshot } from "@/lib/commercial-products/access-layer/shared/types";
import { requirePermission } from "@/lib/saas-rbac/guards/require-permission";
import { consumeQuota } from "@/lib/saas-subscription/quota/quota-consumer";
import { requireFeature } from "@/lib/saas-subscription/runtime/require-feature";
import { requireQuota } from "@/lib/saas-subscription/runtime/require-quota";
import {
  SAAS_ADAPTER_ERROR_CODES,
  SaasCommercialAdapterError,
} from "../shared/constants";
import type { ExecuteCommercialQuoteInput, ExecuteCommercialQuoteResult } from "../quote/saas-quote-types";
import { assertSaasQuoteTenant, getSaasQuote, updateSaasQuoteStatus } from "../quote/saas-quote-repository";
import { hydrateQuote } from "./quote-hydrator";
import { mapTenantToV47Context } from "../mapping/tenant-to-v47-mapper";

async function loadV47QuoteEngine() {
  return import("@/lib/commercial-products/access-layer/quote/quote-service");
}

function assertExecuteSubscription(ctx: ExecuteCommercialQuoteInput["ctx"]): void {
  try {
    requireFeature(ctx, "commercial.quote");
    requireQuota(ctx, "commercial.quote");
  } catch (error) {
    throw new SaasCommercialAdapterError(
      SAAS_ADAPTER_ERROR_CODES.PERMISSION_DENIED,
      error instanceof Error ? error.message : "Subscription check failed",
    );
  }
}

function assertExecutePermissions(ctx: ExecuteCommercialQuoteInput["ctx"]): void {
  try {
    requirePermission(ctx, "quote:create");
    requirePermission(ctx, "delivery:execute");
  } catch (error) {
    throw new SaasCommercialAdapterError(
      SAAS_ADAPTER_ERROR_CODES.PERMISSION_DENIED,
      error instanceof Error ? error.message : "Permission denied",
    );
  }
}

export async function executeCommercialQuote(
  input: ExecuteCommercialQuoteInput,
): Promise<ExecuteCommercialQuoteResult> {
  const quote = getSaasQuote(input.quoteId);
  if (!quote) {
    throw new SaasCommercialAdapterError(
      SAAS_ADAPTER_ERROR_CODES.QUOTE_NOT_FOUND,
      `Quote not found: ${input.quoteId}`,
    );
  }

  assertSaasQuoteTenant(quote, input.ctx.tenantId);
  assertExecutePermissions(input.ctx);
  assertExecuteSubscription(input.ctx);

  const v47Context = mapTenantToV47Context(input.ctx);

  try {
    consumeQuota(input.ctx.tenantId, "commercial.quote", 1);

    const hydrated = await hydrateQuote({
      quoteId: input.quoteId,
      tenantId: input.ctx.tenantId,
    });

    const snapshot = hydrated.snapshot.snapshot as QuoteSnapshot;
    const { createQuote } = await loadV47QuoteEngine();
    const result = createQuote(snapshot.inputs);

    updateSaasQuoteStatus(input.quoteId, "executed");

    return {
      quoteId: input.quoteId,
      status: "executed",
      v47Context,
      result,
    };
  } catch (error) {
    if (error instanceof SaasCommercialAdapterError) throw error;
    throw new SaasCommercialAdapterError(
      SAAS_ADAPTER_ERROR_CODES.EXECUTE_FAILED,
      error instanceof Error ? error.message : "executeCommercialQuote failed",
    );
  }
}

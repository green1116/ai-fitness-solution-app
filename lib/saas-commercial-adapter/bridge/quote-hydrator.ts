import type { QuoteRequest, QuoteSnapshot } from "@/lib/commercial-products/access-layer/shared/types";
import { PRODUCT_SKU } from "@/lib/commercial-products/shared/constants";
import {
  SAAS_ADAPTER_ERROR_CODES,
  SaasCommercialAdapterError,
} from "../shared/constants";
import type { HydrateQuoteInput, HydrateQuoteResult } from "../quote/saas-quote-types";
import {
  assertSaasQuoteTenant,
  getSaasQuote,
  getSaasQuoteSnapshot,
  saveSaasQuoteSnapshot,
  updateSaasQuoteStatus,
} from "../quote/saas-quote-repository";

async function loadV47SnapshotRegistry() {
  return import("@/lib/commercial-products/access-layer/pdf/quote-snapshot-registry");
}

async function loadV47QuoteEngine() {
  return import("@/lib/commercial-products/access-layer/quote/quote-service");
}

function isQuoteRequest(payload: unknown): payload is QuoteRequest {
  if (!payload || typeof payload !== "object") return false;
  const value = payload as Record<string, unknown>;
  return (
    typeof value.projectName === "string" &&
    typeof value.areaSqm === "number" &&
    typeof value.headcount === "number" &&
    typeof value.budgetCny === "number" &&
    typeof value.sku === "string" &&
    PRODUCT_SKU.includes(value.sku as (typeof PRODUCT_SKU)[number])
  );
}

function isQuoteSnapshot(payload: unknown): payload is QuoteSnapshot {
  if (!payload || typeof payload !== "object") return false;
  const value = payload as Record<string, unknown>;
  return (
    typeof value.quoteId === "string" &&
    typeof value.sku === "string" &&
    typeof value.price === "number" &&
    value.inputs != null &&
    typeof value.createdAt === "string"
  );
}

async function normalizeV47Snapshot(quoteId: string, payload: unknown): Promise<QuoteSnapshot> {
  if (isQuoteSnapshot(payload)) {
    return payload.quoteId === quoteId ? payload : { ...payload, quoteId };
  }

  if (isQuoteRequest(payload)) {
    const { createQuote } = await loadV47QuoteEngine();
    const response = createQuote(payload);
    return response.snapshot.quoteId === quoteId
      ? response.snapshot
      : { ...response.snapshot, quoteId };
  }

  throw new SaasCommercialAdapterError(
    SAAS_ADAPTER_ERROR_CODES.INVALID_PAYLOAD,
    `Unable to normalize V47 snapshot for quoteId=${quoteId}`,
  );
}

export async function hydrateQuote(input: HydrateQuoteInput): Promise<HydrateQuoteResult> {
  const quote = getSaasQuote(input.quoteId);
  if (!quote) {
    throw new SaasCommercialAdapterError(
      SAAS_ADAPTER_ERROR_CODES.QUOTE_NOT_FOUND,
      `Quote not found: ${input.quoteId}`,
    );
  }

  if (input.tenantId) {
    assertSaasQuoteTenant(quote, input.tenantId);
  }

  try {
    const existing = getSaasQuoteSnapshot(input.quoteId);
    const snapshotRecord =
      existing ??
      saveSaasQuoteSnapshot({
        quoteId: input.quoteId,
        snapshot: await normalizeV47Snapshot(input.quoteId, quote.payload),
        createdAt: new Date(),
      });

    const { registerQuoteSnapshot } = await loadV47SnapshotRegistry();
    registerQuoteSnapshot(snapshotRecord.snapshot as QuoteSnapshot);

    updateSaasQuoteStatus(input.quoteId, "hydrated");

    return {
      quoteId: input.quoteId,
      snapshot: snapshotRecord,
      status: "hydrated",
    };
  } catch (error) {
    if (error instanceof SaasCommercialAdapterError) throw error;
    throw new SaasCommercialAdapterError(
      SAAS_ADAPTER_ERROR_CODES.HYDRATE_FAILED,
      error instanceof Error ? error.message : "hydrateQuote failed",
    );
  }
}

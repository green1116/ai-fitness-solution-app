/**
 * Post-Launch P5 — Expansion Signals
 */

import { getProductIdentity } from "../../product/e12/identity/product.identity";
import { getCustomerLifecycleStage } from "../../product/e12/commercial/commercial.customer";
import { getApiUsageCount } from "../../product/e12/api/api.usage";
import { listUsageRecords } from "../../product/e12/billing/billing.usage";
import { getLatestAdoption } from "../customer-success/success.adoption";
import { getCustomerHealthProfile } from "../customer-success/success.health";
import {
  EXPANSION_SIGNAL_KINDS,
  GROWTH_SIGNAL_STRENGTHS,
} from "./growth.constants";
import type {
  DetectExpansionSignalsInput,
  ExpansionSignal,
  ExpansionSignalKind,
  GrowthSignalStrength,
} from "./growth.types";

const signals = new Map<string, ExpansionSignal>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneSignal(signal: ExpansionSignal): ExpansionSignal {
  return { ...signal };
}

function strengthFromScore(score: number): GrowthSignalStrength {
  if (score >= 80) return "STRONG";
  if (score >= 55) return "MODERATE";
  if (score >= 25) return "WEAK";
  return "NONE";
}

function pushSignal(
  collected: ExpansionSignal[],
  input: {
    id: string;
    productId: string;
    productTenantId?: string;
    customerHealthProfileId?: string;
    kind: ExpansionSignalKind;
    score: number;
    detail: string;
  },
): void {
  if (!(EXPANSION_SIGNAL_KINDS as readonly string[]).includes(input.kind)) {
    throw new Error(`invalid expansion signal kind: ${input.kind}`);
  }
  const strength = strengthFromScore(input.score);
  if (!(GROWTH_SIGNAL_STRENGTHS as readonly string[]).includes(strength)) {
    throw new Error(`invalid signal strength: ${strength}`);
  }
  if (strength === "NONE") return;

  const signal: ExpansionSignal = {
    id: input.id,
    productId: input.productId,
    productTenantId: input.productTenantId,
    customerHealthProfileId: input.customerHealthProfileId,
    kind: input.kind,
    strength,
    score: input.score,
    detail: input.detail,
    detectedAt: nowIso(),
  };
  if (signals.has(signal.id)) {
    throw new Error(`expansion signal already exists: ${signal.id}`);
  }
  signals.set(signal.id, signal);
  collected.push(cloneSignal(signal));
}

export function detectExpansionSignals(
  input: DetectExpansionSignalsInput,
): ExpansionSignal[] {
  const productId = input.productId.trim();
  if (!getProductIdentity(productId)) {
    throw new Error(`product not found: ${productId}`);
  }

  const productTenantId = input.productTenantId?.trim();
  const customerHealthProfileId = input.customerHealthProfileId?.trim();
  const prefix = input.idPrefix?.trim() || createId("expsig");
  const collected: ExpansionSignal[] = [];

  const billingQty = listUsageRecords(
    productTenantId ? { productTenantId } : undefined,
  ).reduce((sum, r) => sum + r.quantity, 0);
  const apiCalls = getApiUsageCount(
    productTenantId ? { productTenantId } : undefined,
  );

  if (billingQty >= 100) {
    pushSignal(collected, {
      id: `${prefix}.usage`,
      productId,
      productTenantId,
      customerHealthProfileId,
      kind: "USAGE_SURGE",
      score: Math.min(100, 40 + Math.round(billingQty / 20)),
      detail: `billing usage quantity=${billingQty}`,
    });
  }

  if (apiCalls >= 10) {
    pushSignal(collected, {
      id: `${prefix}.api`,
      productId,
      productTenantId,
      customerHealthProfileId,
      kind: "API_VOLUME",
      score: Math.min(100, 35 + apiCalls * 2),
      detail: `api calls=${apiCalls}`,
    });
  }

  if (customerHealthProfileId) {
    const health = getCustomerHealthProfile(customerHealthProfileId);
    if (!health || health.productId !== productId) {
      throw new Error(
        `customer health profile not found: ${customerHealthProfileId}`,
      );
    }
    const adoption = getLatestAdoption(health.id);
    if (
      adoption &&
      (adoption.stage === "ADOPTED" ||
        adoption.stage === "EXPANDING" ||
        adoption.stage === "ADOPTING")
    ) {
      pushSignal(collected, {
        id: `${prefix}.feature`,
        productId,
        productTenantId,
        customerHealthProfileId,
        kind: "FEATURE_ADOPTION",
        score:
          adoption.stage === "EXPANDING"
            ? 90
            : adoption.stage === "ADOPTED"
              ? 75
              : 55,
        detail: `adoption=${adoption.stage} features=${adoption.featureCount}`,
      });
    }
    if (adoption && adoption.activeUsers >= 10) {
      pushSignal(collected, {
        id: `${prefix}.seats`,
        productId,
        productTenantId,
        customerHealthProfileId,
        kind: "SEAT_GROWTH",
        score: Math.min(100, 40 + adoption.activeUsers * 3),
        detail: `activeUsers=${adoption.activeUsers}`,
      });
    }

    const stage = getCustomerLifecycleStage(
      health.organizationId,
      health.productId,
    );
    if (stage === "ACTIVE") {
      pushSignal(collected, {
        id: `${prefix}.tier`,
        productId,
        productTenantId,
        customerHealthProfileId,
        kind: "TIER_UPGRADE",
        score: health.score >= 80 ? 80 : 60,
        detail: `lifecycle=${stage} health=${health.score}`,
      });
    }
  }

  return collected;
}

export function getExpansionSignal(id: string): ExpansionSignal | undefined {
  const signal = signals.get(id.trim());
  return signal ? cloneSignal(signal) : undefined;
}

export function listExpansionSignals(filter?: {
  productId?: string;
  kind?: ExpansionSignalKind;
}): ExpansionSignal[] {
  let result = [...signals.values()];
  if (filter?.productId) {
    const pid = filter.productId.trim();
    result = result.filter((s) => s.productId === pid);
  }
  if (filter?.kind) result = result.filter((s) => s.kind === filter.kind);
  return result
    .slice()
    .sort((a, b) => b.score - a.score)
    .map(cloneSignal);
}

export function clearExpansionSignals(): void {
  signals.clear();
}

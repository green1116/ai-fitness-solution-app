/**
 * Product Payment — Refund registry
 */

import { getCapture } from "../capture/capture.registry";
import type {
  PaymentRefund,
  RefundCaptureInput,
  RefundResult,
} from "./refund.types";

const refunds = new Map<string, PaymentRefund>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneRefund(refund: PaymentRefund): PaymentRefund {
  return { ...refund, metadata: { ...refund.metadata } };
}

export function refundCapture(input: RefundCaptureInput): PaymentRefund {
  const captureId = input.captureId.trim();
  if (!captureId) throw new Error("refund.captureId is required");

  const capture = getCapture(captureId);
  if (!capture) throw new Error(`capture not found: ${captureId}`);

  const amountCents = input.amountCents ?? capture.amountCents;
  if (!Number.isFinite(amountCents) || amountCents <= 0) {
    throw new Error("refund.amountCents must be > 0");
  }

  let result: RefundResult = "FAILED";
  if (amountCents > capture.amountCents) {
    result = "FAILED";
  } else if (amountCents === capture.amountCents) {
    result = "REFUNDED";
  } else {
    result = "PARTIAL";
  }

  const id = input.id?.trim() || createId("payrfd");
  if (refunds.has(id)) throw new Error(`refund already exists: ${id}`);

  const refund: PaymentRefund = {
    id,
    captureId,
    intentId: capture.intentId,
    amountCents,
    result,
    detail: `result=${result} amount=${amountCents}`,
    metadata: { ...(input.metadata ?? {}) },
    refundedAt: nowIso(),
  };
  refunds.set(id, refund);
  return cloneRefund(refund);
}

export function getRefund(id: string): PaymentRefund | undefined {
  const refund = refunds.get(id.trim());
  return refund ? cloneRefund(refund) : undefined;
}

export function listRefunds(filter?: {
  captureId?: string;
  result?: RefundResult;
}): PaymentRefund[] {
  let result = [...refunds.values()];
  if (filter?.captureId) {
    const captureId = filter.captureId.trim();
    result = result.filter((r) => r.captureId === captureId);
  }
  if (filter?.result) {
    result = result.filter((r) => r.result === filter.result);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneRefund);
}

export function clearRefunds(): void {
  refunds.clear();
}

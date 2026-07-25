/**
 * Product Payment — Capture registry
 */

import {
  getIntent,
  markIntentCaptured,
} from "../intent/intent.registry";
import type {
  CaptureIntentInput,
  PaymentCapture,
} from "./capture.types";

const captures = new Map<string, PaymentCapture>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneCapture(capture: PaymentCapture): PaymentCapture {
  return { ...capture, metadata: { ...capture.metadata } };
}

export function captureIntent(input: CaptureIntentInput): PaymentCapture {
  const intentId = input.intentId.trim();
  if (!intentId) throw new Error("capture.intentId is required");

  const intent = getIntent(intentId);
  if (!intent) throw new Error(`intent not found: ${intentId}`);
  if (intent.status !== "AUTHORIZED") {
    throw new Error(`intent not authorized: ${intentId}`);
  }

  const amountCents = input.amountCents ?? intent.amountCents;
  if (!Number.isFinite(amountCents) || amountCents <= 0) {
    throw new Error("capture.amountCents must be > 0");
  }
  if (amountCents > intent.amountCents) {
    throw new Error("capture exceeds intent amount");
  }

  markIntentCaptured(intentId);

  const id = input.id?.trim() || createId("paycap");
  if (captures.has(id)) throw new Error(`capture already exists: ${id}`);

  const capture: PaymentCapture = {
    id,
    intentId,
    amountCents,
    currency: intent.currency,
    detail: `intent=${intentId} amount=${amountCents}`,
    metadata: { ...(input.metadata ?? {}) },
    capturedAt: nowIso(),
  };
  captures.set(id, capture);
  return cloneCapture(capture);
}

export function getCapture(id: string): PaymentCapture | undefined {
  const capture = captures.get(id.trim());
  return capture ? cloneCapture(capture) : undefined;
}

export function listCaptures(filter?: {
  intentId?: string;
}): PaymentCapture[] {
  let result = [...captures.values()];
  if (filter?.intentId) {
    const intentId = filter.intentId.trim();
    result = result.filter((c) => c.intentId === intentId);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneCapture);
}

export function clearCaptures(): void {
  captures.clear();
}

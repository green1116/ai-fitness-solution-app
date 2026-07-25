/**
 * Product Payment — Intent registry
 */

import { INTENT_STATUSES } from "../integration/integration.constants";
import { getProvider } from "../provider/provider.registry";
import type {
  AuthorizeIntentInput,
  CancelIntentInput,
  CreateIntentInput,
  IntentStatus,
  PaymentIntent,
} from "./intent.types";

const intents = new Map<string, PaymentIntent>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneIntent(intent: PaymentIntent): PaymentIntent {
  return { ...intent, metadata: { ...intent.metadata } };
}

export function createIntent(input: CreateIntentInput): PaymentIntent {
  const providerId = input.providerId.trim();
  const accountId = input.accountId.trim();
  const currency = (input.currency ?? "USD").trim().toUpperCase();
  if (!providerId) throw new Error("intent.providerId is required");
  if (!accountId) throw new Error("intent.accountId is required");
  if (!Number.isFinite(input.amountCents) || input.amountCents <= 0) {
    throw new Error("intent.amountCents must be > 0");
  }

  const provider = getProvider(providerId);
  if (!provider) throw new Error(`provider not found: ${providerId}`);
  if (provider.status !== "ACTIVE") {
    throw new Error(`provider not active: ${providerId}`);
  }

  const id = input.id?.trim() || createId("payint");
  if (intents.has(id)) throw new Error(`intent already exists: ${id}`);

  const now = nowIso();
  const intent: PaymentIntent = {
    id,
    providerId,
    accountId,
    amountCents: input.amountCents,
    currency,
    status: INTENT_STATUSES[0],
    detail: `status=CREATED amount=${input.amountCents}`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: now,
    updatedAt: now,
  };
  intents.set(id, intent);
  return cloneIntent(intent);
}

export function authorizeIntent(
  input: AuthorizeIntentInput,
): PaymentIntent {
  const intentId = input.intentId.trim();
  if (!intentId) throw new Error("intent.intentId is required");
  const existing = intents.get(intentId);
  if (!existing) throw new Error(`intent not found: ${intentId}`);
  if (existing.status !== "CREATED") {
    throw new Error(`intent not creatable for auth: ${intentId}`);
  }

  const updated: PaymentIntent = {
    ...existing,
    status: "AUTHORIZED",
    detail: `status=AUTHORIZED amount=${existing.amountCents}`,
    metadata: { ...existing.metadata },
    updatedAt: nowIso(),
  };
  intents.set(intentId, updated);
  return cloneIntent(updated);
}

export function cancelIntent(input: CancelIntentInput): PaymentIntent {
  const intentId = input.intentId.trim();
  if (!intentId) throw new Error("intent.intentId is required");
  const existing = intents.get(intentId);
  if (!existing) throw new Error(`intent not found: ${intentId}`);
  if (existing.status === "CAPTURED" || existing.status === "CANCELED") {
    throw new Error(`intent not cancelable: ${intentId}`);
  }

  const updated: PaymentIntent = {
    ...existing,
    status: "CANCELED",
    detail: `status=CANCELED amount=${existing.amountCents}`,
    metadata: { ...existing.metadata },
    updatedAt: nowIso(),
  };
  intents.set(intentId, updated);
  return cloneIntent(updated);
}

export function markIntentCaptured(intentId: string): PaymentIntent {
  const existing = intents.get(intentId.trim());
  if (!existing) throw new Error(`intent not found: ${intentId}`);
  if (existing.status !== "AUTHORIZED") {
    throw new Error(`intent not authorized: ${intentId}`);
  }

  const updated: PaymentIntent = {
    ...existing,
    status: "CAPTURED",
    detail: `status=CAPTURED amount=${existing.amountCents}`,
    metadata: { ...existing.metadata },
    updatedAt: nowIso(),
  };
  intents.set(intentId, updated);
  return cloneIntent(updated);
}

export function getIntent(id: string): PaymentIntent | undefined {
  const intent = intents.get(id.trim());
  return intent ? cloneIntent(intent) : undefined;
}

export function listIntents(filter?: {
  accountId?: string;
  status?: IntentStatus;
}): PaymentIntent[] {
  let result = [...intents.values()];
  if (filter?.accountId) {
    const accountId = filter.accountId.trim();
    result = result.filter((i) => i.accountId === accountId);
  }
  if (filter?.status) {
    result = result.filter((i) => i.status === filter.status);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneIntent);
}

export function clearIntents(): void {
  intents.clear();
}

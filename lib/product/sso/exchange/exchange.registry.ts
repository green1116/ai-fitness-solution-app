/**
 * Product SSO — Exchange registry
 */

import { getAssertion } from "../assertion/assertion.registry";
import type {
  ExchangeSessionInput,
  SsoExchange,
} from "./exchange.types";

const exchanges = new Map<string, SsoExchange>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneExchange(exchange: SsoExchange): SsoExchange {
  return { ...exchange, metadata: { ...exchange.metadata } };
}

export function exchangeSession(input: ExchangeSessionInput): SsoExchange {
  const assertionId = input.assertionId.trim();
  if (!assertionId) throw new Error("exchange.assertionId is required");

  const assertion = getAssertion(assertionId);
  if (!assertion) throw new Error(`assertion not found: ${assertionId}`);
  if (assertion.result !== "ACCEPT") {
    throw new Error(`assertion not accepted: ${assertionId}`);
  }
  if (!assertion.principalId) {
    throw new Error(`assertion missing principal: ${assertionId}`);
  }

  const id = input.id?.trim() || createId("ssoxch");
  if (exchanges.has(id)) throw new Error(`exchange already exists: ${id}`);

  const sessionId =
    input.sessionId?.trim() ||
    `sso_ses_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

  const exchange: SsoExchange = {
    id,
    assertionId,
    principalId: assertion.principalId,
    providerId: assertion.providerId,
    sessionId,
    detail: `principal=${assertion.principalId} session=${sessionId}`,
    metadata: { ...(input.metadata ?? {}) },
    exchangedAt: nowIso(),
  };
  exchanges.set(id, exchange);
  return cloneExchange(exchange);
}

export function getExchange(id: string): SsoExchange | undefined {
  const exchange = exchanges.get(id.trim());
  return exchange ? cloneExchange(exchange) : undefined;
}

export function listExchanges(filter?: {
  principalId?: string;
  providerId?: string;
}): SsoExchange[] {
  let result = [...exchanges.values()];
  if (filter?.principalId) {
    const pid = filter.principalId.trim();
    result = result.filter((e) => e.principalId === pid);
  }
  if (filter?.providerId) {
    const providerId = filter.providerId.trim();
    result = result.filter((e) => e.providerId === providerId);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneExchange);
}

export function clearExchanges(): void {
  exchanges.clear();
}

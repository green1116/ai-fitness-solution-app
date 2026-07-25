/**
 * Product SSO — Assertion registry
 */

import { listConnections } from "../connection/connection.registry";
import { getProvider } from "../provider/provider.registry";
import type {
  FederateAssertionInput,
  SsoAssertion,
  SsoAssertionResult,
} from "./assertion.types";

const assertions = new Map<string, SsoAssertion>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneAssertion(assertion: SsoAssertion): SsoAssertion {
  return { ...assertion, metadata: { ...assertion.metadata } };
}

export function federateAssertion(
  input: FederateAssertionInput,
): SsoAssertion {
  const providerId = input.providerId.trim();
  const externalSubject = input.externalSubject.trim();
  if (!providerId) throw new Error("assertion.providerId is required");
  if (!externalSubject) {
    throw new Error("assertion.externalSubject is required");
  }

  const provider = getProvider(providerId);
  if (!provider) throw new Error(`provider not found: ${providerId}`);
  if (provider.status !== "ACTIVE") {
    throw new Error(`provider not active: ${providerId}`);
  }

  const connection = listConnections({
    providerId,
    status: "LINKED",
  }).find((c) => c.externalSubject === externalSubject);

  const accept = input.accept ?? true;
  let result: SsoAssertionResult = "REJECT";
  let connectionId = "";
  let principalId = "";
  let detail = "no linked connection";

  if (!connection) {
    result = "REJECT";
    detail = `no linked connection for subject=${externalSubject}`;
  } else if (!accept) {
    result = "REJECT";
    connectionId = connection.id;
    principalId = connection.principalId;
    detail = "assertion rejected";
  } else {
    result = "ACCEPT";
    connectionId = connection.id;
    principalId = connection.principalId;
    detail = `accepted principal=${principalId}`;
  }

  const id = input.id?.trim() || createId("ssoast");
  if (assertions.has(id)) throw new Error(`assertion already exists: ${id}`);

  const assertion: SsoAssertion = {
    id,
    providerId,
    connectionId,
    principalId,
    externalSubject,
    result,
    detail,
    metadata: { ...(input.metadata ?? {}) },
    assertedAt: nowIso(),
  };
  assertions.set(id, assertion);
  return cloneAssertion(assertion);
}

export function getAssertion(id: string): SsoAssertion | undefined {
  const assertion = assertions.get(id.trim());
  return assertion ? cloneAssertion(assertion) : undefined;
}

export function listAssertions(filter?: {
  providerId?: string;
  result?: SsoAssertionResult;
}): SsoAssertion[] {
  let result = [...assertions.values()];
  if (filter?.providerId) {
    const providerId = filter.providerId.trim();
    result = result.filter((a) => a.providerId === providerId);
  }
  if (filter?.result) {
    result = result.filter((a) => a.result === filter.result);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneAssertion);
}

export function clearAssertions(): void {
  assertions.clear();
}

/**
 * Product MFA — Recovery registry
 */

import type {
  ConsumeRecoveryCodeInput,
  IssueRecoveryCodesInput,
  MfaRecoveryCode,
} from "./recovery.types";

const recoveryCodes = new Map<string, MfaRecoveryCode>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneRecovery(code: MfaRecoveryCode): MfaRecoveryCode {
  return { ...code, metadata: { ...code.metadata } };
}

function makeCode(): string {
  return Math.random().toString(36).slice(2, 10).toUpperCase();
}

export function issueRecoveryCodes(
  input: IssueRecoveryCodesInput,
): MfaRecoveryCode[] {
  const principalId = input.principalId.trim();
  if (!principalId) throw new Error("recovery.principalId is required");
  const count = input.count ?? 3;
  if (count < 1 || count > 10) {
    throw new Error("recovery.count must be between 1 and 10");
  }

  const issued: MfaRecoveryCode[] = [];
  const now = nowIso();
  for (let i = 0; i < count; i += 1) {
    const id = createId("mfarec");
    const code: MfaRecoveryCode = {
      id,
      principalId,
      code: makeCode(),
      consumed: false,
      detail: `principal=${principalId} unused`,
      metadata: { ...(input.metadata ?? {}) },
      issuedAt: now,
    };
    recoveryCodes.set(id, code);
    issued.push(cloneRecovery(code));
  }
  return issued;
}

export function consumeRecoveryCode(
  input: ConsumeRecoveryCodeInput,
): MfaRecoveryCode {
  const principalId = input.principalId.trim();
  const code = input.code.trim().toUpperCase();
  if (!principalId) throw new Error("recovery.principalId is required");
  if (!code) throw new Error("recovery.code is required");

  const match = [...recoveryCodes.values()].find(
    (r) =>
      r.principalId === principalId &&
      r.code === code &&
      r.consumed === false,
  );
  if (!match) throw new Error("recovery code not found or already used");

  const updated: MfaRecoveryCode = {
    ...match,
    consumed: true,
    detail: `principal=${principalId} consumed`,
    metadata: { ...match.metadata },
    consumedAt: nowIso(),
  };
  recoveryCodes.set(match.id, updated);
  return cloneRecovery(updated);
}

export function getRecoveryCode(id: string): MfaRecoveryCode | undefined {
  const code = recoveryCodes.get(id.trim());
  return code ? cloneRecovery(code) : undefined;
}

export function listRecoveryCodes(filter?: {
  principalId?: string;
  consumed?: boolean;
}): MfaRecoveryCode[] {
  let result = [...recoveryCodes.values()];
  if (filter?.principalId) {
    const pid = filter.principalId.trim();
    result = result.filter((r) => r.principalId === pid);
  }
  if (typeof filter?.consumed === "boolean") {
    result = result.filter((r) => r.consumed === filter.consumed);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneRecovery);
}

export function clearRecoveryCodes(): void {
  recoveryCodes.clear();
}

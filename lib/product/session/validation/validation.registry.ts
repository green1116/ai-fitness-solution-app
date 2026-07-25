/**
 * Product Session — Validation registry
 */

import { getSession } from "../lifecycle/lifecycle.registry";
import { getToken } from "../token/token.registry";
import type {
  SessionValidation,
  ValidateSessionInput,
  ValidationResult,
} from "./validation.types";

const validations = new Map<string, SessionValidation>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneValidation(
  validation: SessionValidation,
): SessionValidation {
  return { ...validation, metadata: { ...validation.metadata } };
}

export function validateSession(
  input: ValidateSessionInput,
): SessionValidation {
  const sessionId = input.sessionId.trim();
  if (!sessionId) throw new Error("validation.sessionId is required");

  const id = input.id?.trim() || createId("scval");
  if (validations.has(id)) {
    throw new Error(`validation already exists: ${id}`);
  }

  const session = getSession(sessionId);
  let result: ValidationResult = "INVALID";
  let detail = "session missing";

  if (!session) {
    result = "INVALID";
    detail = `session not found: ${sessionId}`;
  } else if (session.status === "EXPIRED") {
    result = "EXPIRED";
    detail = `session expired: ${sessionId}`;
  } else if (session.status !== "ACTIVE") {
    result = "INVALID";
    detail = `session status=${session.status}`;
  } else {
    result = "VALID";
    detail = `session active: ${sessionId}`;
  }

  const tokenId = input.tokenId?.trim();
  if (tokenId && result === "VALID") {
    const token = getToken(tokenId);
    if (!token) {
      result = "INVALID";
      detail = `token not found: ${tokenId}`;
    } else if (token.sessionId !== sessionId) {
      result = "INVALID";
      detail = "token/session mismatch";
    } else if (token.status === "EXPIRED") {
      result = "EXPIRED";
      detail = `token expired: ${tokenId}`;
    } else if (token.status !== "ACTIVE") {
      result = "INVALID";
      detail = `token status=${token.status}`;
    } else {
      detail = `session+token valid: ${sessionId}`;
    }
  }

  const validation: SessionValidation = {
    id,
    sessionId,
    tokenId: tokenId || undefined,
    result,
    detail,
    metadata: { ...(input.metadata ?? {}) },
    validatedAt: nowIso(),
  };
  validations.set(id, validation);
  return cloneValidation(validation);
}

export function getValidation(id: string): SessionValidation | undefined {
  const validation = validations.get(id.trim());
  return validation ? cloneValidation(validation) : undefined;
}

export function listValidations(filter?: {
  sessionId?: string;
  result?: ValidationResult;
}): SessionValidation[] {
  let result = [...validations.values()];
  if (filter?.sessionId) {
    const sid = filter.sessionId.trim();
    result = result.filter((v) => v.sessionId === sid);
  }
  if (filter?.result) {
    result = result.filter((v) => v.result === filter.result);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneValidation);
}

export function clearValidations(): void {
  validations.clear();
}

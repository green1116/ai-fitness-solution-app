/**
 * E01-P1 — Tender Intake Kernel schema (pure TS validation, no Zod)
 */

import type {
  TenderIntakeLifecycleStage,
  TenderIntakeStatus,
  TenderSource,
  TenderSourceKind,
  TenderWorkspaceStatus,
} from "./intake.types";

export const TENDER_SOURCE_KINDS: readonly TenderSourceKind[] = [
  "upload",
  "paste",
  "url",
  "api",
] as const;

export const TENDER_INTAKE_STATUSES: readonly TenderIntakeStatus[] = [
  "received",
  "validated",
  "normalized",
  "workspace_ready",
  "failed",
] as const;

export const TENDER_WORKSPACE_STATUSES: readonly TenderWorkspaceStatus[] = [
  "draft",
  "active",
  "archived",
] as const;

export const TENDER_INTAKE_LIFECYCLE_STAGES: readonly TenderIntakeLifecycleStage[] = [
  "source",
  "intake",
  "workspace",
] as const;

export type SchemaIssue = {
  path: string;
  message: string;
};

export type SchemaResult<T> =
  | { ok: true; value: T }
  | { ok: false; issues: SchemaIssue[] };

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function issue(path: string, message: string): SchemaIssue {
  return { path, message };
}

export function parseTenderSourceKind(value: unknown): SchemaResult<TenderSourceKind> {
  if (typeof value !== "string" || !(TENDER_SOURCE_KINDS as readonly string[]).includes(value)) {
    return {
      ok: false,
      issues: [issue("kind", `must be one of: ${TENDER_SOURCE_KINDS.join(", ")}`)],
    };
  }
  return { ok: true, value: value as TenderSourceKind };
}

export function validateTenderSourceInput(input: {
  kind?: unknown;
  fileName?: unknown;
  mimeType?: unknown;
  rawText?: unknown;
  uri?: unknown;
  byteLength?: unknown;
}): SchemaResult<{
  kind: TenderSourceKind;
  fileName?: string;
  mimeType?: string;
  rawText?: string;
  uri?: string;
  byteLength?: number;
}> {
  const issues: SchemaIssue[] = [];
  const kindResult = parseTenderSourceKind(input.kind);
  if (!kindResult.ok) issues.push(...kindResult.issues);

  const kind = kindResult.ok ? kindResult.value : undefined;

  if (kind === "upload") {
    if (!isNonEmptyString(input.fileName)) {
      issues.push(issue("fileName", "upload source requires fileName"));
    }
    if (!isNonEmptyString(input.mimeType)) {
      issues.push(issue("mimeType", "upload source requires mimeType"));
    }
  }

  if (kind === "paste") {
    if (!isNonEmptyString(input.rawText)) {
      issues.push(issue("rawText", "paste source requires rawText"));
    }
  }

  if (kind === "url") {
    if (!isNonEmptyString(input.uri)) {
      issues.push(issue("uri", "url source requires uri"));
    } else if (!/^https?:\/\//i.test(input.uri.trim())) {
      issues.push(issue("uri", "url source uri must start with http(s)://"));
    }
  }

  if (kind === "api") {
    if (!isNonEmptyString(input.rawText) && !isNonEmptyString(input.uri)) {
      issues.push(issue("rawText|uri", "api source requires rawText or uri"));
    }
  }

  if (input.byteLength !== undefined) {
    if (typeof input.byteLength !== "number" || !Number.isFinite(input.byteLength) || input.byteLength < 0) {
      issues.push(issue("byteLength", "byteLength must be a non-negative number"));
    }
  }

  if (issues.length > 0 || !kind) {
    return { ok: false, issues };
  }

  return {
    ok: true,
    value: {
      kind,
      fileName: isNonEmptyString(input.fileName) ? input.fileName.trim() : undefined,
      mimeType: isNonEmptyString(input.mimeType) ? input.mimeType.trim() : undefined,
      rawText: isNonEmptyString(input.rawText) ? input.rawText : undefined,
      uri: isNonEmptyString(input.uri) ? input.uri.trim() : undefined,
      byteLength: typeof input.byteLength === "number" ? input.byteLength : undefined,
    },
  };
}

export function assertValidSource(source: TenderSource): void {
  const result = validateTenderSourceInput(source);
  if (!result.ok) {
    throw new Error(
      `Invalid TenderSource: ${result.issues.map((i) => `${i.path}: ${i.message}`).join("; ")}`,
    );
  }
  if (!isNonEmptyString(source.id)) {
    throw new Error("Invalid TenderSource: id is required");
  }
  if (!isNonEmptyString(source.receivedAt)) {
    throw new Error("Invalid TenderSource: receivedAt is required");
  }
}

export function isTerminalIntakeStatus(status: TenderIntakeStatus): boolean {
  return status === "workspace_ready" || status === "failed";
}

export function canAdvanceIntakeStatus(
  from: TenderIntakeStatus,
  to: TenderIntakeStatus,
): boolean {
  const order: TenderIntakeStatus[] = [
    "received",
    "validated",
    "normalized",
    "workspace_ready",
  ];
  if (to === "failed") return from !== "workspace_ready";
  const fromIdx = order.indexOf(from);
  const toIdx = order.indexOf(to);
  if (fromIdx < 0 || toIdx < 0) return false;
  return toIdx === fromIdx + 1;
}

/**
 * V80 Pilot P5 — In-memory intake audit trail (no schema migration)
 */

import { randomUUID } from "node:crypto";

import type { TenderRequirements } from "./requirements.schema";
import type { TenderIntakeStatus } from "./intake.store";

export type IntakeAuditStep =
  | "upload"
  | "parse"
  | "extract"
  | "patch"
  | "reset"
  | "validate"
  | "approve"
  | "generate"
  | "retry"
  | "recover"
  | "rollback"
  | "status_transition"
  | "qa"
  | "handoff"
  | "freeze"
  | "delivery_lock"
  | "signoff"
  | "release_package";

export type IntakeAuditEntry = {
  id: string;
  sessionId: string;
  organizationId: string;
  actorId: string;
  step: IntakeAuditStep;
  timestamp: string;
  statusBefore?: TenderIntakeStatus;
  statusAfter?: TenderIntakeStatus;
  workflowStatusBefore?: string;
  workflowStatusAfter?: string;
  message?: string;
  diff?: Record<string, unknown>;
  requirementsSnapshot?: TenderRequirements;
  linkage?: {
    projectId?: string;
    quoteId?: string;
    tenderId?: string;
    v80TenderId?: string;
    v80QuoteId?: string;
    workflowJobId?: string;
  };
  meta?: Record<string, unknown>;
};

export type AppendIntakeAuditInput = Omit<IntakeAuditEntry, "id" | "timestamp"> & {
  id?: string;
  timestamp?: string;
};

declare global {
  // eslint-disable-next-line no-var
  var __v80PilotIntakeAudit: Map<string, IntakeAuditEntry[]> | undefined;
}

function auditBySession(): Map<string, IntakeAuditEntry[]> {
  globalThis.__v80PilotIntakeAudit ||= new Map();
  return globalThis.__v80PilotIntakeAudit;
}

export function appendIntakeAudit(input: AppendIntakeAuditInput): IntakeAuditEntry {
  const entry: IntakeAuditEntry = {
    id: input.id ?? randomUUID(),
    timestamp: input.timestamp ?? new Date().toISOString(),
    sessionId: input.sessionId,
    organizationId: input.organizationId,
    actorId: input.actorId,
    step: input.step,
    statusBefore: input.statusBefore,
    statusAfter: input.statusAfter,
    workflowStatusBefore: input.workflowStatusBefore,
    workflowStatusAfter: input.workflowStatusAfter,
    message: input.message,
    diff: input.diff,
    requirementsSnapshot: input.requirementsSnapshot,
    linkage: input.linkage,
    meta: input.meta,
  };

  const list = auditBySession().get(input.sessionId) ?? [];
  list.push(entry);
  auditBySession().set(input.sessionId, list);
  return entry;
}

export function listIntakeAudit(sessionId: string): IntakeAuditEntry[] {
  return [...(auditBySession().get(sessionId) ?? [])];
}

export function getIntakeAuditEntry(
  sessionId: string,
  auditEntryId: string,
): IntakeAuditEntry | null {
  return listIntakeAudit(sessionId).find((e) => e.id === auditEntryId) ?? null;
}

export function summarizeRequirements(req: TenderRequirements | undefined): Record<string, unknown> {
  if (!req) return {};
  return {
    projectName: req.projectName,
    organization: req.organization,
    industry: req.industry,
    location: req.location,
    scopeLength: req.scope?.length ?? 0,
    objectivesCount: req.objectives?.length ?? 0,
    functionalCount: req.functionalRequirements?.length ?? 0,
    technicalCount: req.technicalRequirements?.length ?? 0,
    budget: req.budget,
  };
}

export function diffRequirements(
  before: TenderRequirements | undefined,
  after: TenderRequirements | undefined,
): Record<string, unknown> {
  if (!before && !after) return {};
  if (!before) return { added: summarizeRequirements(after) };
  if (!after) return { removed: summarizeRequirements(before) };

  const changes: Record<string, { from: unknown; to: unknown }> = {};
  const keys = new Set([
    ...Object.keys(before as object),
    ...Object.keys(after as object),
  ]) as Set<keyof TenderRequirements>;

  for (const key of keys) {
    const from = before[key];
    const to = after[key];
    if (JSON.stringify(from) !== JSON.stringify(to)) {
      changes[String(key)] = { from, to };
    }
  }
  return changes;
}

export function clearIntakeAuditForTests(): void {
  globalThis.__v80PilotIntakeAudit = new Map();
}

export function getIntakeAuditSummary(sessionId: string): {
  eventCount: number;
  lastEventAt?: string;
  lastStep?: IntakeAuditStep;
} {
  const entries = listIntakeAudit(sessionId);
  const last = entries[entries.length - 1];
  return {
    eventCount: entries.length,
    lastEventAt: last?.timestamp,
    lastStep: last?.step,
  };
}

import { clearIntakeAuditForTests } from "./audit-trail.service";

import { randomUUID } from "node:crypto";

import type { TenderParseResult } from "@/lib/tender/types";

import type { ClarificationState } from "./clarification.schema";
import type { IntakeComplianceState } from "./compliance.schema";
import type { IntakeBootstrapState } from "./bootstrap.schema";
import type { IntakeHandoffState } from "./handoff-package.schema";
import type {
  IntakeDocumentEntry,
  MultiDocConsolidationState,
} from "./multidoc.schema";
import type { TenderRequirements } from "./requirements.schema";

export type TenderIntakeStatus =
  | "uploaded"
  | "parsed"
  | "extracted"
  | "in_review"
  | "qa_failed"
  | "approving"
  | "generating"
  | "approved"
  | "ready"
  | "failed";

export type TenderIntakeSession = {
  id: string;
  organizationId: string;
  userId: string;
  status: TenderIntakeStatus;
  fileName: string;
  mimeType: string;
  fileSize: number;
  /** Intake tender id — production Tender created on approve */
  tenderIntakeId: string;
  parseResult: TenderParseResult;
  /** Immutable snapshot from first extraction — used for reset */
  extractedRequirements?: TenderRequirements;
  requirements?: TenderRequirements;
  /** P2 — monotonic requirements revision (bumped on patch/re-extract/item review) */
  requirementsRevision?: number;
  /** P6 — clarification loop state (session-local) */
  clarifications?: ClarificationState;
  /** P7 — multi-document registry */
  documents?: IntakeDocumentEntry[];
  /** P7 — last consolidation summary */
  consolidation?: MultiDocConsolidationState;
  /** P8 — knowledge/compliance validation */
  compliance?: IntakeComplianceState;
  /** P9 — pre-V80 handoff summary package */
  handoff?: IntakeHandoffState;
  /** P10 — execution bootstrap seed */
  bootstrap?: IntakeBootstrapState;
  productionProjectId?: string;
  productionTenderId?: string;
  productionQuoteId?: string;
  v80TenderId?: string;
  v80QuoteId?: string;
  v80WorkflowJobId?: string;
  workflowStatus?: string;
  statusReasonCode?: string;
  statusReasonMessage?: string;
  qaPassedAt?: string;
  frozen?: boolean;
  frozenAt?: string;
  frozenBy?: string;
  freezeReasonCode?: string;
  freezeReasonMessage?: string;
  frozenState?: Record<string, unknown>;
  deliveryLocked?: boolean;
  signedOff?: boolean;
  signedOffAt?: string;
  signedOffBy?: string;
  signoffReasonCode?: string;
  releasePackageId?: string;
  createdAt: string;
  updatedAt: string;
};

declare global {
  // eslint-disable-next-line no-var
  var __v80PilotIntakeSessions: Map<string, TenderIntakeSession> | undefined;
  // eslint-disable-next-line no-var
  var __v80PilotApproveLocks: Set<string> | undefined;
}

function sessions(): Map<string, TenderIntakeSession> {
  globalThis.__v80PilotIntakeSessions ||= new Map();
  return globalThis.__v80PilotIntakeSessions;
}

function approveLocks(): Set<string> {
  globalThis.__v80PilotApproveLocks ||= new Set();
  return globalThis.__v80PilotApproveLocks;
}

export function createIntakeSession(input: {
  organizationId: string;
  userId: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  parseResult: TenderParseResult;
}): TenderIntakeSession {
  const now = new Date().toISOString();
  const id = randomUUID();
  const session: TenderIntakeSession = {
    id,
    tenderIntakeId: `intake_${id.slice(0, 8)}`,
    organizationId: input.organizationId,
    userId: input.userId,
    status: "parsed",
    fileName: input.fileName,
    mimeType: input.mimeType,
    fileSize: input.fileSize,
    parseResult: input.parseResult,
    requirementsRevision: 0,
    createdAt: now,
    updatedAt: now,
  };
  sessions().set(id, session);
  return session;
}

export function getIntakeSession(sessionId: string): TenderIntakeSession | null {
  return sessions().get(sessionId) ?? null;
}

export function updateIntakeSession(
  sessionId: string,
  patch: Partial<
    Pick<
      TenderIntakeSession,
      | "status"
      | "extractedRequirements"
      | "requirements"
      | "requirementsRevision"
      | "clarifications"
      | "documents"
      | "consolidation"
      | "compliance"
      | "handoff"
      | "bootstrap"
      | "parseResult"
      | "fileName"
      | "fileSize"
      | "mimeType"
      | "productionProjectId"
      | "productionTenderId"
      | "productionQuoteId"
      | "v80TenderId"
      | "v80QuoteId"
      | "v80WorkflowJobId"
      | "workflowStatus"
      | "statusReasonCode"
      | "statusReasonMessage"
      | "qaPassedAt"
      | "frozen"
      | "frozenAt"
      | "frozenBy"
      | "freezeReasonCode"
      | "freezeReasonMessage"
      | "frozenState"
      | "deliveryLocked"
      | "signedOff"
      | "signedOffAt"
      | "signedOffBy"
      | "signoffReasonCode"
      | "releasePackageId"
    >
  >,
  options?: { bypassFreeze?: boolean },
): TenderIntakeSession | null {
  const existing = sessions().get(sessionId);
  if (!existing) return null;

  if (existing.signedOff && !options?.bypassFreeze) {
    throw new Error("RELEASE_LOCKED");
  }

  if (existing.frozen && !options?.bypassFreeze) {
    const patchKeys = Object.keys(patch);
    const onlyFreezeMeta = patchKeys.every((k) =>
      [
        "frozen",
        "frozenAt",
        "frozenBy",
        "freezeReasonCode",
        "freezeReasonMessage",
        "frozenState",
        "deliveryLocked",
        "statusReasonCode",
        "statusReasonMessage",
        "signedOff",
        "signedOffAt",
        "signedOffBy",
        "signoffReasonCode",
        "releasePackageId",
        "handoff",
        "bootstrap",
      ].includes(k),
    );
    if (!onlyFreezeMeta) {
      throw new Error("SESSION_FROZEN");
    }
  }

  const updated: TenderIntakeSession = {
    ...existing,
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  sessions().set(sessionId, updated);
  return updated;
}

export function tryAcquireApproveLock(sessionId: string): boolean {
  const locks = approveLocks();
  if (locks.has(sessionId)) return false;
  locks.add(sessionId);
  return true;
}

export function releaseApproveLock(sessionId: string): void {
  approveLocks().delete(sessionId);
}

export function listIntakeSessionsForOrg(organizationId: string): TenderIntakeSession[] {
  return [...sessions().values()].filter((s) => s.organizationId === organizationId);
}

/** Clear locks + sessions for verify scripts only */
export function clearIntakeStoreForTests(): void {
  globalThis.__v80PilotIntakeSessions = new Map();
  globalThis.__v80PilotApproveLocks = new Set();
  clearIntakeAuditForTests();
}

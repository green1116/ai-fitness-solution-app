/**
 * Product P8 — Submission registry
 */

import { SUBMISSION_STATUSES } from "../tender/tender.constants";
import { getDelivery } from "../delivery/delivery.registry";
import { getPackage } from "../package/package.registry";
import { getTender } from "../tender/tender.registry";
import type {
  AcknowledgeSubmissionInput,
  CreateSubmissionInput,
  TenderSubmission,
} from "./submission.types";

const submissions = new Map<string, TenderSubmission>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneSubmission(submission: TenderSubmission): TenderSubmission {
  return { ...submission, metadata: { ...submission.metadata } };
}

export function createSubmission(
  input: CreateSubmissionInput,
): TenderSubmission {
  const tenderId = input.tenderId.trim();
  const packageId = input.packageId.trim();
  const deliveryId = input.deliveryId.trim();
  if (!tenderId) throw new Error("submission.tenderId is required");
  if (!packageId) throw new Error("submission.packageId is required");
  if (!deliveryId) throw new Error("submission.deliveryId is required");
  if (!getTender(tenderId)) {
    throw new Error(`tender not found: ${tenderId}`);
  }
  const pkg = getPackage(packageId);
  if (!pkg) throw new Error(`package not found: ${packageId}`);
  if (pkg.status !== "SEALED" && pkg.status !== "DELIVERED") {
    throw new Error(`package must be sealed before submission: ${packageId}`);
  }
  if (!getDelivery(deliveryId)) {
    throw new Error(`delivery not found: ${deliveryId}`);
  }

  const id = input.id?.trim() || createId("p8sub");
  if (submissions.has(id)) {
    throw new Error(`submission already exists: ${id}`);
  }

  const status = SUBMISSION_STATUSES[1];
  const referenceCode =
    (input.referenceCode ?? "").trim() || `SUB-${id.toUpperCase()}`;
  const submission: TenderSubmission = {
    id,
    tenderId,
    packageId,
    deliveryId,
    status,
    referenceCode,
    detail: `status=${status} ref=${referenceCode}`,
    metadata: { ...(input.metadata ?? {}) },
    submittedAt: nowIso(),
  };
  submissions.set(id, submission);
  return cloneSubmission(submission);
}

export function acknowledgeSubmission(
  input: AcknowledgeSubmissionInput,
): TenderSubmission {
  const submissionId = input.submissionId.trim();
  if (!submissionId) throw new Error("submission.submissionId is required");
  const existing = submissions.get(submissionId);
  if (!existing) throw new Error(`submission not found: ${submissionId}`);
  if (existing.status === "ACKNOWLEDGED") {
    throw new Error(`submission already acknowledged: ${submissionId}`);
  }

  const referenceCode =
    (input.referenceCode ?? existing.referenceCode).trim() ||
    existing.referenceCode;
  const updated: TenderSubmission = {
    ...existing,
    status: "ACKNOWLEDGED",
    referenceCode,
    detail: `status=ACKNOWLEDGED ref=${referenceCode}`,
    metadata: { ...existing.metadata },
    acknowledgedAt: nowIso(),
  };
  submissions.set(submissionId, updated);
  return cloneSubmission(updated);
}

export function getSubmission(id: string): TenderSubmission | undefined {
  const submission = submissions.get(id.trim());
  return submission ? cloneSubmission(submission) : undefined;
}

export function listSubmissions(filter?: {
  tenderId?: string;
}): TenderSubmission[] {
  let result = [...submissions.values()];
  if (filter?.tenderId) {
    const tid = filter.tenderId.trim();
    result = result.filter((s) => s.tenderId === tid);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneSubmission);
}

export function clearSubmissions(): void {
  submissions.clear();
}

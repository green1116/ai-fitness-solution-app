/**
 * Product Compliance — Evidence registry
 */

import { COMPLIANCE_EVIDENCE_KINDS } from "../governance/governance.constants";
import { getComplianceControl } from "../control/control.registry";
import type {
  CollectComplianceEvidenceInput,
  ComplianceEvidence,
  ComplianceEvidenceKind,
} from "./evidence.types";

const evidences = new Map<string, ComplianceEvidence>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneEvidence(evidence: ComplianceEvidence): ComplianceEvidence {
  return { ...evidence, metadata: { ...evidence.metadata } };
}

export function collectComplianceEvidence(
  input: CollectComplianceEvidenceInput,
): ComplianceEvidence {
  const controlId = input.controlId.trim();
  const reference = input.reference.trim();
  if (!controlId) throw new Error("evidence.controlId is required");
  if (!reference) throw new Error("evidence.reference is required");
  if (!(COMPLIANCE_EVIDENCE_KINDS as readonly string[]).includes(input.kind)) {
    throw new Error(`invalid evidence kind: ${input.kind}`);
  }
  if (!getComplianceControl(controlId)) {
    throw new Error(`control not found: ${controlId}`);
  }

  const id = input.id?.trim() || createId("cmpev");
  if (evidences.has(id)) throw new Error(`evidence already exists: ${id}`);

  const evidence: ComplianceEvidence = {
    id,
    controlId,
    kind: input.kind,
    reference,
    detail: `kind=${input.kind}`,
    metadata: { ...(input.metadata ?? {}) },
    collectedAt: nowIso(),
  };
  evidences.set(id, evidence);
  return cloneEvidence(evidence);
}

export function getComplianceEvidence(
  id: string,
): ComplianceEvidence | undefined {
  const evidence = evidences.get(id.trim());
  return evidence ? cloneEvidence(evidence) : undefined;
}

export function listComplianceEvidences(filter?: {
  controlId?: string;
  kind?: ComplianceEvidenceKind;
}): ComplianceEvidence[] {
  let result = [...evidences.values()];
  if (filter?.controlId) {
    const controlId = filter.controlId.trim();
    result = result.filter((e) => e.controlId === controlId);
  }
  if (filter?.kind) result = result.filter((e) => e.kind === filter.kind);
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneEvidence);
}

export function clearComplianceEvidences(): void {
  evidences.clear();
}

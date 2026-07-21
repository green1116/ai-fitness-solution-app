/**
 * Launch P4 — Compliance Checklist
 */

import { COMPLIANCE_CHECK_IDS } from "./security.constants";
import { getSecurityProfile } from "./security.profile";
import type {
  ComplianceCheckId,
  ComplianceChecklist,
  ComplianceChecklistItem,
  CreateComplianceChecklistInput,
  SetComplianceItemInput,
} from "./security.types";

const checklists = new Map<string, ComplianceChecklist>();

const CHECK_LABELS: Record<ComplianceCheckId, string> = {
  "platform.baseline": "Platform baseline aligned",
  "admin.permission.review": "Admin permission review complete",
  "api.access.control": "API access control verified",
  "audit.trail.present": "Audit trail present",
  "least.privilege": "Least privilege enforced",
  "secret.handling": "Secret handling controls",
};

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneChecklist(checklist: ComplianceChecklist): ComplianceChecklist {
  return {
    ...checklist,
    items: checklist.items.map((i) => ({ ...i })),
  };
}

function initialItems(): ComplianceChecklistItem[] {
  return COMPLIANCE_CHECK_IDS.map((checkId) => ({
    checkId,
    label: CHECK_LABELS[checkId],
    required: true,
    status: "PENDING",
    detail: "pending",
  }));
}

function recompute(checklist: ComplianceChecklist): void {
  checklist.complete = checklist.items
    .filter((i) => i.required)
    .every((i) => i.status === "PASS" || i.status === "WAIVED");
  checklist.updatedAt = nowIso();
}

export function createComplianceChecklist(
  input: CreateComplianceChecklistInput,
): ComplianceChecklist {
  const securityProfileId = input.securityProfileId.trim();
  if (!getSecurityProfile(securityProfileId)) {
    throw new Error(`security profile not found: ${securityProfileId}`);
  }

  const id = input.id?.trim() || createId("secchecklist");
  if (checklists.has(id)) {
    throw new Error(`compliance checklist already exists: ${id}`);
  }

  const checklist: ComplianceChecklist = {
    id,
    securityProfileId,
    items: initialItems(),
    complete: false,
    updatedAt: nowIso(),
  };
  checklists.set(id, checklist);
  return cloneChecklist(checklist);
}

export function setComplianceItem(
  input: SetComplianceItemInput,
): ComplianceChecklist {
  const checklist = checklists.get(input.checklistId.trim());
  if (!checklist) {
    throw new Error(`compliance checklist not found: ${input.checklistId}`);
  }

  const item = checklist.items.find((i) => i.checkId === input.checkId);
  if (!item) throw new Error(`compliance check not found: ${input.checkId}`);

  item.status = input.status;
  item.detail = input.detail?.trim() || item.detail;
  item.updatedAt = nowIso();
  recompute(checklist);
  checklists.set(checklist.id, checklist);
  return cloneChecklist(checklist);
}

export function markRequiredCompliancePassed(
  checklistId: string,
): ComplianceChecklist {
  const checklist = checklists.get(checklistId.trim());
  if (!checklist) {
    throw new Error(`compliance checklist not found: ${checklistId}`);
  }

  for (const item of checklist.items) {
    if (item.required && item.status === "PENDING") {
      item.status = "PASS";
      item.detail = "marked passed";
      item.updatedAt = nowIso();
    }
  }
  recompute(checklist);
  checklists.set(checklist.id, checklist);
  return cloneChecklist(checklist);
}

export function getComplianceChecklist(
  id: string,
): ComplianceChecklist | undefined {
  const checklist = checklists.get(id.trim());
  return checklist ? cloneChecklist(checklist) : undefined;
}

export function listComplianceChecklists(filter?: {
  securityProfileId?: string;
}): ComplianceChecklist[] {
  let result = [...checklists.values()];
  if (filter?.securityProfileId) {
    const pid = filter.securityProfileId.trim();
    result = result.filter((c) => c.securityProfileId === pid);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneChecklist);
}

export function clearComplianceChecklists(): void {
  checklists.clear();
}

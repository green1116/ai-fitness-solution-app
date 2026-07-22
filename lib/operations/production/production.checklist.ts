/**
 * Post-Launch P1 — Operation Checklist
 */

import { OPERATION_CHECKLIST_IDS } from "./production.constants";
import { getProductionOperation } from "./production.operation";
import type {
  CreateOperationChecklistInput,
  OperationChecklist,
  OperationChecklistId,
  OperationChecklistItem,
  SetOperationChecklistItemInput,
} from "./production.types";

const checklists = new Map<string, OperationChecklist>();

const CHECK_LABELS: Record<OperationChecklistId, string> = {
  "launch.baseline": "Launch complete baseline",
  "control.plane": "Launch control plane bound",
  "cloud.health": "Cloud runtime healthy",
  observability: "Observability healthy",
  "sla.support": "SLA support active",
  "metrics.capture": "Production metrics captured",
};

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneChecklist(checklist: OperationChecklist): OperationChecklist {
  return {
    ...checklist,
    items: checklist.items.map((i) => ({ ...i })),
  };
}

function initialItems(): OperationChecklistItem[] {
  return OPERATION_CHECKLIST_IDS.map((checkId) => ({
    checkId,
    label: CHECK_LABELS[checkId],
    required: true,
    status: "PENDING",
    detail: "pending",
  }));
}

function recompute(checklist: OperationChecklist): void {
  checklist.complete = checklist.items
    .filter((i) => i.required)
    .every((i) => i.status === "PASS" || i.status === "WAIVED");
  checklist.updatedAt = nowIso();
}

export function createOperationChecklist(
  input: CreateOperationChecklistInput,
): OperationChecklist {
  const productionOperationId = input.productionOperationId.trim();
  if (!getProductionOperation(productionOperationId)) {
    throw new Error(
      `production operation not found: ${productionOperationId}`,
    );
  }

  const id = input.id?.trim() || createId("opchecklist");
  if (checklists.has(id)) {
    throw new Error(`operation checklist already exists: ${id}`);
  }

  const checklist: OperationChecklist = {
    id,
    productionOperationId,
    items: initialItems(),
    complete: false,
    updatedAt: nowIso(),
  };
  checklists.set(id, checklist);
  return cloneChecklist(checklist);
}

export function setOperationChecklistItem(
  input: SetOperationChecklistItemInput,
): OperationChecklist {
  const checklist = checklists.get(input.checklistId.trim());
  if (!checklist) {
    throw new Error(`operation checklist not found: ${input.checklistId}`);
  }
  const item = checklist.items.find((i) => i.checkId === input.checkId);
  if (!item) throw new Error(`checklist item not found: ${input.checkId}`);

  item.status = input.status;
  item.detail = input.detail?.trim() || item.detail;
  item.updatedAt = nowIso();
  recompute(checklist);
  checklists.set(checklist.id, checklist);
  return cloneChecklist(checklist);
}

export function markRequiredOperationChecklistPassed(
  checklistId: string,
): OperationChecklist {
  const checklist = checklists.get(checklistId.trim());
  if (!checklist) {
    throw new Error(`operation checklist not found: ${checklistId}`);
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

export function getOperationChecklist(
  id: string,
): OperationChecklist | undefined {
  const checklist = checklists.get(id.trim());
  return checklist ? cloneChecklist(checklist) : undefined;
}

export function listOperationChecklists(filter?: {
  productionOperationId?: string;
}): OperationChecklist[] {
  let result = [...checklists.values()];
  if (filter?.productionOperationId) {
    const oid = filter.productionOperationId.trim();
    result = result.filter((c) => c.productionOperationId === oid);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneChecklist);
}

export function clearOperationChecklists(): void {
  checklists.clear();
}

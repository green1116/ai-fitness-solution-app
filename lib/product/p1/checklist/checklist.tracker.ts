/**
 * Product P1 — Onboarding checklist
 */

import { CHECKLIST_ITEM_STATUSES } from "../onboarding/onboarding.constants";
import { getOnboardingPlan } from "../onboarding/onboarding.registry";
import type {
  ChecklistItem,
  CreateChecklistInput,
  MarkChecklistItemInput,
  OnboardingChecklist,
} from "../onboarding/onboarding.types";

const checklists = new Map<string, OnboardingChecklist>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function defaultItems(): ChecklistItem[] {
  return [
    {
      key: "intake-complete",
      label: "Customer intake recorded",
      required: true,
      status: "PENDING",
    },
    {
      key: "workspace-ready",
      label: "Workspace provisioned",
      required: true,
      status: "PENDING",
    },
    {
      key: "admin-trained",
      label: "Admin training completed",
      required: true,
      status: "PENDING",
    },
    {
      key: "go-live-approved",
      label: "Go-live approval signed",
      required: true,
      status: "PENDING",
    },
  ];
}

function cloneChecklist(checklist: OnboardingChecklist): OnboardingChecklist {
  return {
    ...checklist,
    items: checklist.items.map((i) => ({ ...i })),
  };
}

export function createOnboardingChecklist(
  input: CreateChecklistInput,
): OnboardingChecklist {
  const onboardingId = input.onboardingId.trim();
  if (!onboardingId) throw new Error("checklist.onboardingId is required");
  if (!getOnboardingPlan(onboardingId)) {
    throw new Error(`onboarding plan not found: ${onboardingId}`);
  }

  const id = input.id?.trim() || createId("p1chk");
  if (checklists.has(id)) {
    throw new Error(`checklist already exists: ${id}`);
  }

  const checklist: OnboardingChecklist = {
    id,
    onboardingId,
    items: defaultItems(),
    detail: `items=${defaultItems().length}`,
    updatedAt: nowIso(),
  };
  checklists.set(id, checklist);
  return cloneChecklist(checklist);
}

export function markChecklistItem(
  input: MarkChecklistItemInput,
): OnboardingChecklist {
  const checklistId = input.checklistId.trim();
  const key = input.key.trim();
  if (!checklistId) throw new Error("checklist.checklistId is required");
  if (!key) throw new Error("checklist.key is required");
  if (
    !(CHECKLIST_ITEM_STATUSES as readonly string[]).includes(input.status)
  ) {
    throw new Error(`invalid checklist item status: ${input.status}`);
  }

  const existing = checklists.get(checklistId);
  if (!existing) {
    throw new Error(`checklist not found: ${checklistId}`);
  }

  const items = existing.items.map((item) =>
    item.key === key ? { ...item, status: input.status } : { ...item },
  );
  if (!items.some((i) => i.key === key)) {
    throw new Error(`checklist item not found: ${key}`);
  }

  const updated: OnboardingChecklist = {
    ...existing,
    items,
    detail: `passed=${items.filter((i) => i.status === "PASSED").length}/${items.length}`,
    updatedAt: nowIso(),
  };
  checklists.set(checklistId, updated);
  return cloneChecklist(updated);
}

export function getOnboardingChecklist(
  id: string,
): OnboardingChecklist | undefined {
  const checklist = checklists.get(id.trim());
  return checklist ? cloneChecklist(checklist) : undefined;
}

export function listOnboardingChecklists(filter?: {
  onboardingId?: string;
}): OnboardingChecklist[] {
  let result = [...checklists.values()];
  if (filter?.onboardingId) {
    const oid = filter.onboardingId.trim();
    result = result.filter((c) => c.onboardingId === oid);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneChecklist);
}

export function clearOnboardingChecklists(): void {
  checklists.clear();
}

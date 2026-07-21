/**
 * Launch P2 — Onboarding Checklist
 */

import { ONBOARDING_CHECKLIST_ITEM_STATUSES } from "./onboarding.constants";
import { getOnboardingProfile } from "./onboarding.profile";
import type {
  OnboardingChecklist,
  OnboardingChecklistItem,
  SetOnboardingChecklistItemInput,
} from "./onboarding.types";

const checklists = new Map<string, OnboardingChecklist>();

const DEFAULT_ITEMS: Array<{
  key: string;
  label: string;
  required: boolean;
}> = [
  {
    key: "launch.readiness",
    label: "Production launch readiness READY",
    required: true,
  },
  {
    key: "tenant.provisioned",
    label: "Tenant provisioning complete",
    required: true,
  },
  {
    key: "organization.linked",
    label: "Organization linked",
    required: true,
  },
  {
    key: "customer.configured",
    label: "Customer configuration applied",
    required: true,
  },
  {
    key: "activation.pending",
    label: "Activation state prepared",
    required: true,
  },
  {
    key: "training.ack",
    label: "Customer training acknowledged",
    required: false,
  },
];

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function summarize(items: OnboardingChecklistItem[]): {
  passCount: number;
  failCount: number;
  pendingCount: number;
  complete: boolean;
} {
  const passCount = items.filter((i) => i.status === "PASSED").length;
  const failCount = items.filter((i) => i.status === "FAILED").length;
  const pendingCount = items.filter((i) => i.status === "PENDING").length;
  const required = items.filter((i) => i.required);
  const complete =
    failCount === 0 &&
    required.every((i) => i.status === "PASSED" || i.status === "SKIPPED");
  return { passCount, failCount, pendingCount, complete };
}

function cloneChecklist(checklist: OnboardingChecklist): OnboardingChecklist {
  return {
    ...checklist,
    items: checklist.items.map((i) => ({ ...i })),
  };
}

export function createOnboardingChecklist(input: {
  id?: string;
  onboardingProfileId: string;
}): OnboardingChecklist {
  const onboardingProfileId = input.onboardingProfileId.trim();
  if (!getOnboardingProfile(onboardingProfileId)) {
    throw new Error(`onboarding profile not found: ${onboardingProfileId}`);
  }

  const id = input.id?.trim() || createId("onbchecklist");
  if (checklists.has(id)) throw new Error(`checklist already exists: ${id}`);

  const items: OnboardingChecklistItem[] = DEFAULT_ITEMS.map((item, index) => ({
    id: `${id}.item.${index + 1}`,
    key: item.key,
    label: item.label,
    status: "PENDING",
    required: item.required,
    detail: "pending",
  }));

  const stats = summarize(items);
  const checklist: OnboardingChecklist = {
    id,
    onboardingProfileId,
    items,
    ...stats,
    updatedAt: nowIso(),
  };
  checklists.set(id, checklist);
  return cloneChecklist(checklist);
}

export function setOnboardingChecklistItem(
  input: SetOnboardingChecklistItemInput,
): OnboardingChecklist {
  const checklist = checklists.get(input.checklistId.trim());
  if (!checklist) throw new Error(`checklist not found: ${input.checklistId}`);
  if (
    !(ONBOARDING_CHECKLIST_ITEM_STATUSES as readonly string[]).includes(
      input.status,
    )
  ) {
    throw new Error(`invalid checklist item status: ${input.status}`);
  }

  const item = checklist.items.find((i) => i.key === input.itemKey.trim());
  if (!item) throw new Error(`checklist item not found: ${input.itemKey}`);

  item.status = input.status;
  item.detail = input.detail?.trim() || item.detail;
  const stats = summarize(checklist.items);
  checklist.passCount = stats.passCount;
  checklist.failCount = stats.failCount;
  checklist.pendingCount = stats.pendingCount;
  checklist.complete = stats.complete;
  checklist.updatedAt = nowIso();
  checklists.set(checklist.id, checklist);
  return cloneChecklist(checklist);
}

export function markRequiredOnboardingChecklistPassed(
  checklistId: string,
): OnboardingChecklist {
  const checklist = checklists.get(checklistId.trim());
  if (!checklist) throw new Error(`checklist not found: ${checklistId}`);
  for (const item of checklist.items) {
    if (item.required && item.status === "PENDING") {
      item.status = "PASSED";
      item.detail = "auto-marked passed";
    }
  }
  const stats = summarize(checklist.items);
  checklist.passCount = stats.passCount;
  checklist.failCount = stats.failCount;
  checklist.pendingCount = stats.pendingCount;
  checklist.complete = stats.complete;
  checklist.updatedAt = nowIso();
  checklists.set(checklist.id, checklist);
  return cloneChecklist(checklist);
}

export function getOnboardingChecklist(
  id: string,
): OnboardingChecklist | undefined {
  const checklist = checklists.get(id.trim());
  return checklist ? cloneChecklist(checklist) : undefined;
}

export function listOnboardingChecklists(filter?: {
  onboardingProfileId?: string;
}): OnboardingChecklist[] {
  let result = [...checklists.values()];
  if (filter?.onboardingProfileId) {
    const oid = filter.onboardingProfileId.trim();
    result = result.filter((c) => c.onboardingProfileId === oid);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneChecklist);
}

export function clearOnboardingChecklists(): void {
  checklists.clear();
}

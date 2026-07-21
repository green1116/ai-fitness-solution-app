/**
 * Launch P1 — Release Checklist
 */

import { RELEASE_CHECKLIST_ITEM_STATUSES } from "./launch.constants";
import { getProductionProfile } from "./launch.profile";
import type {
  ReleaseChecklist,
  ReleaseChecklistItem,
  SetChecklistItemStatusInput,
} from "./launch.types";

const checklists = new Map<string, ReleaseChecklist>();

const DEFAULT_ITEMS: Array<{
  key: string;
  label: string;
  required: boolean;
}> = [
  {
    key: "platform.aligned",
    label: "Platform v1 baseline aligned",
    required: true,
  },
  {
    key: "product.foundation",
    label: "Product foundation ready",
    required: true,
  },
  {
    key: "productization.complete",
    label: "E12 productization complete freeze",
    required: true,
  },
  {
    key: "deployment.package",
    label: "Deployment package bound and validated",
    required: true,
  },
  {
    key: "artifacts.registered",
    label: "Production artifacts registered",
    required: true,
  },
  {
    key: "security.review",
    label: "Security review acknowledged",
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

function summarize(items: ReleaseChecklistItem[]): {
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

function cloneChecklist(checklist: ReleaseChecklist): ReleaseChecklist {
  return {
    ...checklist,
    items: checklist.items.map((i) => ({ ...i })),
  };
}

export function createReleaseChecklist(input: {
  id?: string;
  productionProfileId: string;
}): ReleaseChecklist {
  const productionProfileId = input.productionProfileId.trim();
  if (!getProductionProfile(productionProfileId)) {
    throw new Error(`production profile not found: ${productionProfileId}`);
  }

  const id = input.id?.trim() || createId("checklist");
  if (checklists.has(id)) throw new Error(`checklist already exists: ${id}`);

  const items: ReleaseChecklistItem[] = DEFAULT_ITEMS.map((item, index) => ({
    id: `${id}.item.${index + 1}`,
    key: item.key,
    label: item.label,
    status: "PENDING",
    required: item.required,
    detail: "pending",
  }));

  const stats = summarize(items);
  const checklist: ReleaseChecklist = {
    id,
    productionProfileId,
    items,
    ...stats,
    updatedAt: nowIso(),
  };
  checklists.set(id, checklist);
  return cloneChecklist(checklist);
}

export function setChecklistItemStatus(
  input: SetChecklistItemStatusInput,
): ReleaseChecklist {
  const checklist = checklists.get(input.checklistId.trim());
  if (!checklist) {
    throw new Error(`checklist not found: ${input.checklistId}`);
  }
  if (
    !(RELEASE_CHECKLIST_ITEM_STATUSES as readonly string[]).includes(
      input.status,
    )
  ) {
    throw new Error(`invalid checklist item status: ${input.status}`);
  }

  const item = checklist.items.find((i) => i.key === input.itemKey.trim());
  if (!item) {
    throw new Error(`checklist item not found: ${input.itemKey}`);
  }

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

export function getReleaseChecklist(id: string): ReleaseChecklist | undefined {
  const checklist = checklists.get(id.trim());
  return checklist ? cloneChecklist(checklist) : undefined;
}

export function listReleaseChecklists(filter?: {
  productionProfileId?: string;
}): ReleaseChecklist[] {
  let result = [...checklists.values()];
  if (filter?.productionProfileId) {
    const pid = filter.productionProfileId.trim();
    result = result.filter((c) => c.productionProfileId === pid);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneChecklist);
}

export function markRequiredChecklistPassed(
  checklistId: string,
): ReleaseChecklist {
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

export function clearReleaseChecklists(): void {
  checklists.clear();
}

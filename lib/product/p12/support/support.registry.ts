/**
 * Product P12 — Support registry
 */

import { SUPPORT_PRIORITIES } from "../launch/launch.constants";
import { getLaunch } from "../launch/launch.registry";
import type {
  CloseSupportCaseInput,
  LaunchSupportCase,
  OpenSupportCaseInput,
  SupportPriority,
} from "./support.types";

const cases = new Map<string, LaunchSupportCase>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneCase(supportCase: LaunchSupportCase): LaunchSupportCase {
  return { ...supportCase, metadata: { ...supportCase.metadata } };
}

export function openSupportCase(
  input: OpenSupportCaseInput,
): LaunchSupportCase {
  const launchId = input.launchId.trim();
  const title = input.title.trim();
  const owner = input.owner.trim();
  if (!launchId) throw new Error("support.launchId is required");
  if (!title) throw new Error("support.title is required");
  if (!owner) throw new Error("support.owner is required");
  if (!(SUPPORT_PRIORITIES as readonly string[]).includes(input.priority)) {
    throw new Error(`invalid support priority: ${input.priority}`);
  }
  if (!getLaunch(launchId)) {
    throw new Error(`launch not found: ${launchId}`);
  }

  const id = input.id?.trim() || createId("p12sup");
  if (cases.has(id)) {
    throw new Error(`support case already exists: ${id}`);
  }

  const supportCase: LaunchSupportCase = {
    id,
    launchId,
    title,
    priority: input.priority,
    owner,
    open: true,
    detail: `priority=${input.priority} open=true`,
    metadata: { ...(input.metadata ?? {}) },
    openedAt: nowIso(),
  };
  cases.set(id, supportCase);
  return cloneCase(supportCase);
}

export function closeSupportCase(
  input: CloseSupportCaseInput,
): LaunchSupportCase {
  const caseId = input.caseId.trim();
  if (!caseId) throw new Error("support.caseId is required");
  const existing = cases.get(caseId);
  if (!existing) throw new Error(`support case not found: ${caseId}`);
  if (!existing.open) {
    throw new Error(`support case already closed: ${caseId}`);
  }

  const updated: LaunchSupportCase = {
    ...existing,
    open: false,
    detail: `priority=${existing.priority} open=false`,
    metadata: { ...existing.metadata },
    closedAt: nowIso(),
  };
  cases.set(caseId, updated);
  return cloneCase(updated);
}

export function getSupportCase(id: string): LaunchSupportCase | undefined {
  const supportCase = cases.get(id.trim());
  return supportCase ? cloneCase(supportCase) : undefined;
}

export function listSupportCases(filter?: {
  launchId?: string;
  priority?: SupportPriority;
}): LaunchSupportCase[] {
  let result = [...cases.values()];
  if (filter?.launchId) {
    const lid = filter.launchId.trim();
    result = result.filter((c) => c.launchId === lid);
  }
  if (filter?.priority) {
    result = result.filter((c) => c.priority === filter.priority);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneCase);
}

export function clearSupportCases(): void {
  cases.clear();
}

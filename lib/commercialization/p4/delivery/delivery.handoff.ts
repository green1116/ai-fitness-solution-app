/**
 * Commercialization P4 — Delivery handoff
 */

import { HANDOFF_STATUSES } from "../onboarding/onboarding.constants";
import { getCustomerAccount } from "../account/account.registry";
import { getOnboardingPlan } from "../onboarding/onboarding.registry";
import { getCustomerWorkspace } from "../workspace/workspace.registry";
import type {
  CreateHandoffInput,
  DeliveryHandoff,
  HandoffStatus,
} from "./delivery.types";

const handoffs = new Map<string, DeliveryHandoff>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneHandoff(handoff: DeliveryHandoff): DeliveryHandoff {
  return { ...handoff };
}

export function createDeliveryHandoff(
  input: CreateHandoffInput,
): DeliveryHandoff {
  const accountId = input.accountId.trim();
  const onboardingId = input.onboardingId.trim();
  const workspaceId = input.workspaceId.trim();

  const account = getCustomerAccount(accountId);
  if (!account) throw new Error(`account not found: ${accountId}`);

  const plan = getOnboardingPlan(onboardingId);
  if (!plan) throw new Error(`onboarding plan not found: ${onboardingId}`);
  if (plan.accountId !== accountId) {
    throw new Error(`onboarding account mismatch`);
  }

  const workspace = getCustomerWorkspace(workspaceId);
  if (!workspace) throw new Error(`workspace not found: ${workspaceId}`);
  if (workspace.accountId !== accountId) {
    throw new Error(`workspace account mismatch`);
  }
  if (workspace.status !== "READY" && workspace.status !== "LIVE") {
    throw new Error(
      `handoff requires READY/LIVE workspace (status=${workspace.status})`,
    );
  }

  const status: HandoffStatus = "PENDING";
  if (!(HANDOFF_STATUSES as readonly string[]).includes(status)) {
    throw new Error(`invalid handoff status: ${status}`);
  }

  const id = input.id?.trim() || createId("hand");
  if (handoffs.has(id)) {
    throw new Error(`delivery handoff already exists: ${id}`);
  }

  const handoff: DeliveryHandoff = {
    id,
    accountId,
    onboardingId,
    workspaceId,
    status,
    recipient: (input.recipient ?? "delivery-ops").trim() || "delivery-ops",
    notes: (input.notes ?? "").trim(),
    detail: `status=${status} workspace=${workspaceId}`,
    handedOffAt: nowIso(),
  };
  handoffs.set(id, handoff);
  return cloneHandoff(handoff);
}

export function acceptDeliveryHandoff(id: string): DeliveryHandoff {
  const handoff = handoffs.get(id.trim());
  if (!handoff) throw new Error(`delivery handoff not found: ${id}`);
  handoff.status = "ACCEPTED";
  handoff.detail = `status=ACCEPTED workspace=${handoff.workspaceId}`;
  handoffs.set(handoff.id, handoff);
  return cloneHandoff(handoff);
}

export function completeDeliveryHandoff(id: string): DeliveryHandoff {
  const handoff = handoffs.get(id.trim());
  if (!handoff) throw new Error(`delivery handoff not found: ${id}`);
  if (handoff.status !== "ACCEPTED" && handoff.status !== "COMPLETE") {
    throw new Error(
      `complete requires ACCEPTED handoff (status=${handoff.status})`,
    );
  }
  handoff.status = "COMPLETE";
  handoff.detail = `status=COMPLETE workspace=${handoff.workspaceId}`;
  handoffs.set(handoff.id, handoff);
  return cloneHandoff(handoff);
}

export function getDeliveryHandoff(id: string): DeliveryHandoff | undefined {
  const handoff = handoffs.get(id.trim());
  return handoff ? cloneHandoff(handoff) : undefined;
}

export function listDeliveryHandoffs(filter?: {
  accountId?: string;
  status?: HandoffStatus;
}): DeliveryHandoff[] {
  let result = [...handoffs.values()];
  if (filter?.accountId) {
    const aid = filter.accountId.trim();
    result = result.filter((h) => h.accountId === aid);
  }
  if (filter?.status) result = result.filter((h) => h.status === filter.status);
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneHandoff);
}

export function clearDeliveryHandoffs(): void {
  handoffs.clear();
}

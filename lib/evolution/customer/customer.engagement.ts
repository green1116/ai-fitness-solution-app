/**
 * Evolution P3 — Engagement Automation
 */

import { getCustomerRiskSignal } from "../predictive/predictive.customer";
import {
  ENGAGEMENT_CHANNELS,
  ENGAGEMENT_STATUSES,
} from "./customer.constants";
import { getCustomerIntelligenceProfile } from "./customer.intelligence";
import type {
  AutomateEngagementInput,
  EngagementAutomation,
  EngagementChannel,
  EngagementStatus,
} from "./customer.types";

const engagements = new Map<string, EngagementAutomation>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneEngagement(
  engagement: EngagementAutomation,
): EngagementAutomation {
  return { ...engagement };
}

export function automateEngagement(
  input: AutomateEngagementInput,
): EngagementAutomation {
  const profile = getCustomerIntelligenceProfile(
    input.customerIntelligenceId.trim(),
  );
  if (!profile) {
    throw new Error(
      `customer intelligence profile not found: ${input.customerIntelligenceId}`,
    );
  }

  let channel: EngagementChannel = input.channel ?? "PLAYBOOK";
  let trigger = input.trigger?.trim() || "scheduled-success-touch";
  let action =
    input.action?.trim() || "run autonomous success engagement playbook";
  let priority = 3;

  if (profile.customerRiskSignalId) {
    const risk = getCustomerRiskSignal(profile.customerRiskSignalId);
    if (risk && (risk.level === "AT_RISK" || risk.level === "CRITICAL")) {
      channel = input.channel ?? "CSM";
      trigger = input.trigger?.trim() || `risk-${risk.level.toLowerCase()}`;
      action =
        input.action?.trim() ||
        "escalate autonomous retention outreach to CSM";
      priority = risk.level === "CRITICAL" ? 1 : 2;
    } else if (risk && risk.level === "WATCH") {
      channel = input.channel ?? "EMAIL";
      trigger = input.trigger?.trim() || "watch-signal";
      priority = 2;
    }
  }

  if (profile.intelligenceScore >= 75 && !input.channel) {
    channel = "IN_APP";
    priority = Math.min(priority, 3);
  }

  if (!(ENGAGEMENT_CHANNELS as readonly string[]).includes(channel)) {
    throw new Error(`invalid engagement channel: ${channel}`);
  }

  const status: EngagementStatus =
    profile.mode === "OBSERVE" ? "SKIPPED" : "COMPLETED";
  if (!(ENGAGEMENT_STATUSES as readonly string[]).includes(status)) {
    throw new Error(`invalid engagement status: ${status}`);
  }

  const id = input.id?.trim() || createId("engage");
  if (engagements.has(id)) {
    throw new Error(`engagement automation already exists: ${id}`);
  }

  const now = nowIso();
  const engagement: EngagementAutomation = {
    id,
    customerIntelligenceId: profile.id,
    channel,
    status,
    trigger,
    action,
    priority,
    detail: `channel=${channel} status=${status} priority=${priority}`,
    createdAt: now,
    completedAt: status === "COMPLETED" || status === "SKIPPED" ? now : undefined,
  };
  engagements.set(id, engagement);
  return cloneEngagement(engagement);
}

export function getEngagementAutomation(
  id: string,
): EngagementAutomation | undefined {
  const engagement = engagements.get(id.trim());
  return engagement ? cloneEngagement(engagement) : undefined;
}

export function listEngagementAutomations(filter?: {
  customerIntelligenceId?: string;
  status?: EngagementStatus;
}): EngagementAutomation[] {
  let result = [...engagements.values()];
  if (filter?.customerIntelligenceId) {
    const cid = filter.customerIntelligenceId.trim();
    result = result.filter((e) => e.customerIntelligenceId === cid);
  }
  if (filter?.status) result = result.filter((e) => e.status === filter.status);
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneEngagement);
}

export function clearEngagementAutomations(): void {
  engagements.clear();
}

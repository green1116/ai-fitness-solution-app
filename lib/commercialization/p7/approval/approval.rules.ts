/**
 * Commercialization P7 — Approval rules
 */

import type {
  ApprovalRule,
  DefineApprovalRuleInput,
} from "./approval.types";

const rules = new Map<string, ApprovalRule>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneRule(rule: ApprovalRule): ApprovalRule {
  return { ...rule };
}

export function defineApprovalRule(
  input: DefineApprovalRuleInput,
): ApprovalRule {
  const name = input.name.trim();
  if (!name) throw new Error("approvalRule.name is required");
  if (!Number.isFinite(input.maxAutoApprove) || input.maxAutoApprove < 0) {
    throw new Error("approvalRule.maxAutoApprove must be non-negative");
  }
  if (!Number.isFinite(input.escalateAbove) || input.escalateAbove < 0) {
    throw new Error("approvalRule.escalateAbove must be non-negative");
  }
  if (input.escalateAbove < input.maxAutoApprove) {
    throw new Error(
      "approvalRule.escalateAbove must be >= maxAutoApprove",
    );
  }

  const id = input.id?.trim() || createId("aru");
  if (rules.has(id)) {
    throw new Error(`approval rule already exists: ${id}`);
  }

  const maxAutoApprove = Math.round(input.maxAutoApprove);
  const escalateAbove = Math.round(input.escalateAbove);
  const rule: ApprovalRule = {
    id,
    name,
    maxAutoApprove,
    escalateAbove,
    detail: `auto<=${maxAutoApprove} escalate>${escalateAbove}`,
    createdAt: nowIso(),
  };
  rules.set(id, rule);
  return cloneRule(rule);
}

export function evaluateApprovalAmount(
  amount: number,
  ruleId?: string,
): "AUTO_APPROVE" | "REVIEW" | "ESCALATE" {
  if (!Number.isFinite(amount) || amount < 0) {
    throw new Error("amount must be a non-negative number");
  }
  const rule = ruleId
    ? rules.get(ruleId.trim())
    : [...rules.values()].sort((a, b) => a.id.localeCompare(b.id))[0];
  if (!rule) throw new Error("no approval rule available");

  const rounded = Math.round(amount);
  if (rounded <= rule.maxAutoApprove) return "AUTO_APPROVE";
  if (rounded > rule.escalateAbove) return "ESCALATE";
  return "REVIEW";
}

export function getApprovalRule(id: string): ApprovalRule | undefined {
  const rule = rules.get(id.trim());
  return rule ? cloneRule(rule) : undefined;
}

export function listApprovalRules(): ApprovalRule[] {
  return [...rules.values()]
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneRule);
}

export function clearApprovalRules(): void {
  rules.clear();
}

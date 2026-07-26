/**
 * Product Channel — Validation registry (deterministic, offline)
 */

import { listChannelCapabilities } from "../capability/capability.registry";
import { listChannelPolicies } from "../policy/policy.registry";
import { getChannel } from "../registry/channel.registry";
import type {
  ChannelValidation,
  ChannelValidationVerdict,
  ValidateChannelInput,
} from "./validation.types";

const validations = new Map<string, ChannelValidation>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneValidation(validation: ChannelValidation): ChannelValidation {
  return {
    ...validation,
    reasons: [...validation.reasons],
    metadata: { ...validation.metadata },
  };
}

export function validateChannel(
  input: ValidateChannelInput,
): ChannelValidation {
  const channelId = input.channelId.trim();
  if (!channelId) throw new Error("validation.channelId is required");

  const channel = getChannel(channelId);
  if (!channel) throw new Error(`channel not found: ${channelId}`);

  const reasons: string[] = [];
  if (channel.status !== "ACTIVE") reasons.push("channel_not_active");
  if (!channel.channelKey) reasons.push("channel_key_missing");

  const capabilities = listChannelCapabilities({ channelId });
  if (capabilities.length < 1) reasons.push("capability_missing");
  else if (!capabilities[0].features.includes("SUPPORTS_TEMPLATE")) {
    reasons.push("capability_template_required");
  }

  const policies = listChannelPolicies({ channelId });
  if (policies.length < 1) reasons.push("policy_missing");
  else if (policies[0].requireTemplate !== true) {
    reasons.push("policy_template_required");
  }

  let verdict: ChannelValidationVerdict = "VALID";
  if (reasons.length > 0) {
    const structural =
      reasons.includes("capability_missing") ||
      reasons.includes("policy_missing");
    verdict = structural ? "INCOMPLETE" : "INVALID";
  }

  const id = input.id?.trim() || createId("chnval");
  if (validations.has(id)) throw new Error(`validation already exists: ${id}`);

  const validation: ChannelValidation = {
    id,
    channelId,
    verdict,
    reasons,
    detail: `verdict=${verdict} reasons=${reasons.length}`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: nowIso(),
  };
  validations.set(id, validation);
  return cloneValidation(validation);
}

export function getChannelValidation(
  id: string,
): ChannelValidation | undefined {
  const validation = validations.get(id.trim());
  return validation ? cloneValidation(validation) : undefined;
}

export function listChannelValidations(filter?: {
  channelId?: string;
}): ChannelValidation[] {
  let result = [...validations.values()];
  if (filter?.channelId) {
    const channelId = filter.channelId.trim();
    result = result.filter((v) => v.channelId === channelId);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneValidation);
}

export function clearChannelValidations(): void {
  validations.clear();
}

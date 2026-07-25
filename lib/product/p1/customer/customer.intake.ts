/**
 * Product P1 — Customer intake
 */

import { INTAKE_CHANNELS } from "../onboarding/onboarding.constants";
import type {
  CustomerIntake,
  IntakeChannel,
  RecordCustomerIntakeInput,
} from "../onboarding/onboarding.types";
import { getCustomerProfile } from "./customer.profile";

const intakes = new Map<string, CustomerIntake>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneIntake(intake: CustomerIntake): CustomerIntake {
  return { ...intake };
}

export function recordCustomerIntake(
  input: RecordCustomerIntakeInput,
): CustomerIntake {
  const profileId = input.profileId.trim();
  const summary = input.summary.trim();
  if (!profileId) throw new Error("intake.profileId is required");
  if (!summary) throw new Error("intake.summary is required");
  if (!(INTAKE_CHANNELS as readonly string[]).includes(input.channel)) {
    throw new Error(`invalid intake channel: ${input.channel}`);
  }
  if (!getCustomerProfile(profileId)) {
    throw new Error(`customer profile not found: ${profileId}`);
  }

  const id = input.id?.trim() || createId("p1int");
  if (intakes.has(id)) {
    throw new Error(`customer intake already exists: ${id}`);
  }

  const intake: CustomerIntake = {
    id,
    profileId,
    channel: input.channel,
    summary,
    detail: `channel=${input.channel} profile=${profileId}`,
    recordedAt: nowIso(),
  };
  intakes.set(id, intake);
  return cloneIntake(intake);
}

export function getCustomerIntake(id: string): CustomerIntake | undefined {
  const intake = intakes.get(id.trim());
  return intake ? cloneIntake(intake) : undefined;
}

export function listCustomerIntakes(filter?: {
  profileId?: string;
  channel?: IntakeChannel;
}): CustomerIntake[] {
  let result = [...intakes.values()];
  if (filter?.profileId) {
    const pid = filter.profileId.trim();
    result = result.filter((i) => i.profileId === pid);
  }
  if (filter?.channel) {
    result = result.filter((i) => i.channel === filter.channel);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneIntake);
}

export function clearCustomerIntakes(): void {
  intakes.clear();
}

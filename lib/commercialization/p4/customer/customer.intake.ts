/**
 * Commercialization P4 — Customer intake
 */

import { INTAKE_CHANNELS } from "../onboarding/onboarding.constants";
import { getCustomerAccount } from "../account/account.registry";
import type {
  CustomerIntake,
  IntakeChannel,
  RecordIntakeInput,
} from "./customer.types";

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
  input: RecordIntakeInput,
): CustomerIntake {
  const accountId = input.accountId.trim();
  if (!(INTAKE_CHANNELS as readonly string[]).includes(input.channel)) {
    throw new Error(`invalid intake channel: ${input.channel}`);
  }

  const account = getCustomerAccount(accountId);
  if (!account) throw new Error(`account not found: ${accountId}`);

  const notes = (input.notes ?? "").trim();
  const sourceRef =
    (input.sourceRef ?? account.contractRef).trim() || account.contractRef;
  const completeness = Math.min(
    100,
    40 + (notes.length > 0 ? 30 : 0) + (sourceRef.length > 0 ? 30 : 0),
  );

  const id = input.id?.trim() || createId("cintake");
  if (intakes.has(id)) {
    throw new Error(`customer intake already exists: ${id}`);
  }

  const intake: CustomerIntake = {
    id,
    accountId,
    channel: input.channel,
    sourceRef,
    notes,
    completeness,
    detail: `channel=${input.channel} completeness=${completeness}`,
    intakeAt: nowIso(),
  };
  intakes.set(id, intake);
  return cloneIntake(intake);
}

export function getCustomerIntake(id: string): CustomerIntake | undefined {
  const intake = intakes.get(id.trim());
  return intake ? cloneIntake(intake) : undefined;
}

export function listCustomerIntakes(filter?: {
  accountId?: string;
  channel?: IntakeChannel;
}): CustomerIntake[] {
  let result = [...intakes.values()];
  if (filter?.accountId) {
    const aid = filter.accountId.trim();
    result = result.filter((i) => i.accountId === aid);
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

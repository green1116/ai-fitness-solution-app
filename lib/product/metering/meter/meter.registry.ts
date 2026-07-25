/**
 * Product Metering — Meter registry
 */

import {
  METER_STATUSES,
  METER_UNITS,
} from "../usage/usage.constants";
import type {
  MeterStatus,
  MeterUnit,
  RegisterMeterInput,
  UpdateMeterStatusInput,
  UsageMeter,
} from "./meter.types";

const meters = new Map<string, UsageMeter>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneMeter(meter: UsageMeter): UsageMeter {
  return { ...meter, metadata: { ...meter.metadata } };
}

export function registerMeter(input: RegisterMeterInput): UsageMeter {
  const code = input.code.trim().toUpperCase();
  const name = input.name.trim();
  if (!code) throw new Error("meter.code is required");
  if (!name) throw new Error("meter.name is required");
  if (!(METER_UNITS as readonly string[]).includes(input.unit)) {
    throw new Error(`invalid meter unit: ${input.unit}`);
  }

  const id = input.id?.trim() || createId("metmtr");
  if (meters.has(id)) throw new Error(`meter already exists: ${id}`);

  const meter: UsageMeter = {
    id,
    code,
    name,
    unit: input.unit,
    status: METER_STATUSES[0],
    detail: `unit=${input.unit} status=ACTIVE`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: nowIso(),
  };
  meters.set(id, meter);
  return cloneMeter(meter);
}

export function updateMeterStatus(
  input: UpdateMeterStatusInput,
): UsageMeter {
  const meterId = input.meterId.trim();
  if (!meterId) throw new Error("meter.meterId is required");
  if (!(METER_STATUSES as readonly string[]).includes(input.status)) {
    throw new Error(`invalid meter status: ${input.status}`);
  }

  const existing = meters.get(meterId);
  if (!existing) throw new Error(`meter not found: ${meterId}`);

  const updated: UsageMeter = {
    ...existing,
    status: input.status,
    detail: `unit=${existing.unit} status=${input.status}`,
    metadata: { ...existing.metadata },
  };
  meters.set(meterId, updated);
  return cloneMeter(updated);
}

export function getMeter(id: string): UsageMeter | undefined {
  const meter = meters.get(id.trim());
  return meter ? cloneMeter(meter) : undefined;
}

export function listMeters(filter?: {
  unit?: MeterUnit;
  status?: MeterStatus;
}): UsageMeter[] {
  let result = [...meters.values()];
  if (filter?.unit) result = result.filter((m) => m.unit === filter.unit);
  if (filter?.status) {
    result = result.filter((m) => m.status === filter.status);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneMeter);
}

export function clearMeters(): void {
  meters.clear();
}

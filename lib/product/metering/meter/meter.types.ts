/**
 * Product Metering — Meter types
 */

import type {
  METER_STATUSES,
  METER_UNITS,
} from "../usage/usage.constants";

export type MeterUnit = (typeof METER_UNITS)[number];
export type MeterStatus = (typeof METER_STATUSES)[number];
export type MeterMetadata = Record<string, unknown>;

export type UsageMeter = {
  id: string;
  code: string;
  name: string;
  unit: MeterUnit;
  status: MeterStatus;
  detail: string;
  metadata: MeterMetadata;
  createdAt: string;
};

export type RegisterMeterInput = {
  id?: string;
  code: string;
  name: string;
  unit: MeterUnit;
  metadata?: MeterMetadata;
};

export type UpdateMeterStatusInput = {
  meterId: string;
  status: MeterStatus;
};

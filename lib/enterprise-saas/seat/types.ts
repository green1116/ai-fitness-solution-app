import type { ENTERPRISE_SAAS_VERSION } from "../shared/types";

export const SEAT_RUNTIME_VERSION = "v10.5-seat-runtime-1" as const;

export interface SeatAllocation {
  allocationId: string;
  tenantId: string;
  licensedSeats: number;
  activeSeats: number;
  availableSeats: number;
  utilizationRate: number;
}

export interface SeatRuntimePayload {
  version: typeof SEAT_RUNTIME_VERSION;
  saasVersion: typeof ENTERPRISE_SAAS_VERSION;
  allocation: SeatAllocation;
  summary: string;
}

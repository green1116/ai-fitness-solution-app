/**
 * PL-5 — Maintenance types.
 * In-memory maintenance core only — no IO / persistence / providers.
 */

export const MAINTENANCE_ID = "pl-5-maintenance-v1" as const;

export const MAINTENANCE_STATES = [
  "scheduled",
  "active",
  "paused",
  "completed",
  "cancelled",
] as const;

export type MaintenanceState = (typeof MAINTENANCE_STATES)[number];

/** Deterministic maintenance policy. */
export type MaintenancePolicy = Readonly<{
  /** Maximum concurrent active windows. */
  maxConcurrentActive: number;
  /** Minimum window duration in logical time units. */
  minDuration: number;
  /** Maximum window duration in logical time units. */
  maxDuration: number;
  /** Whether active windows may be extended. */
  allowExtend: boolean;
  /** Whether cancelled windows may be rescheduled as new scheduled entries. */
  allowReschedule: boolean;
}>;

export const DEFAULT_MAINTENANCE_POLICY: MaintenancePolicy = {
  maxConcurrentActive: 2,
  minDuration: 1,
  maxDuration: 10_000,
  allowExtend: true,
  allowReschedule: true,
};

export type MaintenanceWindow = Readonly<{
  maintenanceId: string;
  title: string;
  state: MaintenanceState;
  /** Logical schedule start (caller-provided). */
  startAt: number;
  /** Logical schedule end (caller-provided / extendable). */
  endAt: number;
  /** Optional opaque service ref (string only). */
  serviceId?: string;
  createdAt: number;
  updatedAt: number;
  activatedAt?: number;
  completedAt?: number;
  cancelledAt?: number;
}>;

export type ScheduleMaintenanceInput = Readonly<{
  title: string;
  startAt: number;
  endAt: number;
  serviceId?: string;
  /** Optional stable id — when omitted, manager assigns sequential id. */
  maintenanceId?: string;
}>;

export type ActivateMaintenanceInput = Readonly<{
  maintenanceId: string;
}>;

export type PauseMaintenanceInput = Readonly<{
  maintenanceId: string;
}>;

export type ResumeMaintenanceInput = Readonly<{
  maintenanceId: string;
}>;

export type CompleteMaintenanceInput = Readonly<{
  maintenanceId: string;
}>;

export type CancelMaintenanceInput = Readonly<{
  maintenanceId: string;
}>;

export type ExtendMaintenanceInput = Readonly<{
  maintenanceId: string;
  endAt: number;
}>;

export type RescheduleMaintenanceInput = Readonly<{
  maintenanceId: string;
  startAt: number;
  endAt: number;
}>;

/** Schedule view — windows ordered by startAt. */
export type MaintenanceSchedule = Readonly<{
  at: number;
  windowCount: number;
  windows: readonly MaintenanceWindow[];
}>;

export type MaintenanceSnapshot = Readonly<{
  at: number;
  windowCount: number;
  scheduledCount: number;
  activeCount: number;
  pausedCount: number;
  completedCount: number;
  cancelledCount: number;
  policy: MaintenancePolicy;
  windows: readonly MaintenanceWindow[];
  schedule: MaintenanceSchedule;
}>;

export type MaintenanceManagerStatus = "idle" | "running" | "stopped";

export type MaintenanceManagerSnapshot = Readonly<{
  managerId: string;
  layerId: typeof MAINTENANCE_ID;
  status: MaintenanceManagerStatus;
  clock: number;
  windowCount: number;
  activeCount: number;
}>;

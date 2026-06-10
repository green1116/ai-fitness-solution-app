import type { COMMERCIAL_DELIVERY_VERSION } from "../shared/types";

export const DELIVERY_LEDGER_RUNTIME_VERSION = "v14.0-delivery-ledger-1" as const;

export const LEDGER_EVENT_TYPES = [
  "created",
  "approved",
  "delivered",
  "downloaded",
] as const;

export type LedgerEventType = (typeof LEDGER_EVENT_TYPES)[number];

export interface LedgerEntry {
  entryId: string;
  projectId: string;
  eventType: LedgerEventType;
  actor: string;
  message: string;
  recordedAt: string;
}

export interface DeliveryLedger {
  ledgerId: string;
  projectId: string;
  entries: LedgerEntry[];
  eventCount: number;
}

export interface DeliveryLedgerRuntimePayload {
  version: typeof DELIVERY_LEDGER_RUNTIME_VERSION;
  deliveryVersion: typeof COMMERCIAL_DELIVERY_VERSION;
  ledger: DeliveryLedger;
  summary: string;
}

/**
 * V58 — Delivery record store (in-memory overlay for download counts / portal registrations)
 */

import type { DeliveryRecord } from "./delivery.types";

declare global {
  // eslint-disable-next-line no-var
  var __v58DeliveryOverlay: Map<string, DeliveryRecord> | undefined;
  // eslint-disable-next-line no-var
  var __v58DownloadCounts: Map<string, number> | undefined;
}

function overlayStore(): Map<string, DeliveryRecord> {
  globalThis.__v58DeliveryOverlay ||= new Map();
  return globalThis.__v58DeliveryOverlay;
}

function downloadCounts(): Map<string, number> {
  globalThis.__v58DownloadCounts ||= new Map();
  return globalThis.__v58DownloadCounts;
}

export function registerDeliveryOverlay(record: DeliveryRecord): DeliveryRecord {
  overlayStore().set(record.id, record);
  return record;
}

export function incrementDownloadCount(deliveryId: string): number {
  const next = (downloadCounts().get(deliveryId) ?? 0) + 1;
  downloadCounts().set(deliveryId, next);
  return next;
}

export function getDownloadCount(deliveryId: string): number {
  return downloadCounts().get(deliveryId) ?? 0;
}

export function getDeliveryOverlays(): DeliveryRecord[] {
  return [...overlayStore().values()];
}

export function mergeDownloadCounts(records: DeliveryRecord[]): DeliveryRecord[] {
  return records.map((r) => ({
    ...r,
    downloadCount: Math.max(r.downloadCount, getDownloadCount(r.id)),
  }));
}

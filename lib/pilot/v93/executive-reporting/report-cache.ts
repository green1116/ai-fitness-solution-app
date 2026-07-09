/**
 * V93 — Report cache (minimal write for packets / exports / review state)
 */

import { randomUUID } from "node:crypto";

import type {
  BoardPacket,
  ReportActionEntry,
  ReportActionType,
} from "./reporting.types";

type ReportCacheEntry = {
  organizationId: string;
  packets: BoardPacket[];
  actions: ReportActionEntry[];
  exportsCount: number;
};

declare global {
  // eslint-disable-next-line no-var
  var __v93ReportCache: Map<string, ReportCacheEntry> | undefined;
}

function cache(): Map<string, ReportCacheEntry> {
  globalThis.__v93ReportCache ||= new Map();
  return globalThis.__v93ReportCache;
}

function getOrCreateEntry(organizationId: string): ReportCacheEntry {
  const existing = cache().get(organizationId);
  if (existing) return existing;
  const entry: ReportCacheEntry = {
    organizationId,
    packets: [],
    actions: [],
    exportsCount: 0,
  };
  cache().set(organizationId, entry);
  return entry;
}

export function listBoardPackets(organizationId: string): BoardPacket[] {
  return getOrCreateEntry(organizationId).packets.sort((a, b) =>
    b.generatedAt.localeCompare(a.generatedAt),
  );
}

export function getBoardPacket(
  organizationId: string,
  packetId: string,
): BoardPacket | null {
  return listBoardPackets(organizationId).find((p) => p.id === packetId) ?? null;
}

export function saveBoardPacket(packet: BoardPacket): BoardPacket {
  const entry = getOrCreateEntry(packet.organizationId);
  const idx = entry.packets.findIndex((p) => p.id === packet.id);
  if (idx >= 0) entry.packets[idx] = packet;
  else entry.packets.push(packet);
  cache().set(packet.organizationId, entry);
  return packet;
}

export function appendReportAction(input: {
  organizationId: string;
  actorId: string;
  action: ReportActionType;
  packetId?: string;
  note?: string;
  meta?: Record<string, unknown>;
}): ReportActionEntry {
  const entry = getOrCreateEntry(input.organizationId);
  const action: ReportActionEntry = {
    id: randomUUID(),
    organizationId: input.organizationId,
    actorId: input.actorId,
    action: input.action,
    packetId: input.packetId,
    timestamp: new Date().toISOString(),
    note: input.note,
    meta: input.meta,
  };
  entry.actions.push(action);
  if (input.action === "export_summary") {
    entry.exportsCount += 1;
  }
  cache().set(input.organizationId, entry);
  return action;
}

export function listReportActions(organizationId: string): ReportActionEntry[] {
  return getOrCreateEntry(organizationId).actions.sort((a, b) =>
    b.timestamp.localeCompare(a.timestamp),
  );
}

export function listPacketActions(
  organizationId: string,
  packetId: string,
): ReportActionEntry[] {
  return listReportActions(organizationId).filter((a) => a.packetId === packetId);
}

export function getExportsCount(organizationId: string): number {
  return getOrCreateEntry(organizationId).exportsCount;
}

export function clearReportCacheForTests(): void {
  globalThis.__v93ReportCache = new Map();
}

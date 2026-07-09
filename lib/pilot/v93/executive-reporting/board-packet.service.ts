/**
 * V93 — Board packet generation (read governance + reporting summaries)
 */

import { randomUUID } from "node:crypto";

import {
  buildDrilldownLinks,
  buildExecutiveMetrics,
  buildExecutiveSummary,
  collectRecentDecisions,
} from "./reporting.service";
import { appendReportAction, getBoardPacket, saveBoardPacket } from "./report-cache";
import type { BoardPacket, ExportSummaryResult } from "./reporting.types";

function requirePacket(organizationId: string, packetId: string): BoardPacket {
  const packet = getBoardPacket(organizationId, packetId);
  if (!packet) throw new Error("PACKET_NOT_FOUND");
  return packet;
}

export function generateBoardPacket(input: {
  organizationId: string;
  actorId: string;
  title?: string;
}): BoardPacket {
  const now = new Date().toISOString();
  const summary = buildExecutiveSummary(input.organizationId);
  const metrics = buildExecutiveMetrics(input.organizationId);

  const packet: BoardPacket = {
    id: `pkt-${randomUUID()}`,
    organizationId: input.organizationId,
    title: input.title ?? `董事会材料 ${new Date().toLocaleDateString("zh-CN")}`,
    generatedAt: now,
    status: "draft",
    summary,
    metrics,
    decisionHistory: collectRecentDecisions(input.organizationId),
    drilldownLinks: buildDrilldownLinks(input.organizationId),
    readOnly: true,
  };

  saveBoardPacket(packet);

  appendReportAction({
    organizationId: input.organizationId,
    actorId: input.actorId,
    action: "generate_packet",
    packetId: packet.id,
    note: `生成董事会材料: ${packet.title}`,
  });

  return packet;
}

export function schedulePacketReview(input: {
  organizationId: string;
  packetId: string;
  actorId: string;
  scheduledAt: string;
  note?: string;
}): BoardPacket {
  const packet = saveBoardPacket({
    ...requirePacket(input.organizationId, input.packetId),
    status: "scheduled",
    scheduledReviewAt: input.scheduledAt,
  });

  appendReportAction({
    organizationId: input.organizationId,
    actorId: input.actorId,
    action: "schedule_review",
    packetId: input.packetId,
    note: input.note ?? `评审排期: ${input.scheduledAt}`,
    meta: { scheduledAt: input.scheduledAt },
  });

  return packet;
}

export function markPacketReviewed(input: {
  organizationId: string;
  packetId: string;
  actorId: string;
  note?: string;
}): BoardPacket {
  const now = new Date().toISOString();
  const packet = saveBoardPacket({
    ...requirePacket(input.organizationId, input.packetId),
    status: "reviewed",
    reviewedAt: now,
  });

  appendReportAction({
    organizationId: input.organizationId,
    actorId: input.actorId,
    action: "mark_reviewed",
    packetId: input.packetId,
    note: input.note ?? "董事会材料已审阅",
    meta: { reviewedAt: now },
  });

  return packet;
}

export function exportExecutiveSummary(input: {
  organizationId: string;
  actorId: string;
  packetId?: string;
}): ExportSummaryResult {
  const summary = buildExecutiveSummary(input.organizationId);
  const now = new Date().toISOString();

  if (input.packetId) {
    const packet = requirePacket(input.organizationId, input.packetId);
    saveBoardPacket({
      ...packet,
      status: "exported",
      exportedAt: now,
    });
  }

  appendReportAction({
    organizationId: input.organizationId,
    actorId: input.actorId,
    action: "export_summary",
    packetId: input.packetId,
    note: "导出高管摘要",
    meta: { format: "json" },
  });

  return {
    organizationId: input.organizationId,
    exportedAt: now,
    format: "json",
    payload: summary,
    readOnly: true,
  };
}

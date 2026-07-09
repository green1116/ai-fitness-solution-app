/**
 * V93 — Executive reporting dashboard
 */

import {
  buildExecutiveMetrics,
  buildExecutiveSummary,
  collectRecentDecisions,
} from "./reporting.service";
import { getBoardPacket, listBoardPackets, listPacketActions } from "./report-cache";
import type {
  BoardPacketDetail,
  ExecutiveReportingDashboard,
} from "./reporting.types";
import { V93_EXECUTIVE_REPORTING_VERSION } from "./reporting.types";

export function buildExecutiveReportingDashboard(
  organizationId: string,
): ExecutiveReportingDashboard {
  return {
    version: V93_EXECUTIVE_REPORTING_VERSION,
    organizationId,
    generatedAt: new Date().toISOString(),
    summary: buildExecutiveSummary(organizationId),
    metrics: buildExecutiveMetrics(organizationId),
    packets: listBoardPackets(organizationId),
    recentDecisions: collectRecentDecisions(organizationId),
    readOnly: true,
  };
}

export function buildBoardPacketDetail(
  organizationId: string,
  packetId: string,
): BoardPacketDetail {
  const packet = getBoardPacket(organizationId, packetId);
  if (!packet) throw new Error("PACKET_NOT_FOUND");

  return {
    packet,
    actionHistory: listPacketActions(organizationId, packetId),
    readOnly: true,
  };
}

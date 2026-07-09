/**
 * V94 — Executive briefing dashboard
 */

import {
  buildExecutiveMetrics,
  buildExecutiveSummary,
} from "@/lib/pilot/v93";

import {
  getBriefingPack,
  listBriefingActions,
  listBriefingPacks,
  listPackActions,
} from "./briefing-cache";
import { buildBriefingContent } from "./briefing.service";
import { buildDecisionSupportList } from "./decision-support.service";
import type { BriefingPackDetail, ExecutiveBriefingDashboard } from "./briefing.types";
import { V94_EXECUTIVE_BRIEFING_VERSION } from "./briefing.types";

export function buildExecutiveBriefingDashboard(
  organizationId: string,
): ExecutiveBriefingDashboard {
  return {
    version: V94_EXECUTIVE_BRIEFING_VERSION,
    organizationId,
    generatedAt: new Date().toISOString(),
    summary: buildExecutiveSummary(organizationId),
    briefing: buildBriefingContent(organizationId),
    decisionSupport: buildDecisionSupportList(organizationId),
    keyMetrics: buildExecutiveMetrics(organizationId),
    packs: listBriefingPacks(organizationId),
    recentActions: listBriefingActions(organizationId).slice(0, 20),
    readOnly: true,
  };
}

export function buildBriefingPackDetail(
  organizationId: string,
  packId: string,
): BriefingPackDetail {
  const pack = getBriefingPack(organizationId, packId);
  if (!pack) throw new Error("BRIEFING_NOT_FOUND");

  return {
    pack,
    actionHistory: listPackActions(organizationId, packId),
    readOnly: true,
  };
}

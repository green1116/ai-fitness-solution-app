/**
 * V94 — Briefing pack generation & actions (minimal write to briefing cache)
 */

import { randomUUID } from "node:crypto";

import {
  buildDrilldownLinks,
  buildExecutiveMetrics,
  buildExecutiveSummary,
  collectRecentDecisions,
} from "@/lib/pilot/v93";

import { appendBriefingAction, getBriefingPack, saveBriefingPack } from "./briefing-cache";
import { buildBriefingContent } from "./briefing.service";
import { buildDecisionSupportList } from "./decision-support.service";
import type { BriefingPack } from "./briefing.types";

export function generateBriefingPack(input: {
  organizationId: string;
  actorId: string;
  title?: string;
}): BriefingPack {
  const now = new Date().toISOString();
  const pack: BriefingPack = {
    id: `brf-${randomUUID()}`,
    organizationId: input.organizationId,
    title: input.title ?? `高管简报 ${new Date().toLocaleDateString("zh-CN")}`,
    generatedAt: now,
    status: "draft",
    summary: buildExecutiveSummary(input.organizationId),
    briefing: buildBriefingContent(input.organizationId),
    decisionSupport: buildDecisionSupportList(input.organizationId),
    keyMetrics: buildExecutiveMetrics(input.organizationId),
    drilldownLinks: buildDrilldownLinks(input.organizationId),
    decisionLog: collectRecentDecisions(input.organizationId),
    readOnly: true,
  };

  saveBriefingPack(pack);

  appendBriefingAction({
    organizationId: input.organizationId,
    actorId: input.actorId,
    action: "generate_briefing_pack",
    briefingId: pack.id,
    note: `生成简报: ${pack.title}`,
  });

  return pack;
}

export function recordBriefingAction(input: {
  organizationId: string;
  actorId: string;
  briefingId: string;
  sessionId: string;
  note?: string;
}): BriefingPack {
  const pack = requirePack(input.organizationId, input.briefingId);

  appendBriefingAction({
    organizationId: input.organizationId,
    actorId: input.actorId,
    action: "record_briefing_action",
    briefingId: input.briefingId,
    sessionId: input.sessionId,
    note: input.note ?? "记录简报行动",
  });

  return saveBriefingPack({ ...pack, status: "issued" });
}

export function markDecisionActed(input: {
  organizationId: string;
  actorId: string;
  briefingId: string;
  sessionId: string;
  note?: string;
}): BriefingPack {
  const pack = requirePack(input.organizationId, input.briefingId);

  appendBriefingAction({
    organizationId: input.organizationId,
    actorId: input.actorId,
    action: "mark_decision_acted",
    briefingId: input.briefingId,
    sessionId: input.sessionId,
    note: input.note ?? "决策已执行",
  });

  return saveBriefingPack({ ...pack, status: "acted" });
}

function requirePack(organizationId: string, packId: string): BriefingPack {
  const pack = getBriefingPack(organizationId, packId);
  if (!pack) throw new Error("BRIEFING_NOT_FOUND");
  return pack;
}

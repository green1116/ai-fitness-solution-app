/**
 * V80 Pilot P14 — Recommendation packs + effectiveness (in-memory, knowledge layer)
 */

import type {
  KnowledgeRecommendationPack,
  OrgRecommendationEffectiveness,
  RecommendationFeedbackEvent,
} from "./knowledge-recommendation.schema";

declare global {
  // eslint-disable-next-line no-var
  var __v80PilotRecPacks: Map<string, KnowledgeRecommendationPack> | undefined;
  // eslint-disable-next-line no-var
  var __v80PilotRecEffectiveness:
    | Map<string, OrgRecommendationEffectiveness>
    | undefined;
  // eslint-disable-next-line no-var
  var __v80PilotRecEvents: RecommendationFeedbackEvent[] | undefined;
}

function packs(): Map<string, KnowledgeRecommendationPack> {
  globalThis.__v80PilotRecPacks ||= new Map();
  return globalThis.__v80PilotRecPacks;
}

function effectiveness(): Map<string, OrgRecommendationEffectiveness> {
  globalThis.__v80PilotRecEffectiveness ||= new Map();
  return globalThis.__v80PilotRecEffectiveness;
}

function events(): RecommendationFeedbackEvent[] {
  globalThis.__v80PilotRecEvents ||= [];
  return globalThis.__v80PilotRecEvents;
}

export function getRecommendationPack(
  sessionId: string,
): KnowledgeRecommendationPack | null {
  return packs().get(sessionId) ?? null;
}

export function saveRecommendationPack(
  pack: KnowledgeRecommendationPack,
): KnowledgeRecommendationPack {
  packs().set(pack.sessionId, pack);
  return pack;
}

export function getOrgRecommendationEffectiveness(
  organizationId: string,
): OrgRecommendationEffectiveness | null {
  return effectiveness().get(organizationId) ?? null;
}

export function saveOrgRecommendationEffectiveness(
  state: OrgRecommendationEffectiveness,
): OrgRecommendationEffectiveness {
  effectiveness().set(state.organizationId, state);
  return state;
}

export function appendRecommendationFeedbackEvent(
  event: RecommendationFeedbackEvent,
): void {
  events().unshift(event);
  if (events().length > 2000) events().length = 2000;
}

export function listRecommendationFeedbackEvents(
  organizationId: string,
  limit = 50,
): RecommendationFeedbackEvent[] {
  return events()
    .filter((e) => e.organizationId === organizationId)
    .slice(0, limit);
}

export function clearKnowledgeRecommendationStoreForTests(): void {
  globalThis.__v80PilotRecPacks = new Map();
  globalThis.__v80PilotRecEffectiveness = new Map();
  globalThis.__v80PilotRecEvents = [];
}

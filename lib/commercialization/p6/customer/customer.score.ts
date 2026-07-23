/**
 * Commercialization P6 — Customer score
 */

import { HEALTH_BANDS } from "../kpi/kpi.constants";
import { listCustomerHealthProfiles } from "./customer.health";
import { listCustomerValueProfiles } from "./customer.value";
import type {
  CustomerScoreCard,
  HealthBand,
  ScoreCustomerInput,
} from "./customer.types";

const scores = new Map<string, CustomerScoreCard>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneScore(score: CustomerScoreCard): CustomerScoreCard {
  return { ...score };
}

function bandForScore(score: number): HealthBand {
  if (score >= 85) return "EXCELLENT";
  if (score >= 70) return "GOOD";
  if (score >= 55) return "FAIR";
  if (score >= 40) return "POOR";
  return "CRITICAL";
}

export function scoreCustomer(
  input: ScoreCustomerInput,
): CustomerScoreCard {
  const accountRef = input.accountRef.trim();
  if (!accountRef) throw new Error("customerScore.accountRef is required");

  const value = listCustomerValueProfiles({ accountRef })[0];
  const health = listCustomerHealthProfiles({ accountRef })[0];
  if (!value) {
    throw new Error(`customer value not found for account: ${accountRef}`);
  }
  if (!health) {
    throw new Error(`customer health not found for account: ${accountRef}`);
  }

  const valueScore = Math.min(
    100,
    Math.round(value.lifetimeValue / 100) +
      Math.round(value.expansionPotential / 50),
  );
  const healthScore = Math.max(
    0,
    Math.min(
      100,
      health.engagementScore - Math.round(health.supportLoad / 5),
    ),
  );
  const compositeScore = Math.round(valueScore * 0.45 + healthScore * 0.55);
  const band = bandForScore(compositeScore);
  if (!(HEALTH_BANDS as readonly string[]).includes(band)) {
    throw new Error(`invalid health band: ${band}`);
  }

  const id = input.id?.trim() || createId("cscore");
  if (scores.has(id)) {
    throw new Error(`customer score card already exists: ${id}`);
  }

  const card: CustomerScoreCard = {
    id,
    accountRef,
    valueScore,
    healthScore,
    compositeScore,
    band,
    detail: `composite=${compositeScore} band=${band}`,
    scoredAt: nowIso(),
  };
  scores.set(id, card);
  return cloneScore(card);
}

export function getCustomerScoreCard(
  id: string,
): CustomerScoreCard | undefined {
  const score = scores.get(id.trim());
  return score ? cloneScore(score) : undefined;
}

export function listCustomerScoreCards(filter?: {
  accountRef?: string;
}): CustomerScoreCard[] {
  let result = [...scores.values()];
  if (filter?.accountRef) {
    const aref = filter.accountRef.trim();
    result = result.filter((s) => s.accountRef === aref);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneScore);
}

export function clearCustomerScoreCards(): void {
  scores.clear();
}

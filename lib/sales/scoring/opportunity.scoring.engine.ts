/**
 * V60 P3 — Opportunity scoring engine
 */

export type OpportunityScoreInput = {
  engagementLevel?: number;
  companySize?: number;
  quoteInteractions?: number;
  budgetInteractions?: number;
  tenderInteractions?: number;
};

export type OpportunityScoreResult = {
  score: number;
  grade: "C" | "B" | "A" | "A+";
  signals: string[];
};

export function scoreOpportunity(input: OpportunityScoreInput): OpportunityScoreResult {
  const signals: string[] = [];
  let score = 15;

  const engagement = input.engagementLevel ?? 0;
  if (engagement >= 3) {
    score += 20;
    signals.push("high_engagement");
  } else if (engagement >= 1) {
    score += 10;
    signals.push("moderate_engagement");
  }

  if (input.companySize && input.companySize >= 200) {
    score += 15;
    signals.push("enterprise_size");
  } else if (input.companySize && input.companySize >= 50) {
    score += 8;
    signals.push("mid_market_size");
  }

  if ((input.quoteInteractions ?? 0) >= 2) {
    score += 15;
    signals.push("quote_interactions");
  } else if ((input.quoteInteractions ?? 0) >= 1) {
    score += 8;
    signals.push("quote_started");
  }

  if ((input.budgetInteractions ?? 0) >= 3) {
    score += 20;
    signals.push("budget_engagement");
  } else if ((input.budgetInteractions ?? 0) >= 1) {
    score += 10;
    signals.push("budget_explored");
  }

  if ((input.tenderInteractions ?? 0) >= 1) {
    score += 25;
    signals.push("tender_interactions");
  }

  score = Math.min(100, score);
  const grade: OpportunityScoreResult["grade"] =
    score >= 85 ? "A+" : score >= 70 ? "A" : score >= 50 ? "B" : "C";

  return { score, grade, signals };
}

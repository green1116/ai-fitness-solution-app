/**
 * V60 P3 — Sales automation shared types
 */

export type NextBestAction =
  | "Send Quote Proposal"
  | "Suggest Budget Optimization"
  | "Trigger Tender Generation"
  | "Schedule Follow-up"
  | "Upgrade Plan Recommendation";

export type SalesRecommendation = {
  action: NextBestAction | string;
  product: "quote" | "budget" | "tender" | "upgrade" | "follow_up";
  priority: "low" | "medium" | "high";
  reason: string;
  cta: string;
};

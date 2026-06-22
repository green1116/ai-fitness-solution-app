/**
 * V61 P2 — Funnel widget builder
 */

import type { FunnelSnapshot } from "@/lib/growth/funnel/funnel.analytics";

export type FunnelWidget = {
  stages: { name: string; count: number; rate?: number }[];
};

export function buildFunnelWidget(funnel: FunnelSnapshot): FunnelWidget {
  const stages = [
    { name: "Acquisition", count: funnel.acquisition },
    { name: "Activation", count: funnel.activation },
    { name: "Conversion", count: funnel.conversion },
    { name: "Retention", count: funnel.retention },
  ];

  let prev = stages[0]?.count ?? 1;
  return {
    stages: stages.map((s, i) => {
      const rate = i === 0 ? 100 : prev > 0 ? Math.round((s.count / prev) * 100) : 0;
      if (i > 0) prev = s.count || prev;
      return { ...s, rate };
    }),
  };
}

export function buildSalesFunnelWidget(pipeline: {
  quotes: number;
  budgets: number;
  tenders: number;
  hotDeals: number;
}): FunnelWidget {
  return {
    stages: [
      { name: "Quotes", count: pipeline.quotes },
      { name: "Budgets", count: pipeline.budgets },
      { name: "Tenders", count: pipeline.tenders },
      { name: "Hot Deals", count: pipeline.hotDeals },
    ],
  };
}

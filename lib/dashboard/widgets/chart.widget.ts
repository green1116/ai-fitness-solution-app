/**
 * V61 P2 — Chart widget data builder
 */

export type ChartSeries = {
  label: string;
  data: number[];
  labels: string[];
};

export function buildRevenueChartSeries(breakdown: { plan: string; mrr: number }[]): ChartSeries {
  return {
    label: "MRR by Plan",
    labels: breakdown.map((b) => b.plan),
    data: breakdown.map((b) => b.mrr),
  };
}

export function buildTrendChartSeries(trends: Record<string, number>): ChartSeries {
  const entries = Object.entries(trends);
  return {
    label: "Trend",
    labels: entries.map(([k]) => k),
    data: entries.map(([, v]) => v),
  };
}

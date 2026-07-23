/**
 * Commercialization P6 — KPI types
 */

import type { KPI_CATEGORIES } from "./kpi.constants";

export type KpiCategory = (typeof KPI_CATEGORIES)[number];

export type RevenueKpi = {
  id: string;
  name: string;
  category: KpiCategory;
  target: number;
  actual: number;
  unit: string;
  attainment: number;
  detail: string;
  createdAt: string;
  updatedAt: string;
};

export type RegisterKpiInput = {
  id?: string;
  name: string;
  category: KpiCategory;
  target: number;
  actual: number;
  unit?: string;
};

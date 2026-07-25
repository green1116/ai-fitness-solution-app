/**
 * Product KPI — Definition types
 */

import type {
  KPI_CATEGORIES,
  KPI_STATUSES,
} from "../management/management.constants";

export type KpiCategory = (typeof KPI_CATEGORIES)[number];
export type KpiStatus = (typeof KPI_STATUSES)[number];
export type DefinitionMetadata = Record<string, unknown>;

export type KpiDefinition = {
  id: string;
  code: string;
  name: string;
  category: KpiCategory;
  metricId: string;
  status: KpiStatus;
  detail: string;
  metadata: DefinitionMetadata;
  createdAt: string;
  updatedAt: string;
};

export type DefineKpiInput = {
  id?: string;
  code: string;
  name: string;
  category: KpiCategory;
  metricId: string;
  metadata?: DefinitionMetadata;
};

export type UpdateKpiStatusInput = {
  kpiId: string;
  status: KpiStatus;
};

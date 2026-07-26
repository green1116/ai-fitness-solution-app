/**
 * Product Delivery — Pipeline types
 */

import type { DELIVERY_PIPELINE_STAGES } from "../management/management.constants";

export type DeliveryPipelineStage =
  (typeof DELIVERY_PIPELINE_STAGES)[number];
export type PipelineMetadata = Record<string, unknown>;

export type DeliveryPipeline = {
  id: string;
  requestId: string;
  stages: DeliveryPipelineStage[];
  detail: string;
  metadata: PipelineMetadata;
  createdAt: string;
};

export type DefineDeliveryPipelineInput = {
  id?: string;
  requestId: string;
  stages: DeliveryPipelineStage[];
  metadata?: PipelineMetadata;
};

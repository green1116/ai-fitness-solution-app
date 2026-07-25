/**
 * Product Customer Insight — Signal types
 */

import type { INSIGHT_SIGNAL_KINDS } from "../insight/insight.constants";

export type InsightSignalKind = (typeof INSIGHT_SIGNAL_KINDS)[number];
export type SignalMetadata = Record<string, unknown>;

export type CustomerInsightSignal = {
  id: string;
  customerId: string;
  kind: InsightSignalKind;
  strength: number;
  detail: string;
  metadata: SignalMetadata;
  detectedAt: string;
};

export type DetectSignalInput = {
  id?: string;
  customerId: string;
  kind: InsightSignalKind;
  strength: number;
  metadata?: SignalMetadata;
};

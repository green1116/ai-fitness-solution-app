/**
 * Operations O4 — Expansion types
 */

import type { EXPANSION_SIGNAL_KINDS } from "../growth/growth.constants";

export type ExpansionSignalKind =
  (typeof EXPANSION_SIGNAL_KINDS)[number];
export type ExpansionMetadata = Record<string, unknown>;

export type ExpansionSignal = {
  id: string;
  accountRef: string;
  kind: ExpansionSignalKind;
  strength: number;
  note: string;
  detail: string;
  metadata: ExpansionMetadata;
  detectedAt: string;
};

export type DetectExpansionSignalInput = {
  id?: string;
  accountRef: string;
  kind: ExpansionSignalKind;
  strength: number;
  note?: string;
  metadata?: ExpansionMetadata;
};

export type ExpansionOpportunity = {
  id: string;
  accountRef: string;
  signalId: string;
  estimatedValue: number;
  priority: "LOW" | "MEDIUM" | "HIGH";
  detail: string;
  createdAt: string;
};

export type CreateExpansionOpportunityInput = {
  id?: string;
  accountRef: string;
  signalId: string;
  estimatedValue: number;
};

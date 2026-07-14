/**
 * E05-P1 — Insight types
 */

import type { InsightKind } from "../core/intelligence.types";

export type InsightDefinition = {
  id: string;
  kind: InsightKind;
  name: string;
  description: string;
  inputHints: string[];
  outputHints: string[];
  readOnly: true;
};

export type InsightRegistryManifest = {
  insightCount: number;
  kinds: InsightKind[];
  insights: InsightDefinition[];
  catalogComplete: boolean;
  readOnly: true;
};

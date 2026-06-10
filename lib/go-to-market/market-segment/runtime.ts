import { finalizeRuntime, runStage } from "../shared/runtime";
import type { GtmRuntimeResult, GtmStageResult } from "../shared/types";
import { GO_TO_MARKET_VERSION } from "../shared/types";
import { buildMarketSegments } from "./builders";
import type { MarketSegmentRuntimePayload } from "./types";
import { MARKET_SEGMENT_RUNTIME_VERSION } from "./types";
import { SEGMENT_TYPES } from "./types";

export function validateMarketSegmentRuntime(input?: { deploymentId?: string }): { valid: boolean } {
  const segments = buildMarketSegments(input);
  return {
    valid:
      segments.length === SEGMENT_TYPES.length &&
      segments.some((s) => s.priority === "high"),
  };
}

export function runMarketSegmentRuntime(input?: {
  deploymentId?: string;
}): GtmRuntimeResult<MarketSegmentRuntimePayload> {
  const deploymentId = input?.deploymentId ?? "segment-default";
  const stages: GtmStageResult[] = [];

  const segments = runStage("segment-build", "Market Segments", () => buildMarketSegments({ deploymentId }), stages);
  const validation = runStage("segment-validate", "Segment Validation", () => validateMarketSegmentRuntime({ deploymentId }), stages);
  if (!validation.valid) throw new Error("Market segment validation failed");

  const payload: MarketSegmentRuntimePayload = {
    version: MARKET_SEGMENT_RUNTIME_VERSION,
    gtmVersion: GO_TO_MARKET_VERSION,
    segments,
    highPriorityCount: segments.filter((s) => s.priority === "high").length,
    summary: `market-segment count=${segments.length} highPriority=${segments.filter((s) => s.priority === "high").length}`,
  };

  return finalizeRuntime({ domain: "market-segment", deploymentId, stages, payload, summary: payload.summary });
}

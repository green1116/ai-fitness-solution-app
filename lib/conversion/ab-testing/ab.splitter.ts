/**
 * V64 P2 — A/B variant splitter (deterministic assignment)
 */

import type { ConversionExperimentType } from "../conversion.types";
import { recordAbEvent } from "./ab.tracker";

export function hashVisitorKey(key: string): number {
  let h = 0;
  for (let i = 0; i < key.length; i++) {
    h = (h * 31 + key.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

export function assignVariant<T extends { id: string }>(
  visitorKey: string,
  variants: T[],
): T {
  if (variants.length === 0) throw new Error("variants required");
  const idx = hashVisitorKey(visitorKey) % variants.length;
  return variants[idx]!;
}

export function splitAndTrack<T extends { id: string }>(input: {
  visitorKey: string;
  experimentId: string;
  experimentType: ConversionExperimentType;
  variants: T[];
}): T {
  const chosen = assignVariant(input.visitorKey, input.variants);
  recordAbEvent({
    experimentId: input.experimentId,
    variantId: chosen.id,
    experimentType: input.experimentType,
    eventType: "impression",
  });
  return chosen;
}

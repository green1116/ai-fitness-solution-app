/**
 * V64 P2 — A/B testing engine
 */

import type { ConversionExperimentType, ConversionVariant } from "../conversion.types";
import { aggregateConversionMetrics } from "../core/conversion.context";
import { computeConversionThresholds } from "../conversion.types";
import { aggregateAbStats, recordAbEvent } from "./ab.tracker";
import { generateCTAVariants } from "../cta/cta.variants";
import { generateLandingVariants } from "../landing/landing.variant.engine";
import { generateDemoVariants } from "../demo/demo.flow.optimizer";
import { generatePricingVariants } from "../landing/landing.performance";

const EXPERIMENT_IDS: Record<ConversionExperimentType, string> = {
  landing: "cro-landing-hero",
  cta: "cro-cta-primary",
  demo: "cro-demo-flow",
  pricing: "cro-pricing-layout",
};

function variantPayloadToName(type: ConversionExperimentType, id: string, payload: Record<string, string>): string {
  const key = payload.headline ?? payload.cta ?? payload.flow ?? payload.layout ?? id;
  return `${type}:${key}`;
}

function buildVariantsFromType(type: ConversionExperimentType): ConversionVariant[] {
  let raw: { id: string; payload: Record<string, string> }[] = [];

  if (type === "cta") {
    raw = generateCTAVariants().map((v) => ({ id: v.id, payload: { cta: v.label, href: v.href } }));
  } else if (type === "landing") {
    raw = generateLandingVariants().map((v) => ({
      id: v.id,
      payload: { headline: v.headline, subhead: v.subhead },
    }));
  } else if (type === "demo") {
    raw = generateDemoVariants().map((v) => ({
      id: v.id,
      payload: { flow: v.flowStyle, fields: String(v.fieldCount) },
    }));
  } else {
    raw = generatePricingVariants().map((v) => ({
      id: v.id,
      payload: { layout: v.layout, highlight: v.highlightPlan },
    }));
  }

  const experimentId = EXPERIMENT_IDS[type];
  const stats = aggregateAbStats(experimentId);
  const metrics = aggregateConversionMetrics();
  const thresholds = computeConversionThresholds(metrics);

  return raw.map((v) => {
    const s = stats.get(v.id) ?? { impressions: 0, clicks: 0, conversions: 0 };
    const impressions = Math.max(s.impressions, Math.floor(metrics.landingView / raw.length));
    const conversions = s.conversions || Math.floor(s.clicks * (metrics.signupRate / 100));
    const conversionRate = impressions > 0 ? Math.round((conversions / impressions) * 100) : 0;
    return {
      id: v.id,
      experimentType: type,
      name: variantPayloadToName(type, v.id, v.payload),
      payload: v.payload,
      impressions,
      clicks: s.clicks,
      conversions,
      conversionRate,
      winner: false,
    };
  }).map((v, _, arr) => {
    const ready = arr.every((x) => x.impressions >= thresholds.abTestMinSample / 10);
    if (!ready) return v;
    const best = [...arr].sort((a, b) => b.conversionRate - a.conversionRate)[0];
    return { ...v, winner: v.id === best?.id };
  });
}

export function generateABVariants(types: ConversionExperimentType[] = ["landing", "cta", "demo", "pricing"]): ConversionVariant[] {
  return types.flatMap((t) => buildVariantsFromType(t));
}

export function testConversionRates(experimentType: ConversionExperimentType = "cta"): ConversionVariant[] {
  return buildVariantsFromType(experimentType);
}

export function runAbExperiment(input: {
  experimentType: ConversionExperimentType;
  variantId: string;
  eventType: "click" | "conversion";
}) {
  recordAbEvent({
    experimentId: EXPERIMENT_IDS[input.experimentType],
    variantId: input.variantId,
    experimentType: input.experimentType,
    eventType: input.eventType,
  });
}

export function selectBestPerformingVariant(
  experimentType: ConversionExperimentType = "cta",
): ConversionVariant | null {
  const variants = buildVariantsFromType(experimentType);
  const sorted = [...variants].sort((a, b) => b.conversionRate - a.conversionRate);
  return sorted[0] ?? null;
}

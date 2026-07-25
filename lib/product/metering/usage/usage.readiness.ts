/**
 * Product Metering — readiness
 */

import { PRODUCT_INVOICE_ENGINE_ID } from "../../invoice/engine/engine.constants";
import { listAggregates } from "../aggregate/aggregate.registry";
import { listUsageEvents } from "../event/event.registry";
import { listMeters } from "../meter/meter.registry";
import { listRatings } from "../rating/rating.registry";
import { PRODUCT_USAGE_METERING_BASE } from "./usage.constants";
import type {
  MeteringReadinessCheck,
  MeteringReadinessResult,
} from "./usage.types";

function nowIso(): string {
  return new Date().toISOString();
}

function check(
  id: string,
  component: string,
  label: string,
  ok: boolean,
  detail: string,
): MeteringReadinessCheck {
  return { id, component, label, ok, detail };
}

export function evaluateUsageMeteringReadiness(): MeteringReadinessResult {
  const checks: MeteringReadinessCheck[] = [];

  checks.push(
    check(
      "MET-BASE",
      "foundation",
      "Invoice engine baseline aligned",
      PRODUCT_USAGE_METERING_BASE === PRODUCT_INVOICE_ENGINE_ID,
      `base=${PRODUCT_USAGE_METERING_BASE}`,
    ),
  );

  const meters = listMeters();
  checks.push(
    check(
      "MET-MTR",
      "meter",
      "Active meters present",
      meters.some((m) => m.status === "ACTIVE"),
      `meters=${meters.length}`,
    ),
  );

  const events = listUsageEvents();
  checks.push(
    check(
      "MET-EVT",
      "event",
      "Usage events present",
      events.length >= 1,
      `events=${events.length}`,
    ),
  );

  const aggregates = listAggregates();
  checks.push(
    check(
      "MET-AGG",
      "aggregate",
      "Usage aggregates present",
      aggregates.some((a) => a.totalQuantity > 0),
      `aggregates=${aggregates.length}`,
    ),
  );

  const ratings = listRatings();
  checks.push(
    check(
      "MET-RAT",
      "rating",
      "Rated usage present",
      ratings.some((r) => r.result === "RATED" && r.amountCents > 0),
      `ratings=${ratings.length}`,
    ),
  );

  const passCount = checks.filter((c) => c.ok).length;
  const failCount = checks.filter((c) => !c.ok).length;
  const verdict =
    failCount === 0 ? "READY" : passCount === 0 ? "NOT_READY" : "BLOCKED";

  return {
    verdict,
    passCount,
    failCount,
    checks,
    summary: `product-metering readiness ${verdict.toLowerCase()}: pass=${passCount} fail=${failCount}`,
    evaluatedAt: nowIso(),
  };
}

export function assertUsageMeteringReadinessReady(
  result: MeteringReadinessResult,
): asserts result is MeteringReadinessResult & { verdict: "READY" } {
  if (result.verdict !== "READY") {
    throw new Error(
      `product usage metering not ready: ${result.summary}`,
    );
  }
}

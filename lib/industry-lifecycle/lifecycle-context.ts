import type { RegistryValidation } from "./shared/types";
import { buildIndustryLifecycles } from "./lifecycle-registry";
import type {
  IndustryLifecycleStatus,
  IndustryLifecycleType,
  LifecycleContext,
} from "./shared/types";
import {
  CANONICAL_LIFECYCLE_SUBJECT_ID,
  INDUSTRY_LIFECYCLE_TAG,
  INDUSTRY_LIFECYCLE_VERSION,
} from "./shared/types";

function buildTypeBreakdown(
  lifecycles: ReturnType<typeof buildIndustryLifecycles>,
): Record<IndustryLifecycleType, number> {
  const breakdown: Record<IndustryLifecycleType, number> = {
    supplier: 0,
    brand: 0,
    tender: 0,
    partnership: 0,
  };

  for (const lifecycle of lifecycles) {
    breakdown[lifecycle.lifecycleType] += 1;
  }

  return breakdown;
}

function buildStatusBreakdown(
  lifecycles: ReturnType<typeof buildIndustryLifecycles>,
): Record<IndustryLifecycleStatus, number> {
  const breakdown: Record<IndustryLifecycleStatus, number> = {
    discovered: 0,
    qualified: 0,
    designed: 0,
    bidding: 0,
    awarded: 0,
    delivering: 0,
    retained: 0,
    closed: 0,
  };

  for (const lifecycle of lifecycles) {
    breakdown[lifecycle.lifecycleStatus] += 1;
  }

  return breakdown;
}

export function buildLifecycleContext(): LifecycleContext {
  const lifecycles = buildIndustryLifecycles();

  return {
    contextId: `lifecycle-context-${INDUSTRY_LIFECYCLE_VERSION}`,
    lifecycles,
    lifecycleCount: lifecycles.length,
    typeBreakdown: buildTypeBreakdown(lifecycles),
    statusBreakdown: buildStatusBreakdown(lifecycles),
    lifecycleReady: lifecycles.length > 0,
    mode: "industry-lifecycle",
  };
}

export function validateLifecycleContextState(context: LifecycleContext): boolean {
  const canonical = context.lifecycles.filter(
    (lifecycle) => lifecycle.subjectId === CANONICAL_LIFECYCLE_SUBJECT_ID,
  );

  return (
    context.lifecycleReady &&
    context.lifecycleCount >= 8 &&
    context.lifecycles.length === context.lifecycleCount &&
    Object.values(context.typeBreakdown).every((count) => count > 0) &&
    Object.values(context.statusBreakdown).every((count) => count > 0) &&
    canonical.length >= 1 &&
    context.mode === "industry-lifecycle"
  );
}

export function validateLifecycleContextRegistry(): RegistryValidation {
  const context = buildLifecycleContext();
  const valid =
    validateLifecycleContextState(context) &&
    INDUSTRY_LIFECYCLE_VERSION === "v34-industry-lifecycle-1" &&
    INDUSTRY_LIFECYCLE_TAG === "v34-industry-lifecycle-foundation";

  return {
    valid,
    count: context.lifecycleCount,
    summary: `lifecycle-context count=${context.lifecycleCount} types=4/4 statuses=8/8 valid=${valid}`,
  };
}

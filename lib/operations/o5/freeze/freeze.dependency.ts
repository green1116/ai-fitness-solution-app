/**
 * Operations O5 — Dependency chain validation (read-only)
 */

import {
  OPERATIONS_O1_CUSTOMER_SUCCESS_FOUNDATION_FREEZE_VERSION,
  OPERATIONS_O2_USAGE_INTELLIGENCE_FOUNDATION_FREEZE_VERSION,
  OPERATIONS_O3_SUPPORT_OPERATIONS_FREEZE_VERSION,
  OPERATIONS_O4_GROWTH_ANALYTICS_FOUNDATION_FREEZE_VERSION,
  OPERATIONS_O5_FREEZE_BASE,
  OPERATIONS_O5_FREEZE_LOCK,
} from "./freeze.lock";

export const OPERATIONS_O5_EXPECTED_BASE_CHAIN = {
  o1: "enterprise-launch-v1-release",
  o2: "enterprise-operations-o1-customer-success-foundation-v1",
  o3: "enterprise-operations-o2-usage-intelligence-foundation-v1",
  o4: "enterprise-operations-o3-support-operations-v1",
  freeze: "enterprise-operations-o4-growth-analytics-foundation-v1",
} as const;

export function validateOperationsO5DependencyChain(): {
  ok: boolean;
  failures: string[];
} {
  const expected = OPERATIONS_O5_EXPECTED_BASE_CHAIN;
  const phases = OPERATIONS_O5_FREEZE_LOCK.phases;
  const failures: string[] = [];

  if (phases.o1.base !== expected.o1) {
    failures.push(`o1 base expected=${expected.o1}`);
  }
  if (phases.o2.base !== expected.o2) {
    failures.push(`o2 base expected=${expected.o2}`);
  }
  if (phases.o3.base !== expected.o3) {
    failures.push(`o3 base expected=${expected.o3}`);
  }
  if (phases.o4.base !== expected.o4) {
    failures.push(`o4 base expected=${expected.o4}`);
  }
  if (OPERATIONS_O5_FREEZE_BASE !== expected.freeze) {
    failures.push(`freeze base expected=${expected.freeze}`);
  }

  if (phases.o2.base !== phases.o1.id) {
    failures.push("o2 base must equal o1 id");
  }
  if (phases.o3.base !== phases.o2.id) {
    failures.push("o3 base must equal o2 id");
  }
  if (phases.o4.base !== phases.o3.id) {
    failures.push("o4 base must equal o3 id");
  }
  if (OPERATIONS_O5_FREEZE_BASE !== phases.o4.id) {
    failures.push("freeze base must equal o4 id");
  }

  if (
    OPERATIONS_O1_CUSTOMER_SUCCESS_FOUNDATION_FREEZE_VERSION !==
    "operations-o1-customer-success-foundation-freeze-1"
  ) {
    failures.push("o1 customer success freeze mismatch");
  }
  if (
    OPERATIONS_O2_USAGE_INTELLIGENCE_FOUNDATION_FREEZE_VERSION !==
    "operations-o2-usage-intelligence-foundation-freeze-1"
  ) {
    failures.push("o2 usage intelligence freeze mismatch");
  }
  if (
    OPERATIONS_O3_SUPPORT_OPERATIONS_FREEZE_VERSION !==
    "operations-o3-support-operations-freeze-1"
  ) {
    failures.push("o3 support operations freeze mismatch");
  }
  if (
    OPERATIONS_O4_GROWTH_ANALYTICS_FOUNDATION_FREEZE_VERSION !==
    "operations-o4-growth-analytics-foundation-freeze-1"
  ) {
    failures.push("o4 growth analytics freeze mismatch");
  }

  return { ok: failures.length === 0, failures };
}

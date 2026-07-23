/**
 * Launch L5 — Dependency chain validation (read-only)
 */

import {
  LAUNCH_L1_DEMO_FOUNDATION_FREEZE_VERSION,
  LAUNCH_L2_PILOT_CUSTOMER_FLOW_FREEZE_VERSION,
  LAUNCH_L3_PRODUCTION_HARDENING_FREEZE_VERSION,
  LAUNCH_L4_ENTERPRISE_DELIVERY_VALIDATION_FREEZE_VERSION,
  LAUNCH_L5_FREEZE_BASE,
  LAUNCH_L5_FREEZE_LOCK,
} from "./freeze.lock";

export const LAUNCH_L5_EXPECTED_BASE_CHAIN = {
  l1: "enterprise-commercialization-v1-release",
  l2: "enterprise-launch-l1-demo-foundation-v1",
  l3: "enterprise-launch-l2-pilot-customer-flow-v1",
  l4: "enterprise-launch-l3-production-hardening-v1",
  freeze: "enterprise-launch-l4-enterprise-delivery-validation-v1",
} as const;

export function validateLaunchL5DependencyChain(): {
  ok: boolean;
  failures: string[];
} {
  const expected = LAUNCH_L5_EXPECTED_BASE_CHAIN;
  const phases = LAUNCH_L5_FREEZE_LOCK.phases;
  const failures: string[] = [];

  if (phases.l1.base !== expected.l1) {
    failures.push(`l1 base expected=${expected.l1}`);
  }
  if (phases.l2.base !== expected.l2) {
    failures.push(`l2 base expected=${expected.l2}`);
  }
  if (phases.l3.base !== expected.l3) {
    failures.push(`l3 base expected=${expected.l3}`);
  }
  if (phases.l4.base !== expected.l4) {
    failures.push(`l4 base expected=${expected.l4}`);
  }
  if (LAUNCH_L5_FREEZE_BASE !== expected.freeze) {
    failures.push(`freeze base expected=${expected.freeze}`);
  }

  if (phases.l2.base !== phases.l1.id) {
    failures.push("l2 base must equal l1 id");
  }
  if (phases.l3.base !== phases.l2.id) {
    failures.push("l3 base must equal l2 id");
  }
  if (phases.l4.base !== phases.l3.id) {
    failures.push("l4 base must equal l3 id");
  }
  if (LAUNCH_L5_FREEZE_BASE !== phases.l4.id) {
    failures.push("freeze base must equal l4 id");
  }

  if (
    LAUNCH_L1_DEMO_FOUNDATION_FREEZE_VERSION !==
    "launch-l1-demo-foundation-freeze-1"
  ) {
    failures.push("l1 demo freeze mismatch");
  }
  if (
    LAUNCH_L2_PILOT_CUSTOMER_FLOW_FREEZE_VERSION !==
    "launch-l2-pilot-customer-flow-freeze-1"
  ) {
    failures.push("l2 pilot freeze mismatch");
  }
  if (
    LAUNCH_L3_PRODUCTION_HARDENING_FREEZE_VERSION !==
    "launch-l3-production-hardening-freeze-1"
  ) {
    failures.push("l3 hardening freeze mismatch");
  }
  if (
    LAUNCH_L4_ENTERPRISE_DELIVERY_VALIDATION_FREEZE_VERSION !==
    "launch-l4-enterprise-delivery-validation-freeze-1"
  ) {
    failures.push("l4 validation freeze mismatch");
  }

  return { ok: failures.length === 0, failures };
}

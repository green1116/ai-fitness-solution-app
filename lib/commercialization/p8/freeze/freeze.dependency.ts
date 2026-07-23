/**
 * Commercialization P8 — Dependency chain validation (read-only)
 */

import { ENTERPRISE_EVOLUTION_COMPLETE_ID } from "../../../evolution/signoff/governance.freeze.lock";
import {
  COMMERCIALIZATION_COMMERCIAL_GOVERNANCE_FREEZE_VERSION,
  COMMERCIALIZATION_CUSTOMER_ONBOARDING_FREEZE_VERSION,
  COMMERCIALIZATION_DELIVERY_OPERATIONS_FREEZE_VERSION,
  COMMERCIALIZATION_P8_FREEZE_BASE,
  COMMERCIALIZATION_P8_FREEZE_LOCK,
  COMMERCIALIZATION_PRICING_CONTRACT_FREEZE_VERSION,
  COMMERCIALIZATION_PRODUCT_PACKAGING_FREEZE_VERSION,
  COMMERCIALIZATION_REVENUE_INTELLIGENCE_FREEZE_VERSION,
  COMMERCIALIZATION_SALES_FOUNDATION_FREEZE_VERSION,
} from "./freeze.lock";

export const COMMERCIALIZATION_P8_EXPECTED_BASE_CHAIN = {
  p1: "enterprise-evolution-complete-v1",
  p2: "enterprise-commercialization-p1-sales-foundation-v1",
  p3: "enterprise-commercialization-p2-product-packaging-foundation-v1",
  p4: "enterprise-commercialization-p3-pricing-contract-foundation-v1",
  p5: "enterprise-commercialization-p4-customer-onboarding-foundation-v1",
  p6: "enterprise-commercialization-p5-delivery-operations-foundation-v1",
  p7: "enterprise-commercialization-p6-revenue-intelligence-v1",
  freeze: "enterprise-commercialization-p7-commercial-governance-v1",
} as const;

export function validateCommercializationP8DependencyChain(): {
  ok: boolean;
  failures: string[];
} {
  const expected = COMMERCIALIZATION_P8_EXPECTED_BASE_CHAIN;
  const phases = COMMERCIALIZATION_P8_FREEZE_LOCK.phases;
  const failures: string[] = [];

  if (phases.p1.base !== expected.p1) {
    failures.push(`p1 base expected=${expected.p1}`);
  }
  if (phases.p2.base !== expected.p2) {
    failures.push(`p2 base expected=${expected.p2}`);
  }
  if (phases.p3.base !== expected.p3) {
    failures.push(`p3 base expected=${expected.p3}`);
  }
  if (phases.p4.base !== expected.p4) {
    failures.push(`p4 base expected=${expected.p4}`);
  }
  if (phases.p5.base !== expected.p5) {
    failures.push(`p5 base expected=${expected.p5}`);
  }
  if (phases.p6.base !== expected.p6) {
    failures.push(`p6 base expected=${expected.p6}`);
  }
  if (phases.p7.base !== expected.p7) {
    failures.push(`p7 base expected=${expected.p7}`);
  }
  if (COMMERCIALIZATION_P8_FREEZE_BASE !== expected.freeze) {
    failures.push(`freeze base expected=${expected.freeze}`);
  }

  if (phases.p1.base !== ENTERPRISE_EVOLUTION_COMPLETE_ID) {
    failures.push("p1 base must equal enterprise-evolution-complete-v1");
  }
  if (phases.p2.base !== phases.p1.id) {
    failures.push("p2 base must equal p1 id");
  }
  if (phases.p3.base !== phases.p2.id) {
    failures.push("p3 base must equal p2 id");
  }
  if (phases.p4.base !== phases.p3.id) {
    failures.push("p4 base must equal p3 id");
  }
  if (phases.p5.base !== phases.p4.id) {
    failures.push("p5 base must equal p4 id");
  }
  if (phases.p6.base !== phases.p5.id) {
    failures.push("p6 base must equal p5 id");
  }
  if (phases.p7.base !== phases.p6.id) {
    failures.push("p7 base must equal p6 id");
  }
  if (COMMERCIALIZATION_P8_FREEZE_BASE !== phases.p7.id) {
    failures.push("freeze base must equal p7 id");
  }

  if (
    COMMERCIALIZATION_SALES_FOUNDATION_FREEZE_VERSION !==
    "commercialization-sales-foundation-freeze-1"
  ) {
    failures.push("p1 sales freeze mismatch");
  }
  if (
    COMMERCIALIZATION_PRODUCT_PACKAGING_FREEZE_VERSION !==
    "commercialization-product-packaging-foundation-freeze-1"
  ) {
    failures.push("p2 packaging freeze mismatch");
  }
  if (
    COMMERCIALIZATION_PRICING_CONTRACT_FREEZE_VERSION !==
    "commercialization-pricing-contract-foundation-freeze-1"
  ) {
    failures.push("p3 pricing freeze mismatch");
  }
  if (
    COMMERCIALIZATION_CUSTOMER_ONBOARDING_FREEZE_VERSION !==
    "commercialization-customer-onboarding-foundation-freeze-1"
  ) {
    failures.push("p4 onboarding freeze mismatch");
  }
  if (
    COMMERCIALIZATION_DELIVERY_OPERATIONS_FREEZE_VERSION !==
    "commercialization-delivery-operations-foundation-freeze-1"
  ) {
    failures.push("p5 delivery freeze mismatch");
  }
  if (
    COMMERCIALIZATION_REVENUE_INTELLIGENCE_FREEZE_VERSION !==
    "commercialization-revenue-intelligence-freeze-1"
  ) {
    failures.push("p6 revenue freeze mismatch");
  }
  if (
    COMMERCIALIZATION_COMMERCIAL_GOVERNANCE_FREEZE_VERSION !==
    "commercialization-commercial-governance-freeze-1"
  ) {
    failures.push("p7 governance freeze mismatch");
  }

  return { ok: failures.length === 0, failures };
}

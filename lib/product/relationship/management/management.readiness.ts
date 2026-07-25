/**
 * Product Relationship — readiness
 */

import { PRODUCT_CUSTOMER_PROFILE_ID } from "../../customer-profile/profile/profile.constants";
import { listBonds } from "../bond/bond.registry";
import { listClassifications } from "../classification/classification.registry";
import { listLifecycleEvents } from "../lifecycle/lifecycle.registry";
import { listParties } from "../party/party.registry";
import { PRODUCT_RELATIONSHIP_MANAGEMENT_BASE } from "./management.constants";
import type {
  RelationshipReadinessCheck,
  RelationshipReadinessResult,
} from "./management.types";

function nowIso(): string {
  return new Date().toISOString();
}

function check(
  id: string,
  component: string,
  label: string,
  ok: boolean,
  detail: string,
): RelationshipReadinessCheck {
  return { id, component, label, ok, detail };
}

export function evaluateRelationshipManagementReadiness(): RelationshipReadinessResult {
  const checks: RelationshipReadinessCheck[] = [];

  checks.push(
    check(
      "REL-BASE",
      "management",
      "Customer profile aligned",
      PRODUCT_RELATIONSHIP_MANAGEMENT_BASE === PRODUCT_CUSTOMER_PROFILE_ID,
      `base=${PRODUCT_RELATIONSHIP_MANAGEMENT_BASE}`,
    ),
  );

  const bonds = listBonds();
  checks.push(
    check(
      "REL-BOND",
      "bond",
      "Active bonds present",
      bonds.some((b) => b.status === "ACTIVE"),
      `bonds=${bonds.length}`,
    ),
  );

  const parties = listParties();
  checks.push(
    check(
      "REL-PTY",
      "party",
      "Primary parties present",
      parties.some((p) => p.role === "PRIMARY"),
      `parties=${parties.length}`,
    ),
  );

  const classifications = listClassifications();
  checks.push(
    check(
      "REL-CLS",
      "classification",
      "Classifications present",
      classifications.length >= 1,
      `classifications=${classifications.length}`,
    ),
  );

  const lifecycle = listLifecycleEvents();
  checks.push(
    check(
      "REL-LFC",
      "lifecycle",
      "Lifecycle transitions to ACTIVE",
      lifecycle.some((e) => e.toStatus === "ACTIVE"),
      `lifecycle=${lifecycle.length}`,
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
    summary: `product-relationship readiness ${verdict.toLowerCase()}: pass=${passCount} fail=${failCount}`,
    evaluatedAt: nowIso(),
  };
}

export function assertRelationshipManagementReadinessReady(
  result: RelationshipReadinessResult,
): asserts result is RelationshipReadinessResult & { verdict: "READY" } {
  if (result.verdict !== "READY") {
    throw new Error(
      `product relationship management not ready: ${result.summary}`,
    );
  }
}

/**
 * Product Marketplace Audit — readiness
 */

import { PRODUCT_INTEGRATION_GOVERNANCE_ID } from "../../integration-governance/management/management.constants";
import { listMarketplaceAuditEvents } from "../event/event.registry";
import { listMarketplaceAuditIntegrities } from "../integrity/integrity.registry";
import { listMarketplaceAuditReleaseManifests } from "../manifest/manifest.registry";
import { listMarketplaceAuditQueries } from "../query/query.registry";
import { listMarketplaceAuditTrails } from "../trail/trail.registry";
import { PRODUCT_MARKETPLACE_AUDIT_BASE } from "./management.constants";
import type {
  MarketplaceAuditReadinessCheck,
  MarketplaceAuditReadinessResult,
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
): MarketplaceAuditReadinessCheck {
  return { id, component, label, ok, detail };
}

export function evaluateMarketplaceAuditReadiness(): MarketplaceAuditReadinessResult {
  const checks: MarketplaceAuditReadinessCheck[] = [];

  checks.push(
    check(
      "MAUD-BASE",
      "management",
      "integration-governance base aligned",
      PRODUCT_MARKETPLACE_AUDIT_BASE === PRODUCT_INTEGRATION_GOVERNANCE_ID &&
        PRODUCT_INTEGRATION_GOVERNANCE_ID ===
          "enterprise-product-integration-governance-v1",
      `base=${PRODUCT_MARKETPLACE_AUDIT_BASE}`,
    ),
  );

  const events = listMarketplaceAuditEvents();
  checks.push(
    check(
      "MAUD-EVT",
      "event",
      "Audit events present",
      events.length >= 1,
      `events=${events.length}`,
    ),
  );

  const trails = listMarketplaceAuditTrails();
  checks.push(
    check(
      "MAUD-TRL",
      "trail",
      "Sealed trails present",
      trails.some((t) => t.status === "SEALED"),
      `trails=${trails.length}`,
    ),
  );

  const queries = listMarketplaceAuditQueries();
  checks.push(
    check(
      "MAUD-QRY",
      "query",
      "Audit queries present",
      queries.length >= 1,
      `queries=${queries.length}`,
    ),
  );

  const integrities = listMarketplaceAuditIntegrities();
  checks.push(
    check(
      "MAUD-INT",
      "integrity",
      "Intact integrity seals present",
      integrities.some((i) => i.verdict === "INTACT"),
      `integrities=${integrities.length}`,
    ),
  );

  const releases = listMarketplaceAuditReleaseManifests();
  checks.push(
    check(
      "MAUD-REL",
      "manifest",
      "Release manifests present",
      releases.length >= 1 && releases.every((r) => r.checksum.length === 64),
      `releases=${releases.length}`,
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
    summary: `product-marketplace-audit readiness ${verdict.toLowerCase()}: pass=${passCount} fail=${failCount}`,
    evaluatedAt: nowIso(),
  };
}

export function assertMarketplaceAuditReadinessReady(
  result: MarketplaceAuditReadinessResult,
): asserts result is MarketplaceAuditReadinessResult & { verdict: "READY" } {
  if (result.verdict !== "READY") {
    throw new Error(
      `product marketplace audit not ready: ${result.summary}`,
    );
  }
}

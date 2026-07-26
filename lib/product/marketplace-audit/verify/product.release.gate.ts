/**
 * Product Marketplace Audit — Release Gate
 * MODULE: Marketplace Audit (M08-P7)
 * BASE: enterprise-product-integration-governance-v1
 */

import { buildPlatformV1Manifest } from "../../../platform/v1/platform.manifest";
import { PRODUCT_INTEGRATION_GOVERNANCE_ID } from "../../integration-governance/management/management.constants";
import {
  assertMarketplaceAuditReadinessReady,
  clearMarketplaceAuditLayer,
  createMarketplaceAuditManager,
  getMarketplaceAuditRegistryManifest,
} from "../marketplace-audit.manager";
import {
  MARKETPLACE_AUDIT_CATEGORIES,
  MARKETPLACE_AUDIT_INTEGRITY_VERDICTS,
  MARKETPLACE_AUDIT_MANAGER_STATUSES,
  MARKETPLACE_AUDIT_READINESS_VERDICTS,
  MARKETPLACE_AUDIT_SEVERITIES,
  MARKETPLACE_AUDIT_TRAIL_STATUSES,
  PRODUCT_MARKETPLACE_AUDIT_BASE,
  PRODUCT_MARKETPLACE_AUDIT_FREEZE_TAG,
  PRODUCT_MARKETPLACE_AUDIT_FREEZE_VERSION,
  PRODUCT_MARKETPLACE_AUDIT_ID,
  PRODUCT_MARKETPLACE_AUDIT_VERSION,
} from "../management/management.constants";

export type GateVerdict = "PASS" | "FAIL";

export type GateCheckItem = {
  id: string;
  component: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type ReleaseGateResult = {
  result: GateVerdict;
  passCount: number;
  failCount: number;
  checks: GateCheckItem[];
  summary: string;
};

export const PRODUCT_MARKETPLACE_AUDIT_SIGNOFF_VERSION =
  "product-marketplace-audit-signoff-1" as const;

function check(
  id: string,
  component: string,
  label: string,
  ok: boolean,
  detail: string,
): GateCheckItem {
  return { id, component, label, ok, detail };
}

function cleanup(): void {
  clearMarketplaceAuditLayer();
}

export function checkProductMarketplaceAuditReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];

  checks.push(
    check(
      "MAUD-CONSTANTS",
      "management",
      "Product marketplace audit version constants",
      PRODUCT_MARKETPLACE_AUDIT_ID ===
        "enterprise-product-marketplace-audit-v1" &&
        PRODUCT_MARKETPLACE_AUDIT_VERSION === "product-marketplace-audit-1" &&
        PRODUCT_MARKETPLACE_AUDIT_BASE === PRODUCT_INTEGRATION_GOVERNANCE_ID &&
        PRODUCT_MARKETPLACE_AUDIT_FREEZE_VERSION ===
          "product-marketplace-audit-freeze-1" &&
        PRODUCT_MARKETPLACE_AUDIT_FREEZE_TAG ===
          "product-marketplace-audit-freeze-1" &&
        MARKETPLACE_AUDIT_CATEGORIES.length === 6 &&
        MARKETPLACE_AUDIT_SEVERITIES.length === 3 &&
        MARKETPLACE_AUDIT_TRAIL_STATUSES.length === 2 &&
        MARKETPLACE_AUDIT_INTEGRITY_VERDICTS.length === 3 &&
        MARKETPLACE_AUDIT_READINESS_VERDICTS.length === 3 &&
        MARKETPLACE_AUDIT_MANAGER_STATUSES.length === 4,
      `id=${PRODUCT_MARKETPLACE_AUDIT_ID} base=${PRODUCT_MARKETPLACE_AUDIT_BASE}`,
    ),
  );

  const platform = buildPlatformV1Manifest();
  checks.push(
    check(
      "MAUD-PLATFORM",
      "platform-v1",
      "Platform v1 baseline aligned",
      platform.aligned === true,
      platform.summary,
    ),
  );

  checks.push(
    check(
      "MAUD-UPSTREAM",
      "compatibility",
      "Depends on integration-governance chain",
      PRODUCT_MARKETPLACE_AUDIT_BASE ===
        "enterprise-product-integration-governance-v1" &&
        PRODUCT_INTEGRATION_GOVERNANCE_ID ===
          "enterprise-product-integration-governance-v1",
      `governance=${PRODUCT_INTEGRATION_GOVERNANCE_ID}`,
    ),
  );

  try {
    cleanup();
    const mgr = createMarketplaceAuditManager({
      managerId: "prod-mpaud-gate",
    });
    mgr.initialize();
    mgr.start();

    const event = mgr.recordEvent({
      id: "mpaud.gate.evt",
      eventKey: "GOV_LISTING_APPROVED",
      category: "GOVERNANCE",
      severity: "INFO",
      subjectKey: "ACME_COACHING",
      governanceKeyRef: "SURFACE_LISTING_GOV",
      detail: "integration governance review approved",
    });
    const trail = mgr.appendTrail({
      id: "mpaud.gate.trl",
      eventId: event.id,
      sequence: 1,
    });
    const sealed = mgr.sealTrail({ trailId: trail.id });
    const query = mgr.runQuery({
      id: "mpaud.gate.qry",
      queryKey: "GOV_EVENTS",
      category: "GOVERNANCE",
      subjectKey: "ACME_COACHING",
    });
    const integrity = mgr.sealIntegrity({
      id: "mpaud.gate.int",
      trailId: sealed.id,
    });
    const release = mgr.createReleaseManifest({
      id: "mpaud.gate.rel",
      eventId: event.id,
    });

    const readiness = mgr.evaluateReadiness();
    const registry = getMarketplaceAuditRegistryManifest();

    const ok =
      event.eventKey === "GOV_LISTING_APPROVED" &&
      sealed.status === "SEALED" &&
      query.matchedEventIds.includes(event.id) &&
      integrity.verdict === "INTACT" &&
      integrity.checksum.length === 64 &&
      release.checksum.length === 64 &&
      readiness.verdict === "READY" &&
      registry.auditId === PRODUCT_MARKETPLACE_AUDIT_ID &&
      registry.base === PRODUCT_MARKETPLACE_AUDIT_BASE &&
      registry.eventCount >= 1 &&
      registry.trailCount >= 1 &&
      registry.queryCount >= 1 &&
      registry.integrityCount >= 1 &&
      registry.releaseCount >= 1;

    try {
      assertMarketplaceAuditReadinessReady(readiness);
      checks.push(
        check(
          "MAUD-STACK",
          "marketplace-audit",
          "Event / trail / query / integrity / manifest",
          ok,
          `readiness=${readiness.verdict} checksum=${release.checksum.slice(0, 12)}…`,
        ),
      );
    } catch (error) {
      checks.push(
        check(
          "MAUD-STACK",
          "marketplace-audit",
          "Event / trail / query / integrity / manifest",
          false,
          error instanceof Error
            ? error.message
            : "product marketplace audit not ready",
        ),
      );
    }

    checks.push(
      check(
        "MAUD-SCOPE",
        "scope",
        "No connector-runtime / app-runtime / installation / provider-SDK / business-execution",
        ok,
        "marketplace-audit-declaration-only domain",
      ),
    );

    mgr.stop();
    cleanup();
  } catch (error) {
    const detail =
      error instanceof Error
        ? error.message
        : "product marketplace audit probe failed";
    checks.push(
      check(
        "MAUD-STACK",
        "marketplace-audit",
        "Event / trail / query / integrity / manifest",
        false,
        detail,
      ),
    );
    checks.push(
      check(
        "MAUD-SCOPE",
        "scope",
        "No connector-runtime / app-runtime / installation / provider-SDK / business-execution",
        false,
        detail,
      ),
    );
    cleanup();
  }

  const passCount = checks.filter((c) => c.ok).length;
  const failCount = checks.filter((c) => !c.ok).length;
  const result: GateVerdict = failCount === 0 ? "PASS" : "FAIL";

  return {
    result,
    passCount,
    failCount,
    checks,
    summary: [
      `product-marketplace-audit-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertProductMarketplaceAuditReleaseGatePass(
  gate: ReleaseGateResult = checkProductMarketplaceAuditReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(
      `Product marketplace audit release gate failed: ${gate.summary}`,
    );
  }
}

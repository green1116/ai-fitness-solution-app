/**
 * Product M14 — Intelligence Catalog Release Gate
 * MODULE: Enterprise Intelligence Catalog (M14-P2)
 * BASE: enterprise-product-intelligence-foundation-v1
 */

import { buildPlatformV1Manifest } from "../../../platform/v1/platform.manifest";
import { PRODUCT_INTELLIGENCE_FOUNDATION_ID } from "../foundation/intelligence.constants";
import { bindIntelligenceCatalogEntry } from "../catalog-runtime/binding.registry";
import {
  INTELLIGENCE_CATALOG_BINDING_STATUSES,
  INTELLIGENCE_CATALOG_ENTRY_STATUSES,
  INTELLIGENCE_CATALOG_KINDS,
  INTELLIGENCE_CATALOG_READINESS_VERDICTS,
  INTELLIGENCE_CATALOG_STATUSES,
  PRODUCT_INTELLIGENCE_CATALOG_BASE,
  PRODUCT_INTELLIGENCE_CATALOG_FREEZE_TAG,
  PRODUCT_INTELLIGENCE_CATALOG_FREEZE_VERSION,
  PRODUCT_INTELLIGENCE_CATALOG_ID,
  PRODUCT_INTELLIGENCE_CATALOG_VERSION,
} from "../catalog-runtime/catalog.constants";
import {
  assertIntelligenceCatalogReadinessReady,
  buildIntelligenceCatalogManifest,
  clearIntelligenceCatalogLayer,
  evaluateIntelligenceCatalogReadiness,
} from "../catalog-runtime/catalog.manifest";
import {
  getIntelligenceCatalogMetadata,
  isIntelligenceCatalogMetadataIntact,
} from "../catalog-runtime/catalog.metadata";
import {
  registerIntelligenceCatalog,
  updateIntelligenceCatalogStatus,
} from "../catalog-runtime/catalog.registry";
import {
  registerIntelligenceCatalogEntry,
  updateIntelligenceCatalogEntryStatus,
} from "../catalog-runtime/entry.registry";

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

export const PRODUCT_INTELLIGENCE_CATALOG_SIGNOFF_VERSION =
  "product-intelligence-catalog-signoff-1" as const;

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
  clearIntelligenceCatalogLayer();
}

export function checkProductIntelligenceCatalogReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];
  const metadata = getIntelligenceCatalogMetadata();

  checks.push(
    check(
      "INTCAT-CONSTANTS",
      "catalog",
      "Product intelligence catalog version constants",
      PRODUCT_INTELLIGENCE_CATALOG_ID ===
        "enterprise-product-intelligence-catalog-v1" &&
        PRODUCT_INTELLIGENCE_CATALOG_VERSION ===
          "product-intelligence-catalog-1" &&
        PRODUCT_INTELLIGENCE_CATALOG_BASE === PRODUCT_INTELLIGENCE_FOUNDATION_ID &&
        PRODUCT_INTELLIGENCE_CATALOG_FREEZE_VERSION ===
          "product-intelligence-catalog-freeze-1" &&
        PRODUCT_INTELLIGENCE_CATALOG_FREEZE_TAG ===
          "product-intelligence-catalog-freeze-1" &&
        INTELLIGENCE_CATALOG_KINDS.length === 4 &&
        INTELLIGENCE_CATALOG_STATUSES.length === 4 &&
        INTELLIGENCE_CATALOG_ENTRY_STATUSES.length === 4 &&
        INTELLIGENCE_CATALOG_BINDING_STATUSES.length === 3 &&
        INTELLIGENCE_CATALOG_READINESS_VERDICTS.length === 3 &&
        isIntelligenceCatalogMetadataIntact(metadata),
      `id=${PRODUCT_INTELLIGENCE_CATALOG_ID} base=${PRODUCT_INTELLIGENCE_CATALOG_BASE}`,
    ),
  );

  const platform = buildPlatformV1Manifest();
  checks.push(
    check(
      "INTCAT-PLATFORM",
      "platform-v1",
      "Platform v1 baseline aligned",
      platform.aligned === true,
      platform.summary,
    ),
  );

  checks.push(
    check(
      "INTCAT-UPSTREAM",
      "compatibility",
      "Depends on intelligence foundation chain",
      PRODUCT_INTELLIGENCE_CATALOG_BASE ===
        "enterprise-product-intelligence-foundation-v1" &&
        PRODUCT_INTELLIGENCE_FOUNDATION_ID ===
          "enterprise-product-intelligence-foundation-v1",
      `foundation=${PRODUCT_INTELLIGENCE_FOUNDATION_ID}`,
    ),
  );

  try {
    cleanup();

    const catalog = registerIntelligenceCatalog({
      id: "intcat.gate.cat",
      catalogKey: "EXECUTIVE_DECISION_PORTFOLIO",
      kind: "DOMAIN",
      title: "Executive decision intelligence catalog",
      summary: "Declared domain catalog for intelligence lens reuse",
    });
    const active = updateIntelligenceCatalogStatus({
      catalogId: catalog.id,
      status: "ACTIVE",
    });
    const entry = registerIntelligenceCatalogEntry({
      id: "intcat.gate.entry",
      catalogId: catalog.id,
      entryKey: "DECISION_SUPPORT_SLOT",
      sequence: 1,
      lensKeyRef: "EXECUTIVE_DECISION_SUPPORT",
      summary: "Soft-ref entry to foundation decision lens",
    });
    const declared = updateIntelligenceCatalogEntryStatus({
      entryId: entry.id,
      status: "DECLARED",
    });
    const binding = bindIntelligenceCatalogEntry({
      id: "intcat.gate.bind",
      catalogId: catalog.id,
      entryId: entry.id,
      bindingKey: "DECISION_PORTFOLIO_TO_LOOKUP",
      analysisContractKeyRef: "DECISION_DOMAIN_LOOKUP",
    });
    const manifest = buildIntelligenceCatalogManifest();
    const readiness = evaluateIntelligenceCatalogReadiness();

    const ok =
      catalog.catalogKey === "EXECUTIVE_DECISION_PORTFOLIO" &&
      active.status === "ACTIVE" &&
      declared.status === "DECLARED" &&
      declared.lensKeyRef === "EXECUTIVE_DECISION_SUPPORT" &&
      binding.status === "BOUND" &&
      binding.analysisContractKeyRef === "DECISION_DOMAIN_LOOKUP" &&
      manifest.checksum.length === 64 &&
      readiness.verdict === "READY";

    try {
      assertIntelligenceCatalogReadinessReady(readiness);
      checks.push(
        check(
          "INTCAT-STACK",
          "intelligence-catalog",
          "Catalog / entry / binding / manifest",
          ok,
          `readiness=${readiness.verdict} checksum=${manifest.checksum.slice(0, 12)}…`,
        ),
      );
    } catch (error) {
      checks.push(
        check(
          "INTCAT-STACK",
          "intelligence-catalog",
          "Catalog / entry / binding / manifest",
          false,
          error instanceof Error
            ? error.message
            : "product intelligence catalog not ready",
        ),
      );
    }

    checks.push(
      check(
        "INTCAT-SCOPE",
        "scope",
        "No DB / vector / RAG / embedding / intelligence execution / tool runtime",
        ok && metadata.declarationOnly === true,
        "intelligence-catalog-declaration-only domain",
      ),
    );

    cleanup();
  } catch (error) {
    const detail =
      error instanceof Error
        ? error.message
        : "product intelligence catalog probe failed";
    checks.push(
      check(
        "INTCAT-STACK",
        "intelligence-catalog",
        "Catalog / entry / binding / manifest",
        false,
        detail,
      ),
    );
    checks.push(
      check(
        "INTCAT-SCOPE",
        "scope",
        "No DB / vector / RAG / embedding / intelligence execution / tool runtime",
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
      `product-intelligence-catalog-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertProductIntelligenceCatalogReleaseGatePass(
  gate: ReleaseGateResult = checkProductIntelligenceCatalogReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(
      `Product intelligence catalog release gate failed: ${gate.summary}`,
    );
  }
}

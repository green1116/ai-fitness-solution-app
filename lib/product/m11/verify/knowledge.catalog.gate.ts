/**
 * Product M11 — Knowledge Catalog Release Gate
 * MODULE: Knowledge Catalog (M11-P2)
 * BASE: enterprise-product-knowledge-foundation-v1
 */

import { buildPlatformV1Manifest } from "../../../platform/v1/platform.manifest";
import { PRODUCT_KNOWLEDGE_FOUNDATION_ID } from "../foundation/knowledge.constants";
import { bindKnowledgeCatalogEntry } from "../catalog/binding.registry";
import {
  KNOWLEDGE_CATALOG_BINDING_STATUSES,
  KNOWLEDGE_CATALOG_ENTRY_STATUSES,
  KNOWLEDGE_CATALOG_KINDS,
  KNOWLEDGE_CATALOG_READINESS_VERDICTS,
  KNOWLEDGE_CATALOG_STATUSES,
  PRODUCT_KNOWLEDGE_CATALOG_BASE,
  PRODUCT_KNOWLEDGE_CATALOG_FREEZE_TAG,
  PRODUCT_KNOWLEDGE_CATALOG_FREEZE_VERSION,
  PRODUCT_KNOWLEDGE_CATALOG_ID,
  PRODUCT_KNOWLEDGE_CATALOG_VERSION,
} from "../catalog/catalog.constants";
import {
  assertKnowledgeCatalogReadinessReady,
  buildKnowledgeCatalogManifest,
  clearKnowledgeCatalogLayer,
  evaluateKnowledgeCatalogReadiness,
} from "../catalog/catalog.manifest";
import {
  getKnowledgeCatalogMetadata,
  isKnowledgeCatalogMetadataIntact,
} from "../catalog/catalog.metadata";
import {
  registerKnowledgeCatalog,
  updateKnowledgeCatalogStatus,
} from "../catalog/catalog.registry";
import {
  registerKnowledgeCatalogEntry,
  updateKnowledgeCatalogEntryStatus,
} from "../catalog/entry.registry";

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

export const PRODUCT_KNOWLEDGE_CATALOG_SIGNOFF_VERSION =
  "product-knowledge-catalog-signoff-1" as const;

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
  clearKnowledgeCatalogLayer();
}

export function checkProductKnowledgeCatalogReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];
  const metadata = getKnowledgeCatalogMetadata();

  checks.push(
    check(
      "KNWCAT-CONSTANTS",
      "catalog",
      "Product knowledge catalog version constants",
      PRODUCT_KNOWLEDGE_CATALOG_ID ===
        "enterprise-product-knowledge-catalog-v1" &&
        PRODUCT_KNOWLEDGE_CATALOG_VERSION === "product-knowledge-catalog-1" &&
        PRODUCT_KNOWLEDGE_CATALOG_BASE === PRODUCT_KNOWLEDGE_FOUNDATION_ID &&
        PRODUCT_KNOWLEDGE_CATALOG_FREEZE_VERSION ===
          "product-knowledge-catalog-freeze-1" &&
        PRODUCT_KNOWLEDGE_CATALOG_FREEZE_TAG ===
          "product-knowledge-catalog-freeze-1" &&
        KNOWLEDGE_CATALOG_KINDS.length === 4 &&
        KNOWLEDGE_CATALOG_STATUSES.length === 4 &&
        KNOWLEDGE_CATALOG_ENTRY_STATUSES.length === 4 &&
        KNOWLEDGE_CATALOG_BINDING_STATUSES.length === 3 &&
        KNOWLEDGE_CATALOG_READINESS_VERDICTS.length === 3 &&
        isKnowledgeCatalogMetadataIntact(metadata),
      `id=${PRODUCT_KNOWLEDGE_CATALOG_ID} base=${PRODUCT_KNOWLEDGE_CATALOG_BASE}`,
    ),
  );

  const platform = buildPlatformV1Manifest();
  checks.push(
    check(
      "KNWCAT-PLATFORM",
      "platform-v1",
      "Platform v1 baseline aligned",
      platform.aligned === true,
      platform.summary,
    ),
  );

  checks.push(
    check(
      "KNWCAT-UPSTREAM",
      "compatibility",
      "Depends on knowledge foundation chain",
      PRODUCT_KNOWLEDGE_CATALOG_BASE ===
        "enterprise-product-knowledge-foundation-v1" &&
        PRODUCT_KNOWLEDGE_FOUNDATION_ID ===
          "enterprise-product-knowledge-foundation-v1",
      `foundation=${PRODUCT_KNOWLEDGE_FOUNDATION_ID}`,
    ),
  );

  try {
    cleanup();

    const catalog = registerKnowledgeCatalog({
      id: "knwcat.gate.cat",
      catalogKey: "DOMAIN_FITNESS_LIBRARY",
      kind: "DOMAIN",
      title: "Domain fitness knowledge catalog",
      summary: "Declared domain catalog for knowledge reuse",
    });
    const active = updateKnowledgeCatalogStatus({
      catalogId: catalog.id,
      status: "ACTIVE",
    });
    const entry = registerKnowledgeCatalogEntry({
      id: "knwcat.gate.entry",
      catalogId: catalog.id,
      entryKey: "POLICY_SLOT",
      sequence: 1,
      entityKeyRef: "DOMAIN_FITNESS_POLICY",
      summary: "Soft-ref entry to foundation policy entity",
    });
    const declared = updateKnowledgeCatalogEntryStatus({
      entryId: entry.id,
      status: "DECLARED",
    });
    const binding = bindKnowledgeCatalogEntry({
      id: "knwcat.gate.bind",
      catalogId: catalog.id,
      entryId: entry.id,
      bindingKey: "DOMAIN_LIBRARY_TO_LOOKUP",
      retrievalContractKeyRef: "DOMAIN_POLICY_LOOKUP",
    });
    const manifest = buildKnowledgeCatalogManifest();
    const readiness = evaluateKnowledgeCatalogReadiness();

    const ok =
      catalog.catalogKey === "DOMAIN_FITNESS_LIBRARY" &&
      active.status === "ACTIVE" &&
      declared.status === "DECLARED" &&
      declared.entityKeyRef === "DOMAIN_FITNESS_POLICY" &&
      binding.status === "BOUND" &&
      binding.retrievalContractKeyRef === "DOMAIN_POLICY_LOOKUP" &&
      manifest.checksum.length === 64 &&
      readiness.verdict === "READY";

    try {
      assertKnowledgeCatalogReadinessReady(readiness);
      checks.push(
        check(
          "KNWCAT-STACK",
          "knowledge-catalog",
          "Catalog / entry / binding / manifest",
          ok,
          `readiness=${readiness.verdict} checksum=${manifest.checksum.slice(0, 12)}…`,
        ),
      );
    } catch (error) {
      checks.push(
        check(
          "KNWCAT-STACK",
          "knowledge-catalog",
          "Catalog / entry / binding / manifest",
          false,
          error instanceof Error
            ? error.message
            : "product knowledge catalog not ready",
        ),
      );
    }

    checks.push(
      check(
        "KNWCAT-SCOPE",
        "scope",
        "No DB / vector / RAG / embedding / external provider / model execution",
        ok && metadata.declarationOnly === true,
        "knowledge-catalog-declaration-only domain",
      ),
    );

    cleanup();
  } catch (error) {
    const detail =
      error instanceof Error
        ? error.message
        : "product knowledge catalog probe failed";
    checks.push(
      check(
        "KNWCAT-STACK",
        "knowledge-catalog",
        "Catalog / entry / binding / manifest",
        false,
        detail,
      ),
    );
    checks.push(
      check(
        "KNWCAT-SCOPE",
        "scope",
        "No DB / vector / RAG / embedding / external provider / model execution",
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
      `product-knowledge-catalog-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertProductKnowledgeCatalogReleaseGatePass(
  gate: ReleaseGateResult = checkProductKnowledgeCatalogReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(
      `Product knowledge catalog release gate failed: ${gate.summary}`,
    );
  }
}

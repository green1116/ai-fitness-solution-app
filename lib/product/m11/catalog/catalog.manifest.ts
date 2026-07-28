/**
 * Product M11 — Knowledge Catalog manifest builder
 */

import { createHash } from "node:crypto";

import { PRODUCT_KNOWLEDGE_FOUNDATION_ID } from "../foundation/knowledge.constants";
import {
  clearKnowledgeCatalogBindings,
  listKnowledgeCatalogBindings,
} from "./binding.registry";
import {
  PRODUCT_KNOWLEDGE_CATALOG_BASE,
  PRODUCT_KNOWLEDGE_CATALOG_FREEZE_VERSION,
  PRODUCT_KNOWLEDGE_CATALOG_ID,
  PRODUCT_KNOWLEDGE_CATALOG_VERSION,
} from "./catalog.constants";
import { getKnowledgeCatalogMetadata } from "./catalog.metadata";
import {
  clearKnowledgeCatalogs,
  listKnowledgeCatalogs,
} from "./catalog.registry";
import type {
  KnowledgeCatalogManifest,
  KnowledgeCatalogReadinessCheck,
  KnowledgeCatalogReadinessResult,
} from "./catalog.types";
import {
  clearKnowledgeCatalogEntries,
  listKnowledgeCatalogEntries,
} from "./entry.registry";

function nowIso(): string {
  return new Date().toISOString();
}

function check(
  id: string,
  component: string,
  label: string,
  ok: boolean,
  detail: string,
): KnowledgeCatalogReadinessCheck {
  return { id, component, label, ok, detail };
}

export function clearKnowledgeCatalogLayer(): void {
  clearKnowledgeCatalogBindings();
  clearKnowledgeCatalogEntries();
  clearKnowledgeCatalogs();
}

export function buildKnowledgeCatalogManifest(): KnowledgeCatalogManifest {
  const catalogs = listKnowledgeCatalogs();
  const entries = listKnowledgeCatalogEntries();
  const bindings = listKnowledgeCatalogBindings();
  const metadata = getKnowledgeCatalogMetadata();

  const payload = {
    catalogRuntimeId: PRODUCT_KNOWLEDGE_CATALOG_ID,
    version: PRODUCT_KNOWLEDGE_CATALOG_VERSION,
    freezeVersion: PRODUCT_KNOWLEDGE_CATALOG_FREEZE_VERSION,
    base: PRODUCT_KNOWLEDGE_CATALOG_BASE,
    module: metadata.module,
    declarationOnly: metadata.declarationOnly,
    catalogs: catalogs.map((c) => ({
      catalogKey: c.catalogKey,
      kind: c.kind,
      status: c.status,
    })),
    entries: entries.map((e) => ({
      entryKey: e.entryKey,
      sequence: e.sequence,
      status: e.status,
      catalogId: e.catalogId,
      entityKeyRef: e.entityKeyRef,
    })),
    bindings: bindings.map((b) => ({
      bindingKey: b.bindingKey,
      retrievalContractKeyRef: b.retrievalContractKeyRef,
      status: b.status,
      catalogId: b.catalogId,
    })),
  };

  return {
    catalogRuntimeId: PRODUCT_KNOWLEDGE_CATALOG_ID,
    version: PRODUCT_KNOWLEDGE_CATALOG_VERSION,
    freezeVersion: PRODUCT_KNOWLEDGE_CATALOG_FREEZE_VERSION,
    base: PRODUCT_KNOWLEDGE_CATALOG_BASE,
    catalogCount: catalogs.length,
    entryCount: entries.length,
    bindingCount: bindings.length,
    checksum: createHash("sha256")
      .update(JSON.stringify(payload))
      .digest("hex"),
    createdAt: nowIso(),
  };
}

export function evaluateKnowledgeCatalogReadiness(): KnowledgeCatalogReadinessResult {
  const checks: KnowledgeCatalogReadinessCheck[] = [];
  const metadata = getKnowledgeCatalogMetadata();
  const catalogs = listKnowledgeCatalogs();
  const entries = listKnowledgeCatalogEntries();
  const bindings = listKnowledgeCatalogBindings();
  const manifest = buildKnowledgeCatalogManifest();

  checks.push(
    check(
      "KNWCAT-BASE",
      "catalog",
      "knowledge foundation base aligned",
      PRODUCT_KNOWLEDGE_CATALOG_BASE === PRODUCT_KNOWLEDGE_FOUNDATION_ID &&
        PRODUCT_KNOWLEDGE_FOUNDATION_ID ===
          "enterprise-product-knowledge-foundation-v1",
      `base=${PRODUCT_KNOWLEDGE_CATALOG_BASE}`,
    ),
  );

  checks.push(
    check(
      "KNWCAT-META",
      "metadata",
      "Knowledge catalog metadata declaration-only",
      metadata.declarationOnly === true && metadata.excludes.length === 7,
      `module=${metadata.module}`,
    ),
  );

  checks.push(
    check(
      "KNWCAT-CAT",
      "catalog",
      "Active knowledge catalogs present",
      catalogs.some((c) => c.status === "ACTIVE"),
      `catalogs=${catalogs.length}`,
    ),
  );

  checks.push(
    check(
      "KNWCAT-ENT",
      "entry",
      "Declared catalog entries with soft entity refs",
      entries.some((e) => e.status === "DECLARED" && e.entityKeyRef.length > 0),
      `entries=${entries.length}`,
    ),
  );

  checks.push(
    check(
      "KNWCAT-BIND",
      "binding",
      "Bound catalog entries present",
      bindings.some((b) => b.status === "BOUND"),
      `bindings=${bindings.length}`,
    ),
  );

  checks.push(
    check(
      "KNWCAT-MAN",
      "manifest",
      "Knowledge catalog manifest checksum intact",
      manifest.checksum.length === 64 &&
        manifest.catalogRuntimeId === PRODUCT_KNOWLEDGE_CATALOG_ID &&
        manifest.catalogCount >= 1 &&
        manifest.entryCount >= 1 &&
        manifest.bindingCount >= 1,
      `checksum=${manifest.checksum.slice(0, 12)}…`,
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
    summary: `product-knowledge-catalog readiness ${verdict.toLowerCase()}: pass=${passCount} fail=${failCount}`,
    evaluatedAt: nowIso(),
  };
}

export function assertKnowledgeCatalogReadinessReady(
  result: KnowledgeCatalogReadinessResult,
): asserts result is KnowledgeCatalogReadinessResult & { verdict: "READY" } {
  if (result.verdict !== "READY") {
    throw new Error(`product knowledge catalog not ready: ${result.summary}`);
  }
}

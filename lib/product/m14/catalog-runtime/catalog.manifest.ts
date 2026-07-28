/**
 * Product M14 — Intelligence Catalog manifest builder
 */

import { createHash } from "node:crypto";

import { PRODUCT_INTELLIGENCE_FOUNDATION_ID } from "../foundation/intelligence.constants";
import {
  clearIntelligenceCatalogBindings,
  listIntelligenceCatalogBindings,
} from "./binding.registry";
import {
  PRODUCT_INTELLIGENCE_CATALOG_BASE,
  PRODUCT_INTELLIGENCE_CATALOG_FREEZE_VERSION,
  PRODUCT_INTELLIGENCE_CATALOG_ID,
  PRODUCT_INTELLIGENCE_CATALOG_VERSION,
} from "./catalog.constants";
import { getIntelligenceCatalogMetadata } from "./catalog.metadata";
import {
  clearIntelligenceCatalogs,
  listIntelligenceCatalogs,
} from "./catalog.registry";
import type {
  IntelligenceCatalogManifest,
  IntelligenceCatalogReadinessCheck,
  IntelligenceCatalogReadinessResult,
} from "./catalog.types";
import {
  clearIntelligenceCatalogEntries,
  listIntelligenceCatalogEntries,
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
): IntelligenceCatalogReadinessCheck {
  return { id, component, label, ok, detail };
}

export function clearIntelligenceCatalogLayer(): void {
  clearIntelligenceCatalogBindings();
  clearIntelligenceCatalogEntries();
  clearIntelligenceCatalogs();
}

export function buildIntelligenceCatalogManifest(): IntelligenceCatalogManifest {
  const catalogs = listIntelligenceCatalogs();
  const entries = listIntelligenceCatalogEntries();
  const bindings = listIntelligenceCatalogBindings();
  const metadata = getIntelligenceCatalogMetadata();

  const payload = {
    catalogRuntimeId: PRODUCT_INTELLIGENCE_CATALOG_ID,
    version: PRODUCT_INTELLIGENCE_CATALOG_VERSION,
    freezeVersion: PRODUCT_INTELLIGENCE_CATALOG_FREEZE_VERSION,
    base: PRODUCT_INTELLIGENCE_CATALOG_BASE,
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
      lensKeyRef: e.lensKeyRef,
    })),
    bindings: bindings.map((b) => ({
      bindingKey: b.bindingKey,
      analysisContractKeyRef: b.analysisContractKeyRef,
      status: b.status,
      catalogId: b.catalogId,
    })),
  };

  return {
    catalogRuntimeId: PRODUCT_INTELLIGENCE_CATALOG_ID,
    version: PRODUCT_INTELLIGENCE_CATALOG_VERSION,
    freezeVersion: PRODUCT_INTELLIGENCE_CATALOG_FREEZE_VERSION,
    base: PRODUCT_INTELLIGENCE_CATALOG_BASE,
    catalogCount: catalogs.length,
    entryCount: entries.length,
    bindingCount: bindings.length,
    checksum: createHash("sha256").update(JSON.stringify(payload)).digest("hex"),
    createdAt: nowIso(),
  };
}

export function evaluateIntelligenceCatalogReadiness(): IntelligenceCatalogReadinessResult {
  const checks: IntelligenceCatalogReadinessCheck[] = [];
  const metadata = getIntelligenceCatalogMetadata();
  const catalogs = listIntelligenceCatalogs();
  const entries = listIntelligenceCatalogEntries();
  const bindings = listIntelligenceCatalogBindings();
  const manifest = buildIntelligenceCatalogManifest();

  checks.push(
    check(
      "INTCAT-BASE",
      "catalog",
      "intelligence foundation base aligned",
      PRODUCT_INTELLIGENCE_CATALOG_BASE === PRODUCT_INTELLIGENCE_FOUNDATION_ID &&
        PRODUCT_INTELLIGENCE_FOUNDATION_ID ===
          "enterprise-product-intelligence-foundation-v1",
      `base=${PRODUCT_INTELLIGENCE_CATALOG_BASE}`,
    ),
  );

  checks.push(
    check(
      "INTCAT-META",
      "metadata",
      "Intelligence catalog metadata declaration-only",
      metadata.declarationOnly === true && metadata.excludes.length === 7,
      `module=${metadata.module}`,
    ),
  );

  checks.push(
    check(
      "INTCAT-CAT",
      "catalog",
      "Active intelligence catalogs present",
      catalogs.some((c) => c.status === "ACTIVE"),
      `catalogs=${catalogs.length}`,
    ),
  );

  checks.push(
    check(
      "INTCAT-ENT",
      "entry",
      "Declared catalog entries with soft lens refs",
      entries.some((e) => e.status === "DECLARED" && e.lensKeyRef.length > 0),
      `entries=${entries.length}`,
    ),
  );

  checks.push(
    check(
      "INTCAT-BIND",
      "binding",
      "Bound catalog entries present",
      bindings.some((b) => b.status === "BOUND"),
      `bindings=${bindings.length}`,
    ),
  );

  checks.push(
    check(
      "INTCAT-MAN",
      "manifest",
      "Intelligence catalog manifest checksum intact",
      manifest.checksum.length === 64 &&
        manifest.catalogRuntimeId === PRODUCT_INTELLIGENCE_CATALOG_ID &&
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
    summary: `product-intelligence-catalog readiness ${verdict.toLowerCase()}: pass=${passCount} fail=${failCount}`,
    evaluatedAt: nowIso(),
  };
}

export function assertIntelligenceCatalogReadinessReady(
  result: IntelligenceCatalogReadinessResult,
): asserts result is IntelligenceCatalogReadinessResult & { verdict: "READY" } {
  if (result.verdict !== "READY") {
    throw new Error(`product intelligence catalog not ready: ${result.summary}`);
  }
}

/**
 * Product M13 — OS Catalog manifest builder
 */

import { createHash } from "node:crypto";

import { PRODUCT_OS_FOUNDATION_ID } from "../foundation/os.constants";
import {
  clearOsCatalogBindings,
  listOsCatalogBindings,
} from "./binding.registry";
import {
  PRODUCT_OS_CATALOG_BASE,
  PRODUCT_OS_CATALOG_FREEZE_VERSION,
  PRODUCT_OS_CATALOG_ID,
  PRODUCT_OS_CATALOG_VERSION,
} from "./catalog.constants";
import { getOsCatalogMetadata } from "./catalog.metadata";
import { clearOsCatalogs, listOsCatalogs } from "./catalog.registry";
import type {
  OsCatalogManifest,
  OsCatalogReadinessCheck,
  OsCatalogReadinessResult,
} from "./catalog.types";
import {
  clearOsCatalogEntries,
  listOsCatalogEntries,
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
): OsCatalogReadinessCheck {
  return { id, component, label, ok, detail };
}

export function clearOsCatalogLayer(): void {
  clearOsCatalogBindings();
  clearOsCatalogEntries();
  clearOsCatalogs();
}

export function buildOsCatalogManifest(): OsCatalogManifest {
  const catalogs = listOsCatalogs();
  const entries = listOsCatalogEntries();
  const bindings = listOsCatalogBindings();
  const metadata = getOsCatalogMetadata();

  const payload = {
    catalogRuntimeId: PRODUCT_OS_CATALOG_ID,
    version: PRODUCT_OS_CATALOG_VERSION,
    freezeVersion: PRODUCT_OS_CATALOG_FREEZE_VERSION,
    base: PRODUCT_OS_CATALOG_BASE,
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
      surfaceKeyRef: e.surfaceKeyRef,
    })),
    bindings: bindings.map((b) => ({
      bindingKey: b.bindingKey,
      operationContractKeyRef: b.operationContractKeyRef,
      status: b.status,
      catalogId: b.catalogId,
    })),
  };

  return {
    catalogRuntimeId: PRODUCT_OS_CATALOG_ID,
    version: PRODUCT_OS_CATALOG_VERSION,
    freezeVersion: PRODUCT_OS_CATALOG_FREEZE_VERSION,
    base: PRODUCT_OS_CATALOG_BASE,
    catalogCount: catalogs.length,
    entryCount: entries.length,
    bindingCount: bindings.length,
    checksum: createHash("sha256")
      .update(JSON.stringify(payload))
      .digest("hex"),
    createdAt: nowIso(),
  };
}

export function evaluateOsCatalogReadiness(): OsCatalogReadinessResult {
  const checks: OsCatalogReadinessCheck[] = [];
  const metadata = getOsCatalogMetadata();
  const catalogs = listOsCatalogs();
  const entries = listOsCatalogEntries();
  const bindings = listOsCatalogBindings();
  const manifest = buildOsCatalogManifest();

  checks.push(
    check(
      "OSCAT-BASE",
      "catalog",
      "os foundation base aligned",
      PRODUCT_OS_CATALOG_BASE === PRODUCT_OS_FOUNDATION_ID &&
        PRODUCT_OS_FOUNDATION_ID === "enterprise-product-os-foundation-v1",
      `base=${PRODUCT_OS_CATALOG_BASE}`,
    ),
  );

  checks.push(
    check(
      "OSCAT-META",
      "metadata",
      "OS catalog metadata declaration-only",
      metadata.declarationOnly === true && metadata.excludes.length === 7,
      `module=${metadata.module}`,
    ),
  );

  checks.push(
    check(
      "OSCAT-CAT",
      "catalog",
      "Active OS catalogs present",
      catalogs.some((c) => c.status === "ACTIVE"),
      `catalogs=${catalogs.length}`,
    ),
  );

  checks.push(
    check(
      "OSCAT-ENT",
      "entry",
      "Declared catalog entries with soft surface refs",
      entries.some(
        (e) => e.status === "DECLARED" && e.surfaceKeyRef.length > 0,
      ),
      `entries=${entries.length}`,
    ),
  );

  checks.push(
    check(
      "OSCAT-BIND",
      "binding",
      "Bound catalog entries present",
      bindings.some((b) => b.status === "BOUND"),
      `bindings=${bindings.length}`,
    ),
  );

  checks.push(
    check(
      "OSCAT-MAN",
      "manifest",
      "OS catalog manifest checksum intact",
      manifest.checksum.length === 64 &&
        manifest.catalogRuntimeId === PRODUCT_OS_CATALOG_ID &&
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
    summary: `product-os-catalog readiness ${verdict.toLowerCase()}: pass=${passCount} fail=${failCount}`,
    evaluatedAt: nowIso(),
  };
}

export function assertOsCatalogReadinessReady(
  result: OsCatalogReadinessResult,
): asserts result is OsCatalogReadinessResult & { verdict: "READY" } {
  if (result.verdict !== "READY") {
    throw new Error(`product os catalog not ready: ${result.summary}`);
  }
}

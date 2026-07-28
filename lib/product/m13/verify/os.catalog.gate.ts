/**
 * Product M13 — OS Catalog Release Gate
 * MODULE: OS Catalog (M13-P2)
 * BASE: enterprise-product-os-foundation-v1
 */

import { buildPlatformV1Manifest } from "../../../platform/v1/platform.manifest";
import { PRODUCT_OS_FOUNDATION_ID } from "../foundation/os.constants";
import { bindOsCatalogEntry } from "../catalog-runtime/binding.registry";
import {
  OS_CATALOG_BINDING_STATUSES,
  OS_CATALOG_ENTRY_STATUSES,
  OS_CATALOG_KINDS,
  OS_CATALOG_READINESS_VERDICTS,
  OS_CATALOG_STATUSES,
  PRODUCT_OS_CATALOG_BASE,
  PRODUCT_OS_CATALOG_FREEZE_TAG,
  PRODUCT_OS_CATALOG_FREEZE_VERSION,
  PRODUCT_OS_CATALOG_ID,
  PRODUCT_OS_CATALOG_VERSION,
} from "../catalog-runtime/catalog.constants";
import {
  assertOsCatalogReadinessReady,
  buildOsCatalogManifest,
  clearOsCatalogLayer,
  evaluateOsCatalogReadiness,
} from "../catalog-runtime/catalog.manifest";
import {
  getOsCatalogMetadata,
  isOsCatalogMetadataIntact,
} from "../catalog-runtime/catalog.metadata";
import {
  registerOsCatalog,
  updateOsCatalogStatus,
} from "../catalog-runtime/catalog.registry";
import {
  registerOsCatalogEntry,
  updateOsCatalogEntryStatus,
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

export const PRODUCT_OS_CATALOG_SIGNOFF_VERSION =
  "product-os-catalog-signoff-1" as const;

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
  clearOsCatalogLayer();
}

export function checkProductOsCatalogReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];
  const metadata = getOsCatalogMetadata();

  checks.push(
    check(
      "OSCAT-CONSTANTS",
      "catalog",
      "Product OS catalog version constants",
      PRODUCT_OS_CATALOG_ID === "enterprise-product-os-catalog-v1" &&
        PRODUCT_OS_CATALOG_VERSION === "product-os-catalog-1" &&
        PRODUCT_OS_CATALOG_BASE === PRODUCT_OS_FOUNDATION_ID &&
        PRODUCT_OS_CATALOG_FREEZE_VERSION === "product-os-catalog-freeze-1" &&
        PRODUCT_OS_CATALOG_FREEZE_TAG === "product-os-catalog-freeze-1" &&
        OS_CATALOG_KINDS.length === 4 &&
        OS_CATALOG_STATUSES.length === 4 &&
        OS_CATALOG_ENTRY_STATUSES.length === 4 &&
        OS_CATALOG_BINDING_STATUSES.length === 3 &&
        OS_CATALOG_READINESS_VERDICTS.length === 3 &&
        isOsCatalogMetadataIntact(metadata),
      `id=${PRODUCT_OS_CATALOG_ID} base=${PRODUCT_OS_CATALOG_BASE}`,
    ),
  );

  const platform = buildPlatformV1Manifest();
  checks.push(
    check(
      "OSCAT-PLATFORM",
      "platform-v1",
      "Platform v1 baseline aligned",
      platform.aligned === true,
      platform.summary,
    ),
  );

  checks.push(
    check(
      "OSCAT-UPSTREAM",
      "compatibility",
      "Depends on OS foundation chain",
      PRODUCT_OS_CATALOG_BASE === "enterprise-product-os-foundation-v1" &&
        PRODUCT_OS_FOUNDATION_ID === "enterprise-product-os-foundation-v1",
      `foundation=${PRODUCT_OS_FOUNDATION_ID}`,
    ),
  );

  try {
    cleanup();

    const catalog = registerOsCatalog({
      id: "oscat.gate.cat",
      catalogKey: "DOMAIN_CONTROL_FLEET",
      kind: "DOMAIN",
      title: "Domain control surface catalog",
      summary: "Declared domain catalog for OS surface reuse",
    });
    const active = updateOsCatalogStatus({
      catalogId: catalog.id,
      status: "ACTIVE",
    });
    const entry = registerOsCatalogEntry({
      id: "oscat.gate.entry",
      catalogId: catalog.id,
      entryKey: "CONTROL_SLOT",
      sequence: 1,
      surfaceKeyRef: "DOMAIN_CONTROL_PLANE",
      summary: "Soft-ref entry to foundation control surface",
    });
    const declared = updateOsCatalogEntryStatus({
      entryId: entry.id,
      status: "DECLARED",
    });
    const binding = bindOsCatalogEntry({
      id: "oscat.gate.bind",
      catalogId: catalog.id,
      entryId: entry.id,
      bindingKey: "DOMAIN_FLEET_TO_LOOKUP",
      operationContractKeyRef: "CONTROL_DOMAIN_LOOKUP",
    });
    const manifest = buildOsCatalogManifest();
    const readiness = evaluateOsCatalogReadiness();

    const ok =
      catalog.catalogKey === "DOMAIN_CONTROL_FLEET" &&
      active.status === "ACTIVE" &&
      declared.status === "DECLARED" &&
      declared.surfaceKeyRef === "DOMAIN_CONTROL_PLANE" &&
      binding.status === "BOUND" &&
      binding.operationContractKeyRef === "CONTROL_DOMAIN_LOOKUP" &&
      manifest.checksum.length === 64 &&
      readiness.verdict === "READY";

    try {
      assertOsCatalogReadinessReady(readiness);
      checks.push(
        check(
          "OSCAT-STACK",
          "os-catalog",
          "Catalog / entry / binding / manifest",
          ok,
          `readiness=${readiness.verdict} checksum=${manifest.checksum.slice(0, 12)}…`,
        ),
      );
    } catch (error) {
      checks.push(
        check(
          "OSCAT-STACK",
          "os-catalog",
          "Catalog / entry / binding / manifest",
          false,
          error instanceof Error
            ? error.message
            : "product os catalog not ready",
        ),
      );
    }

    checks.push(
      check(
        "OSCAT-SCOPE",
        "scope",
        "No DB / vector / RAG / embedding / OS execution / tool runtime",
        ok && metadata.declarationOnly === true,
        "os-catalog-declaration-only domain",
      ),
    );

    cleanup();
  } catch (error) {
    const detail =
      error instanceof Error
        ? error.message
        : "product os catalog probe failed";
    checks.push(
      check(
        "OSCAT-STACK",
        "os-catalog",
        "Catalog / entry / binding / manifest",
        false,
        detail,
      ),
    );
    checks.push(
      check(
        "OSCAT-SCOPE",
        "scope",
        "No DB / vector / RAG / embedding / OS execution / tool runtime",
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
      `product-os-catalog-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertProductOsCatalogReleaseGatePass(
  gate: ReleaseGateResult = checkProductOsCatalogReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(
      `Product OS catalog release gate failed: ${gate.summary}`,
    );
  }
}

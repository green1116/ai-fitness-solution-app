/**
 * V68 P1 — Service Catalog Verification
 */
import fs from "node:fs";
import path from "node:path";

import {
  SERVICE_DEFINITION_CATALOG,
  SERVICE_METADATA_CATALOG,
  SERVICE_OWNER_CATALOG,
  SERVICE_STATUS_CATALOG,
  V68_SERVICE_CATALOG_ARTIFACT_SURFACE,
  V68_SERVICE_CATALOG_VERSION,
  V68_UPSTREAM_FROZEN_PLATFORM_LOCK,
  assertServiceCatalogPass,
  buildServiceCatalogReport,
  buildServiceDefinitionManifest,
  buildServiceMetadataManifest,
  buildServiceOwnerManifest,
  buildServiceStatusManifest,
  formatServiceCatalogSummary,
  getMetadataByServiceDefRef,
  getOwnerByServiceDefRef,
  getServiceDefinitionById,
  getStatusByServiceDefRef,
  isMonitoringRefsAligned,
  isOncallRefsAligned,
  isServiceCatalogCrossRefsAligned,
  isUpstreamFrozenPlatformLockIntact,
  runServiceCatalog,
} from "../lib/platform/v68";

const ROOT = path.resolve(__dirname, "..");
const DEPLOYMENT_ID = "v68-p1-service-catalog";

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModuleStructure() {
  const required = [
    "lib/platform/v68/index.ts",
    "lib/platform/v68/service-catalog/catalog.ts",
    "lib/platform/v68/service-catalog/catalog.types.ts",
    "lib/platform/v68/service-catalog/catalog.constants.ts",
    "lib/platform/v68/service-catalog/catalog.surface.ts",
    "lib/platform/v68/service-catalog/catalog.builder.ts",
    "lib/platform/v68/service-catalog/catalog.entry.ts",
    "lib/platform/v68/service-catalog/service.definition.catalog.ts",
    "lib/platform/v68/service-catalog/service.metadata.catalog.ts",
    "lib/platform/v68/service-catalog/service.status.catalog.ts",
    "lib/platform/v68/service-catalog/service.owner.catalog.ts",
    "lib/platform/v68/service-catalog/alignment.catalog.ts",
    "docs/platform/V68-SERVICE-CATALOG.md",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing module: ${rel}`);
  }
  console.log("✓ V68 service catalog module structure");
}

function testInventories() {
  check(SERVICE_DEFINITION_CATALOG.length >= 6, "service definition catalog");
  check(SERVICE_METADATA_CATALOG.length >= 6, "service metadata catalog");
  check(SERVICE_STATUS_CATALOG.length >= 6, "service status catalog");
  check(SERVICE_OWNER_CATALOG.length >= 6, "service owner catalog");
  check(isUpstreamFrozenPlatformLockIntact(), "upstream platform lock intact");
  console.log("✓ service definitions, metadata, status, owners & upstream lock");
}

function testCrossReferences() {
  check(isMonitoringRefsAligned(), "monitoring SH refs aligned");
  check(isOncallRefsAligned(), "oncall OC refs aligned");
  check(isServiceCatalogCrossRefsAligned(), "full cross-ref alignment");

  const def001 = getServiceDefinitionById("SVC-DEF-001");
  check(def001?.monitoringRef === "SH-001", "SVC-DEF-001 monitoring ref");

  const meta001 = getMetadataByServiceDefRef("SVC-DEF-001");
  check(meta001?.serviceDefRef === "SVC-DEF-001", "metadata for SVC-DEF-001");

  const sts001 = getStatusByServiceDefRef("SVC-DEF-001");
  check(sts001?.healthRef === "SH-001", "status health ref");

  const own001 = getOwnerByServiceDefRef("SVC-DEF-001");
  check(own001?.oncallRef === "OC-001", "owner oncall ref");

  check(
    V68_UPSTREAM_FROZEN_PLATFORM_LOCK.v67MonitoringSignoff.length > 0,
    "V67 signoff in upstream lock",
  );
  console.log("✓ cross-references & V67 upstream alignment");
}

function testManifests() {
  check(buildServiceDefinitionManifest().catalogComplete, "definitions manifest");
  check(buildServiceMetadataManifest().catalogComplete, "metadata manifest");
  check(buildServiceStatusManifest().catalogComplete, "status manifest");
  check(buildServiceOwnerManifest().catalogComplete, "owners manifest");
  console.log("✓ service catalog manifests");
}

function testReport() {
  const incomplete = runServiceCatalog({
    deploymentId: DEPLOYMENT_ID,
    signals: { upstreamMonitoringClosed: false },
  });
  check(!incomplete.catalogReady, "incomplete upstream not ready");

  const ready = buildServiceCatalogReport({ deploymentId: DEPLOYMENT_ID });

  check(ready.version === V68_SERVICE_CATALOG_VERSION, "catalog version");
  check(ready.upstreamMonitoringClosed, "upstream monitoring closed");
  check(ready.definitions.catalogComplete, "definitions complete");
  check(ready.metadata.catalogComplete, "metadata complete");
  check(ready.statuses.catalogComplete, "statuses complete");
  check(ready.owners.catalogComplete, "owners complete");
  check(ready.catalogReady, "catalog ready");
  check(ready.readinessScore === 100, "readiness score 100");
  assertServiceCatalogPass(ready);

  check(
    V68_SERVICE_CATALOG_ARTIFACT_SURFACE.verifyCatalog.includes("verify:v68-p1"),
    "artifact surface verify script",
  );

  console.log("✓ service catalog report");
  console.log(formatServiceCatalogSummary(ready));
  console.log("\n✅ V68 P1 Service Catalog — verify PASS");
}

function main() {
  console.log("V68 P1 Service Catalog Verification\n");
  checkModuleStructure();
  testInventories();
  testCrossReferences();
  testManifests();
  testReport();
}

main();

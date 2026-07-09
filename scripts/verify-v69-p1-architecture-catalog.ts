/**
 * V69 P1 — Architecture Catalog Verification
 */
import fs from "node:fs";
import path from "node:path";

import {
  ARCHITECTURE_CATALOG_REGISTRY_INDEX,
  ARCHITECTURE_CATALOG_ROLLBACK_INDEX,
  ARCHITECTURE_DEFINITION_CATALOG,
  ARCHITECTURE_LAYER_CATALOG,
  ARCHITECTURE_OWNER_CATALOG,
  DEPENDENCY_ENTRY_CATALOG,
  V69_ARCHITECTURE_CATALOG_ARTIFACT_SURFACE,
  V69_ARCHITECTURE_CATALOG_FREEZE_LOCK,
  V69_ARCHITECTURE_CATALOG_VERSION,
  V69_UPSTREAM_FROZEN_TECHNICAL_GOVERNANCE_LOCK,
  architectureCatalogFreezeLockMatchesExpected,
  assertArchitectureCatalogPass,
  buildArchitectureCatalogRegistry,
  buildArchitectureCatalogReport,
  buildArchitectureCatalogRollbackIndex,
  buildArchitectureDefinitionManifest,
  buildArchitectureLayerManifest,
  buildArchitectureOwnerManifest,
  buildDependencyEntryManifest,
  formatArchitectureCatalogSummary,
  getArchitectureDefinitionById,
  getDefinitionsByLayerRef,
  getDependencyEntriesByArchitectureRef,
  getLayerById,
  getOwnerByArchitectureDefRef,
  isArchitectureCatalogCrossRefsAligned,
  isArchitectureCatalogFreezeLockIntact,
  isPlatformServiceRefsAligned,
  isRegistryIdKnown,
  isUpstreamFrozenTechnicalGovernanceLockIntact,
  runArchitectureCatalog,
} from "../lib/technical-governance/v69";

const ROOT = path.resolve(__dirname, "..");
const DEPLOYMENT_ID = "v69-p1-architecture-catalog";

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModuleStructure() {
  const required = [
    "lib/technical-governance/v69/index.ts",
    "lib/technical-governance/v69/architecture-catalog/architecture-catalog.ts",
    "lib/technical-governance/v69/architecture-catalog/catalog.types.ts",
    "lib/technical-governance/v69/architecture-catalog/catalog.constants.ts",
    "lib/technical-governance/v69/architecture-catalog/catalog.surface.ts",
    "lib/technical-governance/v69/architecture-catalog/catalog.builder.ts",
    "lib/technical-governance/v69/architecture-catalog/catalog.entry.ts",
    "lib/technical-governance/v69/architecture-catalog/catalog.registry.ts",
    "lib/technical-governance/v69/architecture-catalog/freeze.lock.ts",
    "lib/technical-governance/v69/architecture-catalog/rollback.index.ts",
    "lib/technical-governance/v69/architecture-catalog/architecture.definition.catalog.ts",
    "lib/technical-governance/v69/architecture-catalog/architecture.layer.catalog.ts",
    "lib/technical-governance/v69/architecture-catalog/architecture.owner.catalog.ts",
    "lib/technical-governance/v69/architecture-catalog/dependency.entry.catalog.ts",
    "lib/technical-governance/v69/architecture-catalog/alignment.catalog.ts",
    "docs/technical-governance/V69-ARCHITECTURE-CATALOG.md",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing module: ${rel}`);
  }
  console.log("✓ V69 architecture catalog module structure");
}

function testInventories() {
  check(ARCHITECTURE_DEFINITION_CATALOG.length >= 6, "architecture definition catalog");
  check(ARCHITECTURE_LAYER_CATALOG.length >= 6, "architecture layer catalog");
  check(ARCHITECTURE_OWNER_CATALOG.length >= 6, "architecture owner catalog");
  check(DEPENDENCY_ENTRY_CATALOG.length >= 6, "dependency entry catalog");
  check(isUpstreamFrozenTechnicalGovernanceLockIntact(), "upstream technical governance lock intact");
  check(isArchitectureCatalogFreezeLockIntact(), "freeze lock intact");
  check(architectureCatalogFreezeLockMatchesExpected(), "freeze lock matches expected");
  console.log("✓ definitions, layers, owners, dependency entries, freeze & upstream lock");
}

function testCrossReferences() {
  check(isPlatformServiceRefsAligned(), "V68 SVC-DEF refs aligned");
  check(isArchitectureCatalogCrossRefsAligned(), "full cross-ref alignment");

  const def001 = getArchitectureDefinitionById("ARC-DEF-001");
  check(def001?.platformServiceRef === "SVC-DEF-001", "ARC-DEF-001 platform service ref");

  const layer001 = getLayerById("ARC-LAY-001");
  check(layer001?.kind === "presentation", "ARC-LAY-001 presentation layer");

  const defsInLayer = getDefinitionsByLayerRef("ARC-LAY-004");
  check(defsInLayer.length >= 1, "integration layer definitions");

  const own001 = getOwnerByArchitectureDefRef("ARC-DEF-001");
  check(own001?.architectureDefRef === "ARC-DEF-001", "owner for ARC-DEF-001");

  const deps001 = getDependencyEntriesByArchitectureRef("ARC-DEF-006");
  check(deps001.length >= 1, "dependency entries for ARC-DEF-006");
  check(deps001[0]?.entryPath.includes("platform/v68"), "platform governance entry path");

  check(
    V69_UPSTREAM_FROZEN_TECHNICAL_GOVERNANCE_LOCK.v68PlatformSignoff.length > 0,
    "V68 signoff in upstream lock",
  );
  check(
    V69_ARCHITECTURE_CATALOG_FREEZE_LOCK.architectureCatalog === V69_ARCHITECTURE_CATALOG_VERSION,
    "freeze lock catalog version",
  );
  console.log("✓ cross-references & V68 upstream alignment");
}

function testRegistryAndRollback() {
  const registry = buildArchitectureCatalogRegistry();
  check(registry.registryComplete, "catalog registry complete");
  check(registry.totalEntries >= 24, "registry total entries");
  check(isRegistryIdKnown("definitions", "ARC-DEF-001"), "registry knows ARC-DEF-001");
  check(
    ARCHITECTURE_CATALOG_REGISTRY_INDEX.layers.length === ARCHITECTURE_LAYER_CATALOG.length,
    "registry layer index synced",
  );

  const rollback = buildArchitectureCatalogRollbackIndex();
  check(rollback.indexComplete, "rollback index complete");
  check(ARCHITECTURE_CATALOG_ROLLBACK_INDEX.length >= 4, "rollback entries");
  console.log("✓ catalog registry & rollback index");
}

function testManifests() {
  check(buildArchitectureDefinitionManifest().catalogComplete, "definitions manifest");
  check(buildArchitectureLayerManifest().catalogComplete, "layers manifest");
  check(buildArchitectureOwnerManifest().catalogComplete, "owners manifest");
  check(buildDependencyEntryManifest().catalogComplete, "dependency entries manifest");
  console.log("✓ architecture catalog manifests");
}

function testReport() {
  const incomplete = runArchitectureCatalog({
    deploymentId: DEPLOYMENT_ID,
    signals: { upstreamPlatformClosed: false },
  });
  check(!incomplete.catalogReady, "incomplete upstream not ready");

  const ready = buildArchitectureCatalogReport({ deploymentId: DEPLOYMENT_ID });

  check(ready.version === V69_ARCHITECTURE_CATALOG_VERSION, "catalog version");
  check(ready.upstreamPlatformClosed, "upstream platform closed");
  check(ready.definitions.catalogComplete, "definitions complete");
  check(ready.layers.catalogComplete, "layers complete");
  check(ready.owners.catalogComplete, "owners complete");
  check(ready.dependencyEntries.catalogComplete, "dependency entries complete");
  check(ready.registry.registryComplete, "registry complete");
  check(ready.catalogReady, "catalog ready");
  check(ready.readinessScore === 100, "readiness score 100");
  assertArchitectureCatalogPass(ready);

  check(
    V69_ARCHITECTURE_CATALOG_ARTIFACT_SURFACE.verifyCatalog.includes("verify:v69-p1"),
    "artifact surface verify script",
  );

  console.log("✓ architecture catalog report");
  console.log(formatArchitectureCatalogSummary(ready));
  console.log("\n✅ V69 P1 Architecture Catalog — verify PASS");
}

function main() {
  console.log("V69 P1 Architecture Catalog Verification\n");
  checkModuleStructure();
  testInventories();
  testCrossReferences();
  testRegistryAndRollback();
  testManifests();
  testReport();
}

main();

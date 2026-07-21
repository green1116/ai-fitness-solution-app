/**
 * E10-P6 — Platform Marketplace verification
 * Marketplace layer above E10-P5 Platform API Gateway
 */
import fs from "node:fs";
import path from "node:path";

import { E10_PLATFORM_ID } from "../lib/platform/e10/core/platform.constants";
import { buildPlatformFoundation } from "../lib/platform/e10/core/platform.lifecycle";
import {
  E10_EVENT_ID,
} from "../lib/platform/e10/event/event.constants";
import { clearEventBus } from "../lib/platform/e10/event/event.bus";
import { clearListeners } from "../lib/platform/e10/event/event.listener";
import { clearEventTypes } from "../lib/platform/e10/event/event.registry";
import {
  E10_GATEWAY_BASE,
  E10_GATEWAY_ID,
} from "../lib/platform/e10/gateway/gateway.constants";
import { clearMiddlewares } from "../lib/platform/e10/gateway/gateway.middleware";
import { clearRoutes } from "../lib/platform/e10/gateway/gateway.route";
import {
  CATALOG_ENTRY_KINDS,
  CATALOG_ENTRY_STATUSES,
  E10_MARKETPLACE_BASE,
  E10_MARKETPLACE_FREEZE_VERSION,
  E10_MARKETPLACE_ID,
  E10_MARKETPLACE_VERSION,
  INSTALL_STATUSES,
  MARKETPLACE_MANAGER_STATUSES,
  PACKAGE_STATUSES,
  PLUGIN_STATUSES,
} from "../lib/platform/e10/marketplace/marketplace.constants";
import { clearCatalog } from "../lib/platform/e10/marketplace/marketplace.catalog";
import {
  createMarketplaceManager,
  getMarketplaceRegistryManifest,
} from "../lib/platform/e10/marketplace/marketplace.manager";
import { clearPackages } from "../lib/platform/e10/marketplace/marketplace.package";
import { clearPlugins } from "../lib/platform/e10/marketplace/marketplace.plugin";
import {
  E10_RESOURCE_ID,
} from "../lib/platform/e10/resource/resource.constants";
import { clearAllocations } from "../lib/platform/e10/resource/resource.allocation";
import { clearPools } from "../lib/platform/e10/resource/resource.pool";
import { clearQuotas } from "../lib/platform/e10/resource/resource.quota";
import {
  E10_RUNTIME_ID,
} from "../lib/platform/e10/runtime/runtime.constants";
import { clearServices } from "../lib/platform/e10/runtime/runtime.registry";
import {
  assertE10P6ReleaseGatePass,
  checkE10P6ReleaseGate,
  E10_P6_MARKETPLACE_FREEZE_VERSION,
} from "../lib/platform/e10/signoff/marketplace.release.gate";

const ROOT = path.resolve(__dirname, "..");

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function cleanup() {
  clearCatalog();
  clearPlugins();
  clearPackages();
  clearRoutes();
  clearMiddlewares();
  clearEventBus();
  clearListeners();
  clearEventTypes();
  clearAllocations();
  clearQuotas();
  clearPools();
  clearServices();
}

function checkModules() {
  const required = [
    "lib/platform/e10/marketplace/marketplace.constants.ts",
    "lib/platform/e10/marketplace/marketplace.types.ts",
    "lib/platform/e10/marketplace/marketplace.catalog.ts",
    "lib/platform/e10/marketplace/marketplace.plugin.ts",
    "lib/platform/e10/marketplace/marketplace.package.ts",
    "lib/platform/e10/marketplace/marketplace.manager.ts",
    "lib/platform/e10/signoff/marketplace.release.gate.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }
  console.log("✓ module structure");
}

function checkConstants() {
  check(
    E10_MARKETPLACE_ID === "enterprise-e10-platform-marketplace-v1",
    "marketplace id",
  );
  check(E10_MARKETPLACE_VERSION === "e10-marketplace-1", "marketplace version");
  check(
    E10_MARKETPLACE_FREEZE_VERSION === "e10-marketplace-freeze-1",
    "marketplace freeze",
  );
  check(
    E10_MARKETPLACE_BASE === "enterprise-e10-p5-platform-gateway-v1",
    "marketplace base",
  );
  check(
    E10_P6_MARKETPLACE_FREEZE_VERSION ===
      "e10-p6-platform-marketplace-freeze-1",
    "p6 freeze version",
  );
  check(CATALOG_ENTRY_KINDS.length === 3, "catalog kinds");
  check(CATALOG_ENTRY_STATUSES.length === 3, "catalog statuses");
  check(PLUGIN_STATUSES.length === 4, "plugin statuses");
  check(PACKAGE_STATUSES.length === 4, "package statuses");
  check(INSTALL_STATUSES.length === 4, "install statuses");
  check(MARKETPLACE_MANAGER_STATUSES.length === 4, "manager statuses");
  console.log("✓ version constants");
}

function checkUpstreamCompatible() {
  cleanup();
  const foundation = buildPlatformFoundation();
  check(foundation.ready === true, "P1 foundation still ready");
  check(foundation.platformId === E10_PLATFORM_ID, "P1 platform id");
  check(E10_RUNTIME_ID === "enterprise-e10-platform-runtime-v1", "P2 runtime id");
  check(E10_RESOURCE_ID === "enterprise-e10-platform-resource-v1", "P3 resource id");
  check(E10_EVENT_ID === "enterprise-e10-platform-event-v1", "P4 event id");
  check(E10_GATEWAY_ID === "enterprise-e10-platform-gateway-v1", "P5 gateway id");
  check(
    E10_GATEWAY_BASE === "enterprise-e10-p4-platform-event-v1",
    "P5 base intact",
  );
  console.log("✓ P1/P2/P3/P4/P5 compatibility");
}

function testMarketplaceStack() {
  cleanup();

  const manager = createMarketplaceManager({ managerId: "e10-p6-verify" });
  check(manager.initialize().status === "READY", "manager ready");
  check(manager.start().status === "RUNNING", "manager running");

  const pluginCatalog = manager.registerCatalogEntry({
    id: "e10.verify.plugin.cat",
    name: "Verify Plugin",
    kind: "PLUGIN",
    version: "1.0.0",
    description: "Analytics plugin for verification",
    tags: ["analytics", "verify"],
  });
  const pkgCatalog = manager.registerCatalogEntry({
    id: "e10.verify.pkg.cat",
    name: "Verify Package",
    kind: "PACKAGE",
    version: "2.0.0",
    description: "Data package for verification",
    tags: ["data", "verify"],
  });
  check(pluginCatalog.status === "LISTED", "catalog listed");

  const plugin = manager.registerPlugin({
    id: "e10.verify.plugin",
    name: "Verify Plugin",
    catalogId: pluginCatalog.id,
    version: "1.0.0",
    entryPoint: "verify/plugin",
  });
  check(plugin.status === "REGISTERED", "plugin registered");
  manager.enablePlugin(plugin.id);
  check(manager.getPlugin(plugin.id)?.status === "ENABLED", "plugin enabled");

  const pkg = manager.registerPackage({
    id: "e10.verify.package",
    name: "Verify Package",
    catalogId: pkgCatalog.id,
    version: "2.0.0",
    artifactRef: "pkg://verify/2.0.0",
  });
  check(pkg.status === "AVAILABLE", "package available");

  const install = manager.installPackage({ packageId: pkg.id });
  check(install.status === "INSTALLED", "package installed");
  check(manager.getPackage(pkg.id)?.status === "INSTALLED", "pkg status installed");

  const uninstall = manager.uninstallPackage(pkg.id);
  check(uninstall.status === "UNINSTALLED", "package uninstalled");

  manager.disablePlugin(plugin.id);
  check(manager.getPlugin(plugin.id)?.status === "DISABLED", "plugin disabled");

  const search = manager.search({ query: "verify" });
  check(search.total >= 2, "search results");
  check(search.entries.some((e) => e.kind === "PLUGIN"), "search plugin");
  check(search.entries.some((e) => e.kind === "PACKAGE"), "search package");

  const manifest = getMarketplaceRegistryManifest();
  check(manifest.marketplaceId === E10_MARKETPLACE_ID, "manifest id");
  check(manifest.base === E10_MARKETPLACE_BASE, "manifest base");
  check(manifest.catalogCount === 2, "manifest catalog");

  manager.stop();
  check(manager.status().status === "STOPPED", "manager stopped");
  cleanup();
  console.log("✓ catalog / plugin / package / install / search / manager");
}

function testSignoff() {
  const gate = checkE10P6ReleaseGate();
  check(gate.result === "PASS", `gate pass: ${gate.summary}`);
  check(gate.failCount === 0, "gate failCount 0");
  assertE10P6ReleaseGatePass(gate);
  console.log("✓ marketplace release gate");
}

function main() {
  console.log("E10-P6 Platform Marketplace verify");
  checkModules();
  checkConstants();
  checkUpstreamCompatible();
  testMarketplaceStack();
  testSignoff();
  console.log("ALL PASS");
}

main();

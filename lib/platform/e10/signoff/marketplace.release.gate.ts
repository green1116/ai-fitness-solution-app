/**
 * E10-P6 — Marketplace Release Gate
 * Checks platform marketplace modules → PASS / FAIL
 */

import {
  E10_MARKETPLACE_BASE,
  E10_MARKETPLACE_ID,
  E10_MARKETPLACE_VERSION,
  CATALOG_ENTRY_KINDS,
  MARKETPLACE_MANAGER_STATUSES,
} from "../marketplace/marketplace.constants";
import { clearCatalog } from "../marketplace/marketplace.catalog";
import {
  createMarketplaceManager,
  getMarketplaceRegistryManifest,
} from "../marketplace/marketplace.manager";
import { clearPackages } from "../marketplace/marketplace.package";
import { clearPlugins } from "../marketplace/marketplace.plugin";
import { clearRoutes } from "../gateway/gateway.route";
import { clearMiddlewares } from "../gateway/gateway.middleware";
import { clearEventBus } from "../event/event.bus";
import { clearListeners } from "../event/event.listener";
import { clearEventTypes } from "../event/event.registry";
import { clearAllocations } from "../resource/resource.allocation";
import { clearPools } from "../resource/resource.pool";
import { clearQuotas } from "../resource/resource.quota";
import { clearServices } from "../runtime/runtime.registry";
import type {
  GateCheckItem,
  GateVerdict,
  ReleaseGateResult,
} from "./release.gate";

export type {
  GateCheckItem,
  GateVerdict,
  ReleaseGateResult,
};

export const E10_P6_SIGNOFF_VERSION = "e10-p6-signoff-1" as const;
export const E10_P6_MARKETPLACE_FREEZE_VERSION =
  "e10-p6-platform-marketplace-freeze-1" as const;

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

export function checkE10P6ReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];

  checks.push(
    check(
      "MK-P6-CONSTANTS",
      "marketplace",
      "Marketplace version constants",
      E10_MARKETPLACE_ID === "enterprise-e10-platform-marketplace-v1" &&
        E10_MARKETPLACE_VERSION === "e10-marketplace-1" &&
        E10_MARKETPLACE_BASE === "enterprise-e10-p5-platform-gateway-v1" &&
        CATALOG_ENTRY_KINDS.length === 3 &&
        MARKETPLACE_MANAGER_STATUSES.length === 4,
      `id=${E10_MARKETPLACE_ID} base=${E10_MARKETPLACE_BASE}`,
    ),
  );

  // Catalog / plugin / package / install / search
  try {
    cleanup();
    const manager = createMarketplaceManager({ managerId: "e10-p6-gate" });
    manager.initialize();
    manager.start();

    const catalog = manager.registerCatalogEntry({
      id: "e10.p6.gate.plugin",
      name: "Gate Plugin",
      kind: "PLUGIN",
      version: "1.0.0",
      description: "Gate test plugin",
      tags: ["gate", "test"],
    });
    const pkgCatalog = manager.registerCatalogEntry({
      id: "e10.p6.gate.package",
      name: "Gate Package",
      kind: "PACKAGE",
      version: "1.0.0",
      description: "Gate test package",
      tags: ["gate", "pkg"],
    });

    const plugin = manager.registerPlugin({
      id: "e10.p6.gate.plg",
      name: "Gate Plg",
      catalogId: catalog.id,
      version: "1.0.0",
      entryPoint: "gate/index",
    });
    const enabled = manager.enablePlugin(plugin.id);

    const pkg = manager.registerPackage({
      id: "e10.p6.gate.pkg",
      name: "Gate Pkg",
      catalogId: pkgCatalog.id,
      version: "1.0.0",
      artifactRef: "pkg://gate/1.0.0",
    });
    const install = manager.installPackage({ packageId: pkg.id });
    const uninstall = manager.uninstallPackage(pkg.id);

    const search = manager.search({ query: "gate" });
    const snap = manager.status();
    const manifest = getMarketplaceRegistryManifest();

    const ok =
      catalog.status === "LISTED" &&
      enabled.status === "ENABLED" &&
      install.status === "INSTALLED" &&
      uninstall.status === "UNINSTALLED" &&
      search.total >= 2 &&
      snap.status === "RUNNING" &&
      snap.catalogCount === 2 &&
      manifest.marketplaceId === E10_MARKETPLACE_ID &&
      manifest.base === E10_MARKETPLACE_BASE;

    checks.push(
      check(
        "MK-P6-MANAGER",
        "marketplace",
        "Catalog / plugin / package / install / search",
        ok,
        `search=${search.total} installed=${snap.installedCount} plugins=${snap.pluginCount}`,
      ),
    );

    // Disable plugin
    manager.disablePlugin(plugin.id);
    const disabled = manager.getPlugin(plugin.id);
    checks.push(
      check(
        "MK-P6-PLUGIN",
        "marketplace",
        "Plugin disable lifecycle",
        disabled?.status === "DISABLED",
        `status=${disabled?.status}`,
      ),
    );

    manager.stop();
    cleanup();
  } catch (error) {
    checks.push(
      check(
        "MK-P6-MANAGER",
        "marketplace",
        "Catalog / plugin / package / install / search",
        false,
        error instanceof Error ? error.message : "marketplace probe failed",
      ),
    );
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
      `e10-p6-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertE10P6ReleaseGatePass(
  gate: ReleaseGateResult = checkE10P6ReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(`E10-P6 release gate failed: ${gate.summary}`);
  }
}

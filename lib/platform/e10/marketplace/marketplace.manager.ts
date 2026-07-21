/**
 * E10-P6 — Marketplace Manager
 * Orchestrates catalog, plugins, packages, install/uninstall, search
 */

import {
  E10_MARKETPLACE_ID,
  E10_MARKETPLACE_VERSION,
} from "./marketplace.constants";
import {
  buildMarketplaceRegistryManifest,
  clearCatalog,
  getCatalogEntry,
  listCatalogEntries,
  registerCatalogEntry,
  removeCatalogEntry,
  searchCatalog,
  setCatalogEntryStatus,
} from "./marketplace.catalog";
import {
  clearPackages,
  countInstalled,
  getInstall,
  getPackage,
  installPackage,
  listInstalls,
  listPackages,
  registerPackage,
  removePackage,
  uninstallPackage,
} from "./marketplace.package";
import {
  clearPlugins,
  disablePlugin,
  enablePlugin,
  getPlugin,
  listPlugins,
  registerPlugin,
  removePlugin,
} from "./marketplace.plugin";
import type {
  CatalogEntry,
  CatalogEntryKind,
  CatalogEntryStatus,
  InstallPackageInput,
  InstallRecord,
  MarketplaceManagerStatus,
  PackageDefinition,
  PluginDefinition,
  RegisterCatalogEntryInput,
  RegisterPackageInput,
  RegisterPluginInput,
  SearchResult,
} from "./marketplace.types";

export type MarketplaceManagerSnapshot = {
  managerId: string;
  status: MarketplaceManagerStatus;
  layerId: typeof E10_MARKETPLACE_ID;
  version: typeof E10_MARKETPLACE_VERSION;
  catalogCount: number;
  pluginCount: number;
  packageCount: number;
  installedCount: number;
  startedAt?: string;
  stoppedAt?: string;
};

export type MarketplaceManager = {
  initialize: () => MarketplaceManagerSnapshot;
  start: () => MarketplaceManagerSnapshot;
  stop: () => MarketplaceManagerSnapshot;
  status: () => MarketplaceManagerSnapshot;
  registerCatalogEntry: (input: RegisterCatalogEntryInput) => CatalogEntry;
  getCatalogEntry: typeof getCatalogEntry;
  listCatalogEntries: typeof listCatalogEntries;
  setCatalogEntryStatus: (
    id: string,
    status: CatalogEntryStatus,
  ) => CatalogEntry;
  removeCatalogEntry: (id: string) => boolean;
  search: (input: {
    query: string;
    kind?: CatalogEntryKind;
    status?: CatalogEntryStatus;
  }) => SearchResult;
  registerPlugin: (input: RegisterPluginInput) => PluginDefinition;
  getPlugin: typeof getPlugin;
  listPlugins: typeof listPlugins;
  enablePlugin: (id: string) => PluginDefinition;
  disablePlugin: (id: string) => PluginDefinition;
  removePlugin: (id: string) => boolean;
  registerPackage: (input: RegisterPackageInput) => PackageDefinition;
  getPackage: typeof getPackage;
  listPackages: typeof listPackages;
  installPackage: (input: InstallPackageInput) => InstallRecord;
  uninstallPackage: (packageId: string) => InstallRecord;
  getInstall: typeof getInstall;
  listInstalls: typeof listInstalls;
  removePackage: (id: string) => boolean;
};

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

export function createMarketplaceManager(options?: {
  managerId?: string;
}): MarketplaceManager {
  const managerId =
    options?.managerId?.trim() || createId("e10-mkt-mgr");
  let state: MarketplaceManagerStatus = "IDLE";
  let startedAt: string | undefined;
  let stoppedAt: string | undefined;

  function snapshot(): MarketplaceManagerSnapshot {
    return {
      managerId,
      status: state,
      layerId: E10_MARKETPLACE_ID,
      version: E10_MARKETPLACE_VERSION,
      catalogCount: listCatalogEntries().length,
      pluginCount: listPlugins().length,
      packageCount: listPackages().length,
      installedCount: countInstalled(),
      startedAt,
      stoppedAt,
    };
  }

  function assertRunning(op: string): void {
    if (state !== "RUNNING") {
      throw new Error(`${op} requires RUNNING (current=${state})`);
    }
  }

  function initialize(): MarketplaceManagerSnapshot {
    if (state !== "IDLE" && state !== "STOPPED") {
      throw new Error(
        `initialize requires IDLE or STOPPED (current=${state})`,
      );
    }
    clearCatalog();
    clearPlugins();
    clearPackages();
    startedAt = undefined;
    stoppedAt = undefined;
    state = "READY";
    return snapshot();
  }

  function start(): MarketplaceManagerSnapshot {
    if (state !== "READY" && state !== "STOPPED") {
      throw new Error(
        `start requires READY or STOPPED (current=${state})`,
      );
    }
    state = "RUNNING";
    startedAt = nowIso();
    stoppedAt = undefined;
    return snapshot();
  }

  function stop(): MarketplaceManagerSnapshot {
    if (state !== "RUNNING") {
      throw new Error(`stop requires RUNNING (current=${state})`);
    }
    for (const plugin of listPlugins({ status: "ENABLED" })) {
      disablePlugin(plugin.id);
    }
    state = "STOPPED";
    stoppedAt = nowIso();
    return snapshot();
  }

  return {
    initialize,
    start,
    stop,
    status: snapshot,
    registerCatalogEntry: (input) => {
      assertRunning("registerCatalogEntry");
      return registerCatalogEntry(input);
    },
    getCatalogEntry,
    listCatalogEntries,
    setCatalogEntryStatus: (id, status) => {
      assertRunning("setCatalogEntryStatus");
      return setCatalogEntryStatus(id, status);
    },
    removeCatalogEntry: (id) => {
      assertRunning("removeCatalogEntry");
      return removeCatalogEntry(id);
    },
    search: (input) => {
      assertRunning("search");
      return searchCatalog(input);
    },
    registerPlugin: (input) => {
      assertRunning("registerPlugin");
      return registerPlugin(input);
    },
    getPlugin,
    listPlugins,
    enablePlugin: (id) => {
      assertRunning("enablePlugin");
      return enablePlugin(id);
    },
    disablePlugin: (id) => {
      assertRunning("disablePlugin");
      return disablePlugin(id);
    },
    removePlugin: (id) => {
      assertRunning("removePlugin");
      return removePlugin(id);
    },
    registerPackage: (input) => {
      assertRunning("registerPackage");
      return registerPackage(input);
    },
    getPackage,
    listPackages,
    installPackage: (input) => {
      assertRunning("installPackage");
      return installPackage(input);
    },
    uninstallPackage: (packageId) => {
      assertRunning("uninstallPackage");
      return uninstallPackage(packageId);
    },
    getInstall,
    listInstalls,
    removePackage: (id) => {
      assertRunning("removePackage");
      return removePackage(id);
    },
  };
}

export function getMarketplaceRegistryManifest() {
  return buildMarketplaceRegistryManifest({
    pluginCount: listPlugins().length,
    packageCount: listPackages().length,
    installedCount: countInstalled(),
  });
}

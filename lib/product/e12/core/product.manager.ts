/**
 * E12-P1 — Product Foundation Manager
 */

import { seedProductFeatureCatalog } from "../catalog/product.feature.catalog";
import {
  E12_PRODUCT_ID,
  E12_PRODUCT_VERSION,
} from "../core/product.constants";
import { createProductEdition } from "../edition/product.edition";
import { registerProductIdentity } from "../identity/product.identity";
import { buildProductFoundation } from "../manifest/product.manifest";
import { createCapabilityPackage } from "../packaging/product.capability.package";
import {
  clearProductRegistry,
  getProductRegistryManifest,
} from "../registry/product.registry";
import type {
  CapabilityPackage,
  CreateCapabilityPackageInput,
  CreateProductEditionInput,
  ProductEdition,
  ProductFoundationManifest,
  ProductIdentity,
  ProductManagerStatus,
  ProductRegistryManifest,
  RegisterProductIdentityInput,
} from "../types/product.types";

export type ProductManagerSnapshot = {
  managerId: string;
  status: ProductManagerStatus;
  layerId: typeof E12_PRODUCT_ID;
  version: typeof E12_PRODUCT_VERSION;
  identityCount: number;
  editionCount: number;
  featureCount: number;
  packageCount: number;
  startedAt?: string;
  stoppedAt?: string;
};

export type ProductFoundationManager = {
  initialize: () => ProductManagerSnapshot;
  start: () => ProductManagerSnapshot;
  stop: () => ProductManagerSnapshot;
  status: () => ProductManagerSnapshot;
  registerIdentity: (input: RegisterProductIdentityInput) => ProductIdentity;
  createEdition: (input: CreateProductEditionInput) => ProductEdition;
  createPackage: (input: CreateCapabilityPackageInput) => CapabilityPackage;
  seedCatalog: () => number;
  foundation: () => ProductFoundationManifest;
  manifest: () => ProductRegistryManifest;
};

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

export function createProductFoundationManager(options?: {
  managerId?: string;
}): ProductFoundationManager {
  const managerId =
    options?.managerId?.trim() || createId("e12-prod-mgr");
  let state: ProductManagerStatus = "IDLE";
  let startedAt: string | undefined;
  let stoppedAt: string | undefined;

  function snapshot(): ProductManagerSnapshot {
    const reg = getProductRegistryManifest();
    return {
      managerId,
      status: state,
      layerId: E12_PRODUCT_ID,
      version: E12_PRODUCT_VERSION,
      identityCount: reg.identityCount,
      editionCount: reg.editionCount,
      featureCount: reg.featureCount,
      packageCount: reg.packageCount,
      startedAt,
      stoppedAt,
    };
  }

  function assertRunning(op: string): void {
    if (state !== "RUNNING") {
      throw new Error(`${op} requires RUNNING (current=${state})`);
    }
  }

  function initialize(): ProductManagerSnapshot {
    if (state !== "IDLE" && state !== "STOPPED") {
      throw new Error(
        `initialize requires IDLE or STOPPED (current=${state})`,
      );
    }
    clearProductRegistry();
    startedAt = undefined;
    stoppedAt = undefined;
    state = "READY";
    return snapshot();
  }

  function start(): ProductManagerSnapshot {
    if (state !== "READY" && state !== "STOPPED") {
      throw new Error(`start requires READY or STOPPED (current=${state})`);
    }
    state = "RUNNING";
    startedAt = nowIso();
    stoppedAt = undefined;
    return snapshot();
  }

  function stop(): ProductManagerSnapshot {
    if (state !== "RUNNING") {
      throw new Error(`stop requires RUNNING (current=${state})`);
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
    registerIdentity: (input) => {
      assertRunning("registerIdentity");
      return registerProductIdentity(input);
    },
    createEdition: (input) => {
      assertRunning("createEdition");
      return createProductEdition(input);
    },
    createPackage: (input) => {
      assertRunning("createPackage");
      return createCapabilityPackage(input);
    },
    seedCatalog: () => {
      assertRunning("seedCatalog");
      return seedProductFeatureCatalog().length;
    },
    foundation: () => {
      assertRunning("foundation");
      return buildProductFoundation();
    },
    manifest: getProductRegistryManifest,
  };
}

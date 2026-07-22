/**
 * Commercialization P2 — Product Packaging Foundation Manager
 */

import {
  clearDeliveryModels,
  defineDeliveryModel,
  getDeliveryModel,
  listDeliveryModels,
} from "./delivery/delivery.model";
import {
  clearDeliveryScopes,
  defineDeliveryScope,
  getDeliveryScope,
  listDeliveryScopes,
} from "./delivery/delivery.scope";
import {
  clearPackageCompositions,
  composePackage,
  getPackageComposition,
  listPackageCompositions,
} from "./package/package.composer";
import {
  clearProductPackages,
  getProductPackage,
  listProductPackages,
  publishPackage,
  registerPackage,
} from "./package/package.registry";
import {
  clearProductCatalog,
  catalogProduct,
  getProductCatalogEntry,
  listProductCatalog,
} from "./product/product.catalog";
import {
  activateProduct,
  clearCommercialProducts,
  getCommercialProduct,
  listCommercialProducts,
  registerProduct,
} from "./product/product.registry";
import {
  COMMERCIALIZATION_PRODUCT_PACKAGING_BASE,
  COMMERCIALIZATION_PRODUCT_PACKAGING_FREEZE_VERSION,
  COMMERCIALIZATION_PRODUCT_PACKAGING_ID,
  COMMERCIALIZATION_PRODUCT_PACKAGING_VERSION,
} from "./tier/tier.constants";
import { buildTierMatrix, getTierEntitlement } from "./tier/tier.matrix";
import {
  assertPackagingFoundationReadinessReady,
  evaluatePackagingFoundationReadiness,
} from "./packaging.readiness";
import type {
  PackagingManagerStatus,
  PackagingReadinessResult,
  PackagingRegistryManifest,
} from "./packaging.types";
import type {
  CatalogProductInput,
  CommercialProduct,
  ProductCatalogEntry,
  RegisterProductInput,
} from "./product/product.types";
import type {
  ComposePackageInput,
  PackageComposition,
  ProductPackage,
  RegisterPackageInput,
} from "./package/package.types";
import type {
  DefineDeliveryModelInput,
  DefineDeliveryScopeInput,
  DeliveryModelProfile,
  DeliveryScopeProfile,
} from "./delivery/delivery.types";
import type { TierEntitlement } from "./tier/tier.matrix";
import type { TierLevel } from "./package/package.types";

export type PackagingFoundationManagerSnapshot = {
  managerId: string;
  status: PackagingManagerStatus;
  layerId: typeof COMMERCIALIZATION_PRODUCT_PACKAGING_ID;
  version: typeof COMMERCIALIZATION_PRODUCT_PACKAGING_VERSION;
  productCount: number;
  catalogCount: number;
  packageCount: number;
  compositionCount: number;
  scopeCount: number;
  modelCount: number;
  startedAt?: string;
  stoppedAt?: string;
};

export type PackagingFoundationManager = {
  initialize: () => PackagingFoundationManagerSnapshot;
  start: () => PackagingFoundationManagerSnapshot;
  stop: () => PackagingFoundationManagerSnapshot;
  status: () => PackagingFoundationManagerSnapshot;
  registerProduct: (input: RegisterProductInput) => CommercialProduct;
  activateProduct: (id: string) => CommercialProduct;
  getProduct: typeof getCommercialProduct;
  listProducts: typeof listCommercialProducts;
  catalogProduct: (input: CatalogProductInput) => ProductCatalogEntry;
  getCatalogEntry: typeof getProductCatalogEntry;
  listCatalog: typeof listProductCatalog;
  registerPackage: (input: RegisterPackageInput) => ProductPackage;
  composePackage: (input: ComposePackageInput) => PackageComposition;
  publishPackage: (id: string) => ProductPackage;
  getPackage: typeof getProductPackage;
  listPackages: typeof listProductPackages;
  getComposition: typeof getPackageComposition;
  listCompositions: typeof listPackageCompositions;
  getTier: (tier: TierLevel) => TierEntitlement;
  listTiers: () => TierEntitlement[];
  defineScope: (input: DefineDeliveryScopeInput) => DeliveryScopeProfile;
  getScope: typeof getDeliveryScope;
  listScopes: typeof listDeliveryScopes;
  defineModel: (input: DefineDeliveryModelInput) => DeliveryModelProfile;
  getModel: typeof getDeliveryModel;
  listModels: typeof listDeliveryModels;
  evaluateReadiness: () => PackagingReadinessResult;
  manifest: () => PackagingRegistryManifest;
};

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

export function getPackagingRegistryManifest(): PackagingRegistryManifest {
  return {
    foundationId: COMMERCIALIZATION_PRODUCT_PACKAGING_ID,
    version: COMMERCIALIZATION_PRODUCT_PACKAGING_VERSION,
    freezeVersion: COMMERCIALIZATION_PRODUCT_PACKAGING_FREEZE_VERSION,
    base: COMMERCIALIZATION_PRODUCT_PACKAGING_BASE,
    productCount: listCommercialProducts().length,
    catalogCount: listProductCatalog().length,
    packageCount: listProductPackages().length,
    compositionCount: listPackageCompositions().length,
    scopeCount: listDeliveryScopes().length,
    modelCount: listDeliveryModels().length,
  };
}

export function clearPackagingFoundationLayer(): void {
  clearDeliveryModels();
  clearDeliveryScopes();
  clearPackageCompositions();
  clearProductPackages();
  clearProductCatalog();
  clearCommercialProducts();
}

export function createPackagingFoundationManager(options?: {
  managerId?: string;
}): PackagingFoundationManager {
  const managerId =
    options?.managerId?.trim() || createId("comm-p2-pkg-mgr");
  let state: PackagingManagerStatus = "IDLE";
  let startedAt: string | undefined;
  let stoppedAt: string | undefined;

  function snapshot(): PackagingFoundationManagerSnapshot {
    const reg = getPackagingRegistryManifest();
    return {
      managerId,
      status: state,
      layerId: COMMERCIALIZATION_PRODUCT_PACKAGING_ID,
      version: COMMERCIALIZATION_PRODUCT_PACKAGING_VERSION,
      productCount: reg.productCount,
      catalogCount: reg.catalogCount,
      packageCount: reg.packageCount,
      compositionCount: reg.compositionCount,
      scopeCount: reg.scopeCount,
      modelCount: reg.modelCount,
      startedAt,
      stoppedAt,
    };
  }

  function assertRunning(op: string): void {
    if (state !== "RUNNING") {
      throw new Error(`${op} requires RUNNING (current=${state})`);
    }
  }

  function initialize(): PackagingFoundationManagerSnapshot {
    if (state !== "IDLE" && state !== "STOPPED") {
      throw new Error(
        `initialize requires IDLE or STOPPED (current=${state})`,
      );
    }
    clearPackagingFoundationLayer();
    startedAt = undefined;
    stoppedAt = undefined;
    state = "READY";
    return snapshot();
  }

  function start(): PackagingFoundationManagerSnapshot {
    if (state !== "READY" && state !== "STOPPED") {
      throw new Error(`start requires READY or STOPPED (current=${state})`);
    }
    state = "RUNNING";
    startedAt = nowIso();
    stoppedAt = undefined;
    return snapshot();
  }

  function stop(): PackagingFoundationManagerSnapshot {
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
    registerProduct: (input) => {
      assertRunning("registerProduct");
      return registerProduct(input);
    },
    activateProduct: (id) => {
      assertRunning("activateProduct");
      return activateProduct(id);
    },
    getProduct: getCommercialProduct,
    listProducts: listCommercialProducts,
    catalogProduct: (input) => {
      assertRunning("catalogProduct");
      return catalogProduct(input);
    },
    getCatalogEntry: getProductCatalogEntry,
    listCatalog: listProductCatalog,
    registerPackage: (input) => {
      assertRunning("registerPackage");
      return registerPackage(input);
    },
    composePackage: (input) => {
      assertRunning("composePackage");
      return composePackage(input);
    },
    publishPackage: (id) => {
      assertRunning("publishPackage");
      return publishPackage(id);
    },
    getPackage: getProductPackage,
    listPackages: listProductPackages,
    getComposition: getPackageComposition,
    listCompositions: listPackageCompositions,
    getTier: getTierEntitlement,
    listTiers: buildTierMatrix,
    defineScope: (input) => {
      assertRunning("defineScope");
      return defineDeliveryScope(input);
    },
    getScope: getDeliveryScope,
    listScopes: listDeliveryScopes,
    defineModel: (input) => {
      assertRunning("defineModel");
      return defineDeliveryModel(input);
    },
    getModel: getDeliveryModel,
    listModels: listDeliveryModels,
    evaluateReadiness: () => {
      assertRunning("evaluateReadiness");
      return evaluatePackagingFoundationReadiness();
    },
    manifest: getPackagingRegistryManifest,
  };
}

export { assertPackagingFoundationReadinessReady };

/**
 * Product Pricing — Pricing Management Manager
 */

import {
  archiveCatalog,
  clearCatalogs,
  createCatalog,
  getCatalog,
  listCatalogs,
  publishCatalog,
} from "./catalog/catalog.registry";
import type {
  ArchiveCatalogInput,
  CreateCatalogInput,
  PricingCatalog,
  PublishCatalogInput,
} from "./catalog/catalog.types";
import {
  clearDiscounts,
  getDiscount,
  listDiscounts,
  registerDiscount,
} from "./discount/discount.registry";
import type {
  PricingDiscount,
  RegisterDiscountInput,
} from "./discount/discount.types";
import {
  PRODUCT_PRICING_MANAGEMENT_BASE,
  PRODUCT_PRICING_MANAGEMENT_FREEZE_VERSION,
  PRODUCT_PRICING_MANAGEMENT_ID,
  PRODUCT_PRICING_MANAGEMENT_VERSION,
} from "./management/management.constants";
import {
  assertPricingManagementReadinessReady,
  evaluatePricingManagementReadiness,
} from "./management/management.readiness";
import type {
  PricingManagerStatus,
  PricingReadinessResult,
  PricingRegistryManifest,
} from "./management/management.types";
import {
  clearPrices,
  getPrice,
  listPrices,
  registerPrice,
} from "./price/price.registry";
import type { PlanPrice, RegisterPriceInput } from "./price/price.types";
import {
  acceptQuote,
  clearQuotes,
  createQuote,
  getQuote,
  listQuotes,
} from "./quote/quote.registry";
import type {
  AcceptQuoteInput,
  CreateQuoteInput,
  PricingQuote,
} from "./quote/quote.types";

export type PricingManagerSnapshot = {
  managerId: string;
  status: PricingManagerStatus;
  layerId: typeof PRODUCT_PRICING_MANAGEMENT_ID;
  version: typeof PRODUCT_PRICING_MANAGEMENT_VERSION;
  catalogCount: number;
  priceCount: number;
  discountCount: number;
  quoteCount: number;
  startedAt?: string;
  stoppedAt?: string;
};

export type PricingManager = {
  initialize: () => PricingManagerSnapshot;
  start: () => PricingManagerSnapshot;
  stop: () => PricingManagerSnapshot;
  status: () => PricingManagerSnapshot;
  createCatalog: (input: CreateCatalogInput) => PricingCatalog;
  publishCatalog: (input: PublishCatalogInput) => PricingCatalog;
  archiveCatalog: (input: ArchiveCatalogInput) => PricingCatalog;
  registerPrice: (input: RegisterPriceInput) => PlanPrice;
  registerDiscount: (input: RegisterDiscountInput) => PricingDiscount;
  createQuote: (input: CreateQuoteInput) => PricingQuote;
  acceptQuote: (input: AcceptQuoteInput) => PricingQuote;
  evaluateReadiness: () => PricingReadinessResult;
  manifest: () => PricingRegistryManifest;
};

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

export function getPricingRegistryManifest(): PricingRegistryManifest {
  return {
    foundationId: PRODUCT_PRICING_MANAGEMENT_ID,
    version: PRODUCT_PRICING_MANAGEMENT_VERSION,
    freezeVersion: PRODUCT_PRICING_MANAGEMENT_FREEZE_VERSION,
    base: PRODUCT_PRICING_MANAGEMENT_BASE,
    catalogCount: listCatalogs().length,
    priceCount: listPrices().length,
    discountCount: listDiscounts().length,
    quoteCount: listQuotes().length,
  };
}

export function clearPricingManagementLayer(): void {
  clearQuotes();
  clearDiscounts();
  clearPrices();
  clearCatalogs();
}

export function createPricingManager(options?: {
  managerId?: string;
}): PricingManager {
  const managerId =
    options?.managerId?.trim() || createId("prod-pri-mgr");
  let state: PricingManagerStatus = "IDLE";
  let startedAt: string | undefined;
  let stoppedAt: string | undefined;

  function snapshot(): PricingManagerSnapshot {
    const reg = getPricingRegistryManifest();
    return {
      managerId,
      status: state,
      layerId: PRODUCT_PRICING_MANAGEMENT_ID,
      version: PRODUCT_PRICING_MANAGEMENT_VERSION,
      catalogCount: reg.catalogCount,
      priceCount: reg.priceCount,
      discountCount: reg.discountCount,
      quoteCount: reg.quoteCount,
      startedAt,
      stoppedAt,
    };
  }

  function assertRunning(op: string): void {
    if (state !== "RUNNING") {
      throw new Error(`${op} requires RUNNING (current=${state})`);
    }
  }

  function initialize(): PricingManagerSnapshot {
    if (state !== "IDLE" && state !== "STOPPED") {
      throw new Error(
        `initialize requires IDLE or STOPPED (current=${state})`,
      );
    }
    clearPricingManagementLayer();
    startedAt = undefined;
    stoppedAt = undefined;
    state = "READY";
    return snapshot();
  }

  function start(): PricingManagerSnapshot {
    if (state !== "READY" && state !== "STOPPED") {
      throw new Error(`start requires READY or STOPPED (current=${state})`);
    }
    state = "RUNNING";
    startedAt = nowIso();
    stoppedAt = undefined;
    return snapshot();
  }

  function stop(): PricingManagerSnapshot {
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
    createCatalog: (input) => {
      assertRunning("createCatalog");
      return createCatalog(input);
    },
    publishCatalog: (input) => {
      assertRunning("publishCatalog");
      return publishCatalog(input);
    },
    archiveCatalog: (input) => {
      assertRunning("archiveCatalog");
      return archiveCatalog(input);
    },
    registerPrice: (input) => {
      assertRunning("registerPrice");
      return registerPrice(input);
    },
    registerDiscount: (input) => {
      assertRunning("registerDiscount");
      return registerDiscount(input);
    },
    createQuote: (input) => {
      assertRunning("createQuote");
      return createQuote(input);
    },
    acceptQuote: (input) => {
      assertRunning("acceptQuote");
      return acceptQuote(input);
    },
    evaluateReadiness: () => {
      assertRunning("evaluateReadiness");
      return evaluatePricingManagementReadiness();
    },
    manifest: getPricingRegistryManifest,
  };
}

export {
  assertPricingManagementReadinessReady,
  getCatalog,
  getDiscount,
  getPrice,
  getQuote,
  listCatalogs,
  listDiscounts,
  listPrices,
  listQuotes,
};

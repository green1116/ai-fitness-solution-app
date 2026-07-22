/**
 * Commercialization P1 — Sales Foundation Manager
 */

import {
  clearCustomerLifecycleRecords,
  getCustomerLifecycleRecord,
  listCustomerLifecycleRecords,
  transitionCustomerLifecycle,
} from "./customer/customer.lifecycle";
import {
  clearSalesCustomers,
  getSalesCustomer,
  listSalesCustomers,
  registerCustomer,
} from "./customer/customer.registry";
import {
  clearCommercialOffers,
  getCommercialOffer,
  listCommercialOffers,
  registerOffer,
} from "./offer/offer.catalog";
import {
  clearOfferPricing,
  createOfferPricing,
  getOfferPricing,
  listOfferPricing,
} from "./offer/offer.pricing";
import {
  COMMERCIALIZATION_SALES_FOUNDATION_BASE,
  COMMERCIALIZATION_SALES_FOUNDATION_FREEZE_VERSION,
  COMMERCIALIZATION_SALES_FOUNDATION_ID,
  COMMERCIALIZATION_SALES_FOUNDATION_VERSION,
} from "./sales/sales.constants";
import {
  clearSalesMetrics,
  computeSalesMetrics,
  getSalesMetrics,
  listSalesMetrics,
} from "./sales/sales.metrics";
import {
  advancePipeline,
  clearPipelineEntries,
  getPipelineEntry,
  listPipelineEntries,
} from "./sales/sales.pipeline";
import {
  clearOpportunities,
  getOpportunity,
  listOpportunities,
  registerOpportunity,
} from "./sales/sales.registry";
import {
  assertSalesFoundationReadinessReady,
  evaluateSalesFoundationReadiness,
} from "./sales.readiness";
import type {
  AdvancePipelineInput,
  ComputeSalesMetricsInput,
  PipelineEntry,
  RegisterOpportunityInput,
  SalesMetrics,
  SalesOpportunity,
  SalesManagerStatus,
  SalesReadinessResult,
  SalesRegistryManifest,
} from "./sales/sales.types";
import type {
  RegisterCustomerInput,
  SalesCustomer,
  TransitionCustomerLifecycleInput,
  CustomerLifecycleRecord,
} from "./customer/customer.types";
import type {
  CommercialOffer,
  CreateOfferPricingInput,
  OfferPricing,
  RegisterOfferInput,
} from "./offer/offer.types";

export type SalesFoundationManagerSnapshot = {
  managerId: string;
  status: SalesManagerStatus;
  layerId: typeof COMMERCIALIZATION_SALES_FOUNDATION_ID;
  version: typeof COMMERCIALIZATION_SALES_FOUNDATION_VERSION;
  opportunityCount: number;
  pipelineCount: number;
  metricsCount: number;
  customerCount: number;
  offerCount: number;
  pricingCount: number;
  startedAt?: string;
  stoppedAt?: string;
};

export type SalesFoundationManager = {
  initialize: () => SalesFoundationManagerSnapshot;
  start: () => SalesFoundationManagerSnapshot;
  stop: () => SalesFoundationManagerSnapshot;
  status: () => SalesFoundationManagerSnapshot;
  registerOffer: (input: RegisterOfferInput) => CommercialOffer;
  getOffer: typeof getCommercialOffer;
  listOffers: typeof listCommercialOffers;
  createPricing: (input: CreateOfferPricingInput) => OfferPricing;
  getPricing: typeof getOfferPricing;
  listPricing: typeof listOfferPricing;
  registerCustomer: (input: RegisterCustomerInput) => SalesCustomer;
  getCustomer: typeof getSalesCustomer;
  listCustomers: typeof listSalesCustomers;
  transitionLifecycle: (
    input: TransitionCustomerLifecycleInput,
  ) => CustomerLifecycleRecord;
  getLifecycle: typeof getCustomerLifecycleRecord;
  listLifecycles: typeof listCustomerLifecycleRecords;
  registerOpportunity: (input: RegisterOpportunityInput) => SalesOpportunity;
  getOpportunity: typeof getOpportunity;
  listOpportunities: typeof listOpportunities;
  advancePipeline: (input: AdvancePipelineInput) => PipelineEntry;
  getPipelineEntry: typeof getPipelineEntry;
  listPipeline: typeof listPipelineEntries;
  computeMetrics: (input?: ComputeSalesMetricsInput) => SalesMetrics;
  getMetrics: typeof getSalesMetrics;
  listMetrics: typeof listSalesMetrics;
  evaluateReadiness: () => SalesReadinessResult;
  manifest: () => SalesRegistryManifest;
};

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

export function getSalesRegistryManifest(): SalesRegistryManifest {
  return {
    foundationId: COMMERCIALIZATION_SALES_FOUNDATION_ID,
    version: COMMERCIALIZATION_SALES_FOUNDATION_VERSION,
    freezeVersion: COMMERCIALIZATION_SALES_FOUNDATION_FREEZE_VERSION,
    base: COMMERCIALIZATION_SALES_FOUNDATION_BASE,
    opportunityCount: listOpportunities().length,
    pipelineCount: listPipelineEntries().length,
    metricsCount: listSalesMetrics().length,
    customerCount: listSalesCustomers().length,
    offerCount: listCommercialOffers().length,
    pricingCount: listOfferPricing().length,
  };
}

export function clearSalesFoundationLayer(): void {
  clearSalesMetrics();
  clearPipelineEntries();
  clearOpportunities();
  clearCustomerLifecycleRecords();
  clearSalesCustomers();
  clearOfferPricing();
  clearCommercialOffers();
}

export function createSalesFoundationManager(options?: {
  managerId?: string;
}): SalesFoundationManager {
  const managerId =
    options?.managerId?.trim() || createId("comm-p1-sales-mgr");
  let state: SalesManagerStatus = "IDLE";
  let startedAt: string | undefined;
  let stoppedAt: string | undefined;

  function snapshot(): SalesFoundationManagerSnapshot {
    const reg = getSalesRegistryManifest();
    return {
      managerId,
      status: state,
      layerId: COMMERCIALIZATION_SALES_FOUNDATION_ID,
      version: COMMERCIALIZATION_SALES_FOUNDATION_VERSION,
      opportunityCount: reg.opportunityCount,
      pipelineCount: reg.pipelineCount,
      metricsCount: reg.metricsCount,
      customerCount: reg.customerCount,
      offerCount: reg.offerCount,
      pricingCount: reg.pricingCount,
      startedAt,
      stoppedAt,
    };
  }

  function assertRunning(op: string): void {
    if (state !== "RUNNING") {
      throw new Error(`${op} requires RUNNING (current=${state})`);
    }
  }

  function initialize(): SalesFoundationManagerSnapshot {
    if (state !== "IDLE" && state !== "STOPPED") {
      throw new Error(
        `initialize requires IDLE or STOPPED (current=${state})`,
      );
    }
    clearSalesFoundationLayer();
    startedAt = undefined;
    stoppedAt = undefined;
    state = "READY";
    return snapshot();
  }

  function start(): SalesFoundationManagerSnapshot {
    if (state !== "READY" && state !== "STOPPED") {
      throw new Error(`start requires READY or STOPPED (current=${state})`);
    }
    state = "RUNNING";
    startedAt = nowIso();
    stoppedAt = undefined;
    return snapshot();
  }

  function stop(): SalesFoundationManagerSnapshot {
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
    registerOffer: (input) => {
      assertRunning("registerOffer");
      return registerOffer(input);
    },
    getOffer: getCommercialOffer,
    listOffers: listCommercialOffers,
    createPricing: (input) => {
      assertRunning("createPricing");
      return createOfferPricing(input);
    },
    getPricing: getOfferPricing,
    listPricing: listOfferPricing,
    registerCustomer: (input) => {
      assertRunning("registerCustomer");
      return registerCustomer(input);
    },
    getCustomer: getSalesCustomer,
    listCustomers: listSalesCustomers,
    transitionLifecycle: (input) => {
      assertRunning("transitionLifecycle");
      return transitionCustomerLifecycle(input);
    },
    getLifecycle: getCustomerLifecycleRecord,
    listLifecycles: listCustomerLifecycleRecords,
    registerOpportunity: (input) => {
      assertRunning("registerOpportunity");
      return registerOpportunity(input);
    },
    getOpportunity,
    listOpportunities,
    advancePipeline: (input) => {
      assertRunning("advancePipeline");
      return advancePipeline(input);
    },
    getPipelineEntry,
    listPipeline: listPipelineEntries,
    computeMetrics: (input) => {
      assertRunning("computeMetrics");
      return computeSalesMetrics(input);
    },
    getMetrics: getSalesMetrics,
    listMetrics: listSalesMetrics,
    evaluateReadiness: () => {
      assertRunning("evaluateReadiness");
      return evaluateSalesFoundationReadiness();
    },
    manifest: getSalesRegistryManifest,
  };
}

export { assertSalesFoundationReadinessReady };

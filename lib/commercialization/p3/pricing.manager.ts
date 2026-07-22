/**
 * Commercialization P3 — Pricing & Contract Foundation Manager
 */

import {
  clearCommercialModels,
  defineCommercialModel,
  getCommercialModel,
  listCommercialModels,
} from "./commercial/commercial.model";
import {
  clearCommercialTerms,
  defineCommercialTerm,
  getCommercialTerm,
  listCommercialTerms,
} from "./commercial/commercial.terms";
import {
  clearContractLifecycleRecords,
  getContractLifecycleRecord,
  listContractLifecycleRecords,
  transitionContract,
} from "./contract/contract.lifecycle";
import {
  clearCommercialContracts,
  getCommercialContract,
  listCommercialContracts,
  registerContract,
} from "./contract/contract.registry";
import {
  clearPriceCalculations,
  calculatePrice,
  getPriceCalculation,
  listPriceCalculations,
} from "./pricing/pricing.calculator";
import {
  COMMERCIALIZATION_PRICING_CONTRACT_BASE,
  COMMERCIALIZATION_PRICING_CONTRACT_FREEZE_VERSION,
  COMMERCIALIZATION_PRICING_CONTRACT_ID,
  COMMERCIALIZATION_PRICING_CONTRACT_VERSION,
} from "./pricing/pricing.constants";
import {
  activatePriceBook,
  clearPriceBooks,
  getPriceBook,
  listPriceBooks,
  registerPriceBook,
} from "./pricing/pricing.registry";
import type {
  CalculatePriceInput,
  PriceBookEntry,
  PriceCalculation,
  PricingManagerStatus,
  PricingReadinessResult,
  PricingRegistryManifest,
  RegisterPriceBookInput,
} from "./pricing/pricing.types";
import {
  assertPricingContractReadinessReady,
  evaluatePricingContractReadiness,
} from "./pricing.readiness";
import {
  clearQuoteCompositions,
  composeQuote,
  getQuoteComposition,
  listQuoteCompositions,
} from "./quote/quote.composer";
import {
  acceptQuote,
  clearCommercialQuotes,
  getCommercialQuote,
  listCommercialQuotes,
  registerQuote,
} from "./quote/quote.registry";
import type {
  CommercialQuote,
  ComposeQuoteInput,
  QuoteComposition,
  RegisterQuoteInput,
} from "./quote/quote.types";
import type {
  CommercialContract,
  ContractLifecycleRecord,
  RegisterContractInput,
  TransitionContractInput,
} from "./contract/contract.types";
import type {
  CommercialModelProfile,
  CommercialTerm,
  DefineCommercialModelInput,
  DefineCommercialTermInput,
} from "./commercial/commercial.types";

export type PricingContractManagerSnapshot = {
  managerId: string;
  status: PricingManagerStatus;
  layerId: typeof COMMERCIALIZATION_PRICING_CONTRACT_ID;
  version: typeof COMMERCIALIZATION_PRICING_CONTRACT_VERSION;
  priceBookCount: number;
  calculationCount: number;
  quoteCount: number;
  compositionCount: number;
  contractCount: number;
  lifecycleCount: number;
  termsCount: number;
  modelCount: number;
  startedAt?: string;
  stoppedAt?: string;
};

export type PricingContractFoundationManager = {
  initialize: () => PricingContractManagerSnapshot;
  start: () => PricingContractManagerSnapshot;
  stop: () => PricingContractManagerSnapshot;
  status: () => PricingContractManagerSnapshot;
  registerPriceBook: (input: RegisterPriceBookInput) => PriceBookEntry;
  activatePriceBook: (id: string) => PriceBookEntry;
  getPriceBook: typeof getPriceBook;
  listPriceBooks: typeof listPriceBooks;
  calculatePrice: (input: CalculatePriceInput) => PriceCalculation;
  getCalculation: typeof getPriceCalculation;
  listCalculations: typeof listPriceCalculations;
  registerQuote: (input: RegisterQuoteInput) => CommercialQuote;
  composeQuote: (input: ComposeQuoteInput) => QuoteComposition;
  acceptQuote: (id: string) => CommercialQuote;
  getQuote: typeof getCommercialQuote;
  listQuotes: typeof listCommercialQuotes;
  getComposition: typeof getQuoteComposition;
  listCompositions: typeof listQuoteCompositions;
  defineTerm: (input: DefineCommercialTermInput) => CommercialTerm;
  getTerm: typeof getCommercialTerm;
  listTerms: typeof listCommercialTerms;
  defineModel: (input: DefineCommercialModelInput) => CommercialModelProfile;
  getModel: typeof getCommercialModel;
  listModels: typeof listCommercialModels;
  registerContract: (input: RegisterContractInput) => CommercialContract;
  transitionContract: (
    input: TransitionContractInput,
  ) => ContractLifecycleRecord;
  getContract: typeof getCommercialContract;
  listContracts: typeof listCommercialContracts;
  getLifecycle: typeof getContractLifecycleRecord;
  listLifecycles: typeof listContractLifecycleRecords;
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
    foundationId: COMMERCIALIZATION_PRICING_CONTRACT_ID,
    version: COMMERCIALIZATION_PRICING_CONTRACT_VERSION,
    freezeVersion: COMMERCIALIZATION_PRICING_CONTRACT_FREEZE_VERSION,
    base: COMMERCIALIZATION_PRICING_CONTRACT_BASE,
    priceBookCount: listPriceBooks().length,
    calculationCount: listPriceCalculations().length,
    quoteCount: listCommercialQuotes().length,
    compositionCount: listQuoteCompositions().length,
    contractCount: listCommercialContracts().length,
    lifecycleCount: listContractLifecycleRecords().length,
    termsCount: listCommercialTerms().length,
    modelCount: listCommercialModels().length,
  };
}

export function clearPricingContractLayer(): void {
  clearContractLifecycleRecords();
  clearCommercialContracts();
  clearQuoteCompositions();
  clearCommercialQuotes();
  clearPriceCalculations();
  clearPriceBooks();
  clearCommercialModels();
  clearCommercialTerms();
}

export function createPricingContractFoundationManager(options?: {
  managerId?: string;
}): PricingContractFoundationManager {
  const managerId =
    options?.managerId?.trim() || createId("comm-p3-price-mgr");
  let state: PricingManagerStatus = "IDLE";
  let startedAt: string | undefined;
  let stoppedAt: string | undefined;

  function snapshot(): PricingContractManagerSnapshot {
    const reg = getPricingRegistryManifest();
    return {
      managerId,
      status: state,
      layerId: COMMERCIALIZATION_PRICING_CONTRACT_ID,
      version: COMMERCIALIZATION_PRICING_CONTRACT_VERSION,
      priceBookCount: reg.priceBookCount,
      calculationCount: reg.calculationCount,
      quoteCount: reg.quoteCount,
      compositionCount: reg.compositionCount,
      contractCount: reg.contractCount,
      lifecycleCount: reg.lifecycleCount,
      termsCount: reg.termsCount,
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

  function initialize(): PricingContractManagerSnapshot {
    if (state !== "IDLE" && state !== "STOPPED") {
      throw new Error(
        `initialize requires IDLE or STOPPED (current=${state})`,
      );
    }
    clearPricingContractLayer();
    startedAt = undefined;
    stoppedAt = undefined;
    state = "READY";
    return snapshot();
  }

  function start(): PricingContractManagerSnapshot {
    if (state !== "READY" && state !== "STOPPED") {
      throw new Error(`start requires READY or STOPPED (current=${state})`);
    }
    state = "RUNNING";
    startedAt = nowIso();
    stoppedAt = undefined;
    return snapshot();
  }

  function stop(): PricingContractManagerSnapshot {
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
    registerPriceBook: (input) => {
      assertRunning("registerPriceBook");
      return registerPriceBook(input);
    },
    activatePriceBook: (id) => {
      assertRunning("activatePriceBook");
      return activatePriceBook(id);
    },
    getPriceBook,
    listPriceBooks,
    calculatePrice: (input) => {
      assertRunning("calculatePrice");
      return calculatePrice(input);
    },
    getCalculation: getPriceCalculation,
    listCalculations: listPriceCalculations,
    registerQuote: (input) => {
      assertRunning("registerQuote");
      return registerQuote(input);
    },
    composeQuote: (input) => {
      assertRunning("composeQuote");
      return composeQuote(input);
    },
    acceptQuote: (id) => {
      assertRunning("acceptQuote");
      return acceptQuote(id);
    },
    getQuote: getCommercialQuote,
    listQuotes: listCommercialQuotes,
    getComposition: getQuoteComposition,
    listCompositions: listQuoteCompositions,
    defineTerm: (input) => {
      assertRunning("defineTerm");
      return defineCommercialTerm(input);
    },
    getTerm: getCommercialTerm,
    listTerms: listCommercialTerms,
    defineModel: (input) => {
      assertRunning("defineModel");
      return defineCommercialModel(input);
    },
    getModel: getCommercialModel,
    listModels: listCommercialModels,
    registerContract: (input) => {
      assertRunning("registerContract");
      return registerContract(input);
    },
    transitionContract: (input) => {
      assertRunning("transitionContract");
      return transitionContract(input);
    },
    getContract: getCommercialContract,
    listContracts: listCommercialContracts,
    getLifecycle: getContractLifecycleRecord,
    listLifecycles: listContractLifecycleRecords,
    evaluateReadiness: () => {
      assertRunning("evaluateReadiness");
      return evaluatePricingContractReadiness();
    },
    manifest: getPricingRegistryManifest,
  };
}

export { assertPricingContractReadinessReady };

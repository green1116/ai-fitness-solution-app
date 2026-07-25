/**
 * Product Invoice — Invoice Engine Manager
 */

import {
  clearDocuments,
  createDocument,
  getDocument,
  issueDocument,
  listDocuments,
  voidDocument,
} from "./document/document.registry";
import type {
  CreateDocumentInput,
  InvoiceDocument,
  IssueDocumentInput,
  VoidDocumentInput,
} from "./document/document.types";
import {
  PRODUCT_INVOICE_ENGINE_BASE,
  PRODUCT_INVOICE_ENGINE_FREEZE_VERSION,
  PRODUCT_INVOICE_ENGINE_ID,
  PRODUCT_INVOICE_ENGINE_VERSION,
} from "./engine/engine.constants";
import {
  assertInvoiceEngineReadinessReady,
  evaluateInvoiceEngineReadiness,
} from "./engine/engine.readiness";
import type {
  InvoiceManagerStatus,
  InvoiceReadinessResult,
  InvoiceRegistryManifest,
} from "./engine/engine.types";
import {
  addLine,
  clearLines,
  getLine,
  listLines,
} from "./line/line.registry";
import type { AddLineInput, InvoiceLine } from "./line/line.types";
import {
  clearSettlements,
  getSettlement,
  listSettlements,
  settleDocument,
} from "./settlement/settlement.registry";
import type {
  InvoiceSettlement,
  SettleDocumentInput,
} from "./settlement/settlement.types";
import {
  applyTax,
  clearTaxes,
  getTax,
  listTaxes,
} from "./tax/tax.registry";
import type { ApplyTaxInput, InvoiceTax } from "./tax/tax.types";

export type InvoiceManagerSnapshot = {
  managerId: string;
  status: InvoiceManagerStatus;
  layerId: typeof PRODUCT_INVOICE_ENGINE_ID;
  version: typeof PRODUCT_INVOICE_ENGINE_VERSION;
  documentCount: number;
  lineCount: number;
  taxCount: number;
  settlementCount: number;
  startedAt?: string;
  stoppedAt?: string;
};

export type InvoiceManager = {
  initialize: () => InvoiceManagerSnapshot;
  start: () => InvoiceManagerSnapshot;
  stop: () => InvoiceManagerSnapshot;
  status: () => InvoiceManagerSnapshot;
  createDocument: (input: CreateDocumentInput) => InvoiceDocument;
  issueDocument: (input: IssueDocumentInput) => InvoiceDocument;
  voidDocument: (input: VoidDocumentInput) => InvoiceDocument;
  addLine: (input: AddLineInput) => InvoiceLine;
  applyTax: (input: ApplyTaxInput) => InvoiceTax;
  settleDocument: (input: SettleDocumentInput) => InvoiceSettlement;
  evaluateReadiness: () => InvoiceReadinessResult;
  manifest: () => InvoiceRegistryManifest;
};

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

export function getInvoiceRegistryManifest(): InvoiceRegistryManifest {
  return {
    foundationId: PRODUCT_INVOICE_ENGINE_ID,
    version: PRODUCT_INVOICE_ENGINE_VERSION,
    freezeVersion: PRODUCT_INVOICE_ENGINE_FREEZE_VERSION,
    base: PRODUCT_INVOICE_ENGINE_BASE,
    documentCount: listDocuments().length,
    lineCount: listLines().length,
    taxCount: listTaxes().length,
    settlementCount: listSettlements().length,
  };
}

export function clearInvoiceEngineLayer(): void {
  clearSettlements();
  clearTaxes();
  clearLines();
  clearDocuments();
}

export function createInvoiceManager(options?: {
  managerId?: string;
}): InvoiceManager {
  const managerId =
    options?.managerId?.trim() || createId("prod-inv-mgr");
  let state: InvoiceManagerStatus = "IDLE";
  let startedAt: string | undefined;
  let stoppedAt: string | undefined;

  function snapshot(): InvoiceManagerSnapshot {
    const reg = getInvoiceRegistryManifest();
    return {
      managerId,
      status: state,
      layerId: PRODUCT_INVOICE_ENGINE_ID,
      version: PRODUCT_INVOICE_ENGINE_VERSION,
      documentCount: reg.documentCount,
      lineCount: reg.lineCount,
      taxCount: reg.taxCount,
      settlementCount: reg.settlementCount,
      startedAt,
      stoppedAt,
    };
  }

  function assertRunning(op: string): void {
    if (state !== "RUNNING") {
      throw new Error(`${op} requires RUNNING (current=${state})`);
    }
  }

  function initialize(): InvoiceManagerSnapshot {
    if (state !== "IDLE" && state !== "STOPPED") {
      throw new Error(
        `initialize requires IDLE or STOPPED (current=${state})`,
      );
    }
    clearInvoiceEngineLayer();
    startedAt = undefined;
    stoppedAt = undefined;
    state = "READY";
    return snapshot();
  }

  function start(): InvoiceManagerSnapshot {
    if (state !== "READY" && state !== "STOPPED") {
      throw new Error(`start requires READY or STOPPED (current=${state})`);
    }
    state = "RUNNING";
    startedAt = nowIso();
    stoppedAt = undefined;
    return snapshot();
  }

  function stop(): InvoiceManagerSnapshot {
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
    createDocument: (input) => {
      assertRunning("createDocument");
      return createDocument(input);
    },
    issueDocument: (input) => {
      assertRunning("issueDocument");
      return issueDocument(input);
    },
    voidDocument: (input) => {
      assertRunning("voidDocument");
      return voidDocument(input);
    },
    addLine: (input) => {
      assertRunning("addLine");
      return addLine(input);
    },
    applyTax: (input) => {
      assertRunning("applyTax");
      return applyTax(input);
    },
    settleDocument: (input) => {
      assertRunning("settleDocument");
      return settleDocument(input);
    },
    evaluateReadiness: () => {
      assertRunning("evaluateReadiness");
      return evaluateInvoiceEngineReadiness();
    },
    manifest: getInvoiceRegistryManifest,
  };
}

export {
  assertInvoiceEngineReadinessReady,
  getDocument,
  getLine,
  getSettlement,
  getTax,
  listDocuments,
  listLines,
  listSettlements,
  listTaxes,
};

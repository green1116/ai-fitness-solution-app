/**
 * Product P8 — Tender Delivery Manager
 */

import {
  clearDeliveries,
  createDelivery,
  getDelivery,
  listDeliveries,
} from "./delivery/delivery.registry";
import type {
  CreateDeliveryInput,
  TenderDelivery,
} from "./delivery/delivery.types";
import {
  clearDocuments,
  createDocument,
  getDocument,
  listDocuments,
} from "./document/document.registry";
import type {
  CreateDocumentInput,
  TenderDocument,
} from "./document/document.types";
import {
  clearExports,
  createExport,
  getExport,
  listExports,
} from "./export/export.registry";
import type { CreateExportInput, TenderExport } from "./export/export.types";
import {
  clearHandovers,
  completeHandover,
  createHandover,
  getHandover,
  listHandovers,
} from "./handover/handover.registry";
import type {
  CompleteHandoverInput,
  CreateHandoverInput,
  TenderHandover,
} from "./handover/handover.types";
import {
  clearPackages,
  createPackage,
  getPackage,
  listPackages,
  sealPackage,
} from "./package/package.registry";
import type {
  CreatePackageInput,
  SealPackageInput,
  TenderPackage,
} from "./package/package.types";
import {
  acknowledgeSubmission,
  clearSubmissions,
  createSubmission,
  getSubmission,
  listSubmissions,
} from "./submission/submission.registry";
import type {
  AcknowledgeSubmissionInput,
  CreateSubmissionInput,
  TenderSubmission,
} from "./submission/submission.types";
import {
  PRODUCT_P8_TENDER_DELIVERY_BASE,
  PRODUCT_P8_TENDER_DELIVERY_FREEZE_VERSION,
  PRODUCT_P8_TENDER_DELIVERY_ID,
  PRODUCT_P8_TENDER_DELIVERY_VERSION,
} from "./tender/tender.constants";
import {
  assertP8TenderDeliveryReadinessReady,
  evaluateP8TenderDeliveryReadiness,
} from "./tender/tender.readiness";
import {
  clearTenders,
  createTender,
  getTender,
  listTenders,
  updateTenderStatus,
} from "./tender/tender.registry";
import type {
  CreateTenderInput,
  P8ManagerStatus,
  P8ReadinessResult,
  P8RegistryManifest,
  TenderCase,
  UpdateTenderStatusInput,
} from "./tender/tender.types";
import {
  clearTrackingEvents,
  getTrackingEvent,
  listTrackingEvents,
  recordTracking,
} from "./tracking/tracking.registry";
import type {
  RecordTrackingInput,
  TenderTrackingEvent,
} from "./tracking/tracking.types";

export type P8TenderManagerSnapshot = {
  managerId: string;
  status: P8ManagerStatus;
  layerId: typeof PRODUCT_P8_TENDER_DELIVERY_ID;
  version: typeof PRODUCT_P8_TENDER_DELIVERY_VERSION;
  tenderCount: number;
  documentCount: number;
  packageCount: number;
  submissionCount: number;
  startedAt?: string;
  stoppedAt?: string;
};

export type P8TenderManager = {
  initialize: () => P8TenderManagerSnapshot;
  start: () => P8TenderManagerSnapshot;
  stop: () => P8TenderManagerSnapshot;
  status: () => P8TenderManagerSnapshot;
  createTender: (input: CreateTenderInput) => TenderCase;
  updateTenderStatus: (input: UpdateTenderStatusInput) => TenderCase;
  createDelivery: (input: CreateDeliveryInput) => TenderDelivery;
  createDocument: (input: CreateDocumentInput) => TenderDocument;
  createExport: (input: CreateExportInput) => TenderExport;
  createPackage: (input: CreatePackageInput) => TenderPackage;
  sealPackage: (input: SealPackageInput) => TenderPackage;
  createSubmission: (input: CreateSubmissionInput) => TenderSubmission;
  acknowledgeSubmission: (
    input: AcknowledgeSubmissionInput,
  ) => TenderSubmission;
  recordTracking: (input: RecordTrackingInput) => TenderTrackingEvent;
  createHandover: (input: CreateHandoverInput) => TenderHandover;
  completeHandover: (input: CompleteHandoverInput) => TenderHandover;
  evaluateReadiness: () => P8ReadinessResult;
  manifest: () => P8RegistryManifest;
};

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

export function getP8RegistryManifest(): P8RegistryManifest {
  return {
    foundationId: PRODUCT_P8_TENDER_DELIVERY_ID,
    version: PRODUCT_P8_TENDER_DELIVERY_VERSION,
    freezeVersion: PRODUCT_P8_TENDER_DELIVERY_FREEZE_VERSION,
    base: PRODUCT_P8_TENDER_DELIVERY_BASE,
    tenderCount: listTenders().length,
    deliveryCount: listDeliveries().length,
    documentCount: listDocuments().length,
    exportCount: listExports().length,
    packageCount: listPackages().length,
    submissionCount: listSubmissions().length,
    trackingCount: listTrackingEvents().length,
    handoverCount: listHandovers().length,
  };
}

export function clearP8TenderDeliveryLayer(): void {
  clearHandovers();
  clearTrackingEvents();
  clearSubmissions();
  clearPackages();
  clearExports();
  clearDocuments();
  clearDeliveries();
  clearTenders();
}

export function createP8TenderManager(options?: {
  managerId?: string;
}): P8TenderManager {
  const managerId =
    options?.managerId?.trim() || createId("prod-p8-tnd-mgr");
  let state: P8ManagerStatus = "IDLE";
  let startedAt: string | undefined;
  let stoppedAt: string | undefined;

  function snapshot(): P8TenderManagerSnapshot {
    const reg = getP8RegistryManifest();
    return {
      managerId,
      status: state,
      layerId: PRODUCT_P8_TENDER_DELIVERY_ID,
      version: PRODUCT_P8_TENDER_DELIVERY_VERSION,
      tenderCount: reg.tenderCount,
      documentCount: reg.documentCount,
      packageCount: reg.packageCount,
      submissionCount: reg.submissionCount,
      startedAt,
      stoppedAt,
    };
  }

  function assertRunning(op: string): void {
    if (state !== "RUNNING") {
      throw new Error(`${op} requires RUNNING (current=${state})`);
    }
  }

  function initialize(): P8TenderManagerSnapshot {
    if (state !== "IDLE" && state !== "STOPPED") {
      throw new Error(
        `initialize requires IDLE or STOPPED (current=${state})`,
      );
    }
    clearP8TenderDeliveryLayer();
    startedAt = undefined;
    stoppedAt = undefined;
    state = "READY";
    return snapshot();
  }

  function start(): P8TenderManagerSnapshot {
    if (state !== "READY" && state !== "STOPPED") {
      throw new Error(`start requires READY or STOPPED (current=${state})`);
    }
    state = "RUNNING";
    startedAt = nowIso();
    stoppedAt = undefined;
    return snapshot();
  }

  function stop(): P8TenderManagerSnapshot {
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
    createTender: (input) => {
      assertRunning("createTender");
      return createTender(input);
    },
    updateTenderStatus: (input) => {
      assertRunning("updateTenderStatus");
      return updateTenderStatus(input);
    },
    createDelivery: (input) => {
      assertRunning("createDelivery");
      return createDelivery(input);
    },
    createDocument: (input) => {
      assertRunning("createDocument");
      return createDocument(input);
    },
    createExport: (input) => {
      assertRunning("createExport");
      return createExport(input);
    },
    createPackage: (input) => {
      assertRunning("createPackage");
      return createPackage(input);
    },
    sealPackage: (input) => {
      assertRunning("sealPackage");
      return sealPackage(input);
    },
    createSubmission: (input) => {
      assertRunning("createSubmission");
      return createSubmission(input);
    },
    acknowledgeSubmission: (input) => {
      assertRunning("acknowledgeSubmission");
      return acknowledgeSubmission(input);
    },
    recordTracking: (input) => {
      assertRunning("recordTracking");
      return recordTracking(input);
    },
    createHandover: (input) => {
      assertRunning("createHandover");
      return createHandover(input);
    },
    completeHandover: (input) => {
      assertRunning("completeHandover");
      return completeHandover(input);
    },
    evaluateReadiness: () => {
      assertRunning("evaluateReadiness");
      return evaluateP8TenderDeliveryReadiness();
    },
    manifest: getP8RegistryManifest,
  };
}

export {
  assertP8TenderDeliveryReadinessReady,
  getDelivery,
  getDocument,
  getExport,
  getHandover,
  getPackage,
  getSubmission,
  getTender,
  getTrackingEvent,
  listDeliveries,
  listDocuments,
  listExports,
  listHandovers,
  listPackages,
  listSubmissions,
  listTenders,
  listTrackingEvents,
};

/**
 * Product P8 — Tender Delivery public exports
 * Isolated namespace: lib/product/p8
 */

export {
  DELIVERY_CHANNELS,
  DOCUMENT_KINDS,
  EXPORT_FORMATS,
  HANDOVER_STATUSES,
  P8_MANAGER_STATUSES,
  P8_READINESS_VERDICTS,
  PACKAGE_STATUSES,
  PRODUCT_P8_TENDER_DELIVERY_BASE,
  PRODUCT_P8_TENDER_DELIVERY_FREEZE_VERSION,
  PRODUCT_P8_TENDER_DELIVERY_ID,
  PRODUCT_P8_TENDER_DELIVERY_VERSION,
  PRODUCT_P8_TENDER_FREEZE_VERSION,
  SUBMISSION_STATUSES,
  TENDER_STATUSES,
  TRACKING_EVENTS,
} from "./tender/tender.constants";

export type {
  CreateTenderInput,
  P8ManagerStatus,
  P8ReadinessCheck,
  P8ReadinessResult,
  P8ReadinessVerdict,
  P8RegistryManifest,
  TenderCase,
  TenderMetadata,
  TenderStatus,
  UpdateTenderStatusInput,
} from "./tender/tender.types";

export {
  clearTenders,
  createTender,
  getTender,
  listTenders,
  updateTenderStatus,
} from "./tender/tender.registry";

export type {
  CreateDeliveryInput,
  DeliveryChannel,
  DeliveryMetadata,
  TenderDelivery,
} from "./delivery/delivery.types";

export {
  clearDeliveries,
  createDelivery,
  getDelivery,
  listDeliveries,
} from "./delivery/delivery.registry";

export type {
  CreateDocumentInput,
  DocumentKind,
  DocumentMetadata,
  TenderDocument,
} from "./document/document.types";

export {
  clearDocuments,
  createDocument,
  getDocument,
  listDocuments,
} from "./document/document.registry";

export type {
  CreateExportInput,
  ExportFormat,
  ExportMetadata,
  TenderExport,
} from "./export/export.types";

export {
  clearExports,
  createExport,
  getExport,
  listExports,
} from "./export/export.registry";

export type {
  CreatePackageInput,
  PackageMetadata,
  PackageStatus,
  SealPackageInput,
  TenderPackage,
} from "./package/package.types";

export {
  clearPackages,
  createPackage,
  getPackage,
  listPackages,
  sealPackage,
} from "./package/package.registry";

export type {
  AcknowledgeSubmissionInput,
  CreateSubmissionInput,
  SubmissionMetadata,
  SubmissionStatus,
  TenderSubmission,
} from "./submission/submission.types";

export {
  acknowledgeSubmission,
  clearSubmissions,
  createSubmission,
  getSubmission,
  listSubmissions,
} from "./submission/submission.registry";

export type {
  RecordTrackingInput,
  TenderTrackingEvent,
  TrackingEventKind,
  TrackingMetadata,
} from "./tracking/tracking.types";

export {
  clearTrackingEvents,
  getTrackingEvent,
  listTrackingEvents,
  recordTracking,
} from "./tracking/tracking.registry";

export type {
  CompleteHandoverInput,
  CreateHandoverInput,
  HandoverMetadata,
  HandoverStatus,
  TenderHandover,
} from "./handover/handover.types";

export {
  clearHandovers,
  completeHandover,
  createHandover,
  getHandover,
  listHandovers,
} from "./handover/handover.registry";

export {
  assertP8TenderDeliveryReadinessReady,
  evaluateP8TenderDeliveryReadiness,
} from "./tender/tender.readiness";

export {
  clearP8TenderDeliveryLayer,
  createP8TenderManager,
  getP8RegistryManifest,
  type P8TenderManager,
  type P8TenderManagerSnapshot,
} from "./tender.manager";

export {
  assertProductP8ReleaseGatePass,
  checkProductP8ReleaseGate,
  PRODUCT_P8_SIGNOFF_VERSION,
  type GateCheckItem,
  type GateVerdict,
  type ReleaseGateResult,
} from "./verify/product.release.gate";

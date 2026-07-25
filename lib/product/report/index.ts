/**
 * Product Report — Report Engine public exports
 * Isolated namespace: lib/product/report
 */

export {
  DELIVERY_CHANNELS,
  PRODUCT_REPORT_ENGINE_BASE,
  PRODUCT_REPORT_ENGINE_FREEZE_VERSION,
  PRODUCT_REPORT_ENGINE_ID,
  PRODUCT_REPORT_ENGINE_VERSION,
  PRODUCT_REPORT_FREEZE_VERSION,
  REPORT_FORMATS,
  REPORT_JOB_STATUSES,
  REPORT_MANAGER_STATUSES,
  REPORT_READINESS_VERDICTS,
  REPORT_TEMPLATE_KINDS,
} from "./engine/engine.constants";

export type {
  ReportManagerStatus,
  ReportReadinessCheck,
  ReportReadinessResult,
  ReportReadinessVerdict,
  ReportRegistryManifest,
} from "./engine/engine.types";

export type {
  RegisterTemplateInput,
  ReportTemplate,
  ReportTemplateKind,
  TemplateMetadata,
} from "./template/template.types";

export {
  clearTemplates,
  getTemplate,
  listTemplates,
  registerTemplate,
} from "./template/template.registry";

export type {
  CompleteReportJobInput,
  JobMetadata,
  QueueReportJobInput,
  ReportFormat,
  ReportJob,
  ReportJobStatus,
} from "./job/job.types";

export {
  clearReportJobs,
  completeReportJob,
  getReportJob,
  listReportJobs,
  queueReportJob,
} from "./job/job.registry";

export type {
  RenderMetadata,
  RenderReportInput,
  ReportRender,
} from "./render/render.types";

export {
  clearRenders,
  getRender,
  listRenders,
  renderReport,
} from "./render/render.registry";

export type {
  DeliverReportInput,
  DeliveryChannel,
  DeliveryMetadata,
  ReportDelivery,
} from "./delivery/delivery.types";

export {
  clearDeliveries,
  deliverReport,
  getDelivery,
  listDeliveries,
} from "./delivery/delivery.registry";

export {
  assertReportEngineReadinessReady,
  evaluateReportEngineReadiness,
} from "./engine/engine.readiness";

export {
  clearReportEngineLayer,
  createReportManager,
  getReportRegistryManifest,
  type ReportManager,
  type ReportManagerSnapshot,
} from "./report.manager";

export {
  assertProductReportReleaseGatePass,
  checkProductReportReleaseGate,
  PRODUCT_REPORT_SIGNOFF_VERSION,
  type GateCheckItem,
  type GateVerdict,
  type ReleaseGateResult,
} from "./verify/product.release.gate";

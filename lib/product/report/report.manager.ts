/**
 * Product Report — Report Engine Manager
 */

import {
  clearDeliveries,
  deliverReport,
  getDelivery,
  listDeliveries,
} from "./delivery/delivery.registry";
import type {
  DeliverReportInput,
  ReportDelivery,
} from "./delivery/delivery.types";
import {
  PRODUCT_REPORT_ENGINE_BASE,
  PRODUCT_REPORT_ENGINE_FREEZE_VERSION,
  PRODUCT_REPORT_ENGINE_ID,
  PRODUCT_REPORT_ENGINE_VERSION,
} from "./engine/engine.constants";
import {
  assertReportEngineReadinessReady,
  evaluateReportEngineReadiness,
} from "./engine/engine.readiness";
import type {
  ReportManagerStatus,
  ReportReadinessResult,
  ReportRegistryManifest,
} from "./engine/engine.types";
import {
  clearReportJobs,
  completeReportJob,
  getReportJob,
  listReportJobs,
  queueReportJob,
} from "./job/job.registry";
import type {
  CompleteReportJobInput,
  QueueReportJobInput,
  ReportJob,
} from "./job/job.types";
import {
  clearRenders,
  getRender,
  listRenders,
  renderReport,
} from "./render/render.registry";
import type {
  RenderReportInput,
  ReportRender,
} from "./render/render.types";
import {
  clearTemplates,
  getTemplate,
  listTemplates,
  registerTemplate,
} from "./template/template.registry";
import type {
  RegisterTemplateInput,
  ReportTemplate,
} from "./template/template.types";

export type ReportManagerSnapshot = {
  managerId: string;
  status: ReportManagerStatus;
  layerId: typeof PRODUCT_REPORT_ENGINE_ID;
  version: typeof PRODUCT_REPORT_ENGINE_VERSION;
  templateCount: number;
  jobCount: number;
  renderCount: number;
  deliveryCount: number;
  startedAt?: string;
  stoppedAt?: string;
};

export type ReportManager = {
  initialize: () => ReportManagerSnapshot;
  start: () => ReportManagerSnapshot;
  stop: () => ReportManagerSnapshot;
  status: () => ReportManagerSnapshot;
  registerTemplate: (input: RegisterTemplateInput) => ReportTemplate;
  queueReportJob: (input: QueueReportJobInput) => ReportJob;
  completeReportJob: (input: CompleteReportJobInput) => ReportJob;
  renderReport: (input: RenderReportInput) => ReportRender;
  deliverReport: (input: DeliverReportInput) => ReportDelivery;
  evaluateReadiness: () => ReportReadinessResult;
  manifest: () => ReportRegistryManifest;
};

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

export function getReportRegistryManifest(): ReportRegistryManifest {
  return {
    engineId: PRODUCT_REPORT_ENGINE_ID,
    version: PRODUCT_REPORT_ENGINE_VERSION,
    freezeVersion: PRODUCT_REPORT_ENGINE_FREEZE_VERSION,
    base: PRODUCT_REPORT_ENGINE_BASE,
    templateCount: listTemplates().length,
    jobCount: listReportJobs().length,
    renderCount: listRenders().length,
    deliveryCount: listDeliveries().length,
  };
}

export function clearReportEngineLayer(): void {
  clearDeliveries();
  clearRenders();
  clearReportJobs();
  clearTemplates();
}

export function createReportManager(options?: {
  managerId?: string;
}): ReportManager {
  const managerId =
    options?.managerId?.trim() || createId("prod-rpt-mgr");
  let state: ReportManagerStatus = "IDLE";
  let startedAt: string | undefined;
  let stoppedAt: string | undefined;

  function snapshot(): ReportManagerSnapshot {
    const reg = getReportRegistryManifest();
    return {
      managerId,
      status: state,
      layerId: PRODUCT_REPORT_ENGINE_ID,
      version: PRODUCT_REPORT_ENGINE_VERSION,
      templateCount: reg.templateCount,
      jobCount: reg.jobCount,
      renderCount: reg.renderCount,
      deliveryCount: reg.deliveryCount,
      startedAt,
      stoppedAt,
    };
  }

  function assertRunning(op: string): void {
    if (state !== "RUNNING") {
      throw new Error(`${op} requires RUNNING (current=${state})`);
    }
  }

  function initialize(): ReportManagerSnapshot {
    if (state !== "IDLE" && state !== "STOPPED") {
      throw new Error(
        `initialize requires IDLE or STOPPED (current=${state})`,
      );
    }
    clearReportEngineLayer();
    startedAt = undefined;
    stoppedAt = undefined;
    state = "READY";
    return snapshot();
  }

  function start(): ReportManagerSnapshot {
    if (state !== "READY" && state !== "STOPPED") {
      throw new Error(`start requires READY or STOPPED (current=${state})`);
    }
    state = "RUNNING";
    startedAt = nowIso();
    stoppedAt = undefined;
    return snapshot();
  }

  function stop(): ReportManagerSnapshot {
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
    registerTemplate: (input) => {
      assertRunning("registerTemplate");
      return registerTemplate(input);
    },
    queueReportJob: (input) => {
      assertRunning("queueReportJob");
      return queueReportJob(input);
    },
    completeReportJob: (input) => {
      assertRunning("completeReportJob");
      return completeReportJob(input);
    },
    renderReport: (input) => {
      assertRunning("renderReport");
      return renderReport(input);
    },
    deliverReport: (input) => {
      assertRunning("deliverReport");
      return deliverReport(input);
    },
    evaluateReadiness: () => {
      assertRunning("evaluateReadiness");
      return evaluateReportEngineReadiness();
    },
    manifest: getReportRegistryManifest,
  };
}

export {
  assertReportEngineReadinessReady,
  getDelivery,
  getRender,
  getReportJob,
  getTemplate,
  listDeliveries,
  listRenders,
  listReportJobs,
  listTemplates,
};

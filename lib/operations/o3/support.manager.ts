/**
 * Operations O3 — Support Operations Manager
 */

import {
  clearKnowledgeArticles,
  getKnowledgeArticle,
  listKnowledgeArticles,
  publishKnowledgeArticle,
} from "./knowledge/knowledge.article";
import {
  clearKnowledgeIndex,
  getKnowledgeIndexEntry,
  indexKnowledgeArticle,
  listKnowledgeIndex,
} from "./knowledge/knowledge.index";
import type {
  IndexKnowledgeArticleInput,
  KnowledgeArticle,
  KnowledgeIndexEntry,
  PublishKnowledgeArticleInput,
} from "./knowledge/knowledge.types";
import {
  assertO3SupportOperationsReadinessReady,
  evaluateO3SupportOperationsReadiness,
} from "./resolution/resolution.readiness";
import {
  clearResolutionReports,
  generateResolutionReport,
  getResolutionReport,
  listResolutionReports,
} from "./resolution/resolution.report";
import {
  clearResolutions,
  getResolution,
  listResolutions,
  trackResolution,
} from "./resolution/resolution.tracking";
import type {
  GenerateResolutionReportInput,
  O3ManagerStatus,
  O3ReadinessResult,
  O3RegistryManifest,
  ResolutionTracking,
  SupportResolutionReport,
  TrackResolutionInput,
} from "./resolution/resolution.types";
import {
  clearSlaMetrics,
  getSlaMetrics,
  listSlaMetrics,
  measureSlaMetrics,
} from "./sla/sla.metrics";
import {
  clearSlaPolicies,
  getSlaPolicy,
  listSlaPolicies,
  registerSlaPolicy,
} from "./sla/sla.policy";
import type {
  MeasureSlaMetricsInput,
  RegisterSlaPolicyInput,
  SlaMetrics,
  SlaPolicy,
} from "./sla/sla.types";
import {
  assignSupport,
  clearSupportAssignments,
  getSupportAssignment,
  listSupportAssignments,
} from "./support/support.assignment";
import type {
  AssignSupportInput,
  AdvanceSupportWorkflowInput,
  SupportAssignment,
  SupportWorkflow,
} from "./support/support.types";
import {
  advanceSupportWorkflow,
  clearSupportWorkflows,
  getSupportWorkflow,
  listSupportWorkflows,
} from "./support/support.workflow";
import {
  OPERATIONS_O3_SUPPORT_OPERATIONS_BASE,
  OPERATIONS_O3_SUPPORT_OPERATIONS_FREEZE_VERSION,
  OPERATIONS_O3_SUPPORT_OPERATIONS_ID,
  OPERATIONS_O3_SUPPORT_OPERATIONS_VERSION,
} from "./ticket/ticket.constants";
import {
  clearTickets,
  getTicket,
  listTickets,
  registerTicket,
} from "./ticket/ticket.registry";
import {
  clearTicketStatuses,
  getTicketStatus,
  listTicketStatuses,
  updateTicketStatus,
} from "./ticket/ticket.status";
import type {
  RegisterTicketInput,
  SupportTicket,
  UpdateTicketStatusInput,
} from "./ticket/ticket.types";

export type O3SupportOperationsManagerSnapshot = {
  managerId: string;
  status: O3ManagerStatus;
  layerId: typeof OPERATIONS_O3_SUPPORT_OPERATIONS_ID;
  version: typeof OPERATIONS_O3_SUPPORT_OPERATIONS_VERSION;
  ticketCount: number;
  assignmentCount: number;
  resolutionCount: number;
  reportCount: number;
  startedAt?: string;
  stoppedAt?: string;
};

export type O3SupportOperationsManager = {
  initialize: () => O3SupportOperationsManagerSnapshot;
  start: () => O3SupportOperationsManagerSnapshot;
  stop: () => O3SupportOperationsManagerSnapshot;
  status: () => O3SupportOperationsManagerSnapshot;
  registerTicket: (input: RegisterTicketInput) => SupportTicket;
  updateTicketStatus: (input: UpdateTicketStatusInput) => SupportTicket;
  advanceWorkflow: (input: AdvanceSupportWorkflowInput) => SupportWorkflow;
  assignSupport: (input: AssignSupportInput) => SupportAssignment;
  publishArticle: (input: PublishKnowledgeArticleInput) => KnowledgeArticle;
  indexArticle: (input: IndexKnowledgeArticleInput) => KnowledgeIndexEntry;
  registerSlaPolicy: (input: RegisterSlaPolicyInput) => SlaPolicy;
  measureSla: (input: MeasureSlaMetricsInput) => SlaMetrics;
  trackResolution: (input: TrackResolutionInput) => ResolutionTracking;
  generateReport: (
    input?: GenerateResolutionReportInput,
  ) => SupportResolutionReport;
  evaluateReadiness: () => O3ReadinessResult;
  manifest: () => O3RegistryManifest;
};

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

export function getO3RegistryManifest(): O3RegistryManifest {
  return {
    foundationId: OPERATIONS_O3_SUPPORT_OPERATIONS_ID,
    version: OPERATIONS_O3_SUPPORT_OPERATIONS_VERSION,
    freezeVersion: OPERATIONS_O3_SUPPORT_OPERATIONS_FREEZE_VERSION,
    base: OPERATIONS_O3_SUPPORT_OPERATIONS_BASE,
    ticketCount: listTickets().length,
    workflowCount: listSupportWorkflows().length,
    assignmentCount: listSupportAssignments().length,
    articleCount: listKnowledgeArticles().length,
    indexCount: listKnowledgeIndex().length,
    policyCount: listSlaPolicies().length,
    slaMetricsCount: listSlaMetrics().length,
    resolutionCount: listResolutions().length,
    reportCount: listResolutionReports().length,
  };
}

export function clearO3SupportOperationsLayer(): void {
  clearResolutionReports();
  clearResolutions();
  clearSlaMetrics();
  clearSlaPolicies();
  clearKnowledgeIndex();
  clearKnowledgeArticles();
  clearSupportAssignments();
  clearSupportWorkflows();
  clearTicketStatuses();
  clearTickets();
}

export function createO3SupportOperationsManager(options?: {
  managerId?: string;
}): O3SupportOperationsManager {
  const managerId =
    options?.managerId?.trim() || createId("ops-o3-support-mgr");
  let state: O3ManagerStatus = "IDLE";
  let startedAt: string | undefined;
  let stoppedAt: string | undefined;

  function snapshot(): O3SupportOperationsManagerSnapshot {
    const reg = getO3RegistryManifest();
    return {
      managerId,
      status: state,
      layerId: OPERATIONS_O3_SUPPORT_OPERATIONS_ID,
      version: OPERATIONS_O3_SUPPORT_OPERATIONS_VERSION,
      ticketCount: reg.ticketCount,
      assignmentCount: reg.assignmentCount,
      resolutionCount: reg.resolutionCount,
      reportCount: reg.reportCount,
      startedAt,
      stoppedAt,
    };
  }

  function assertRunning(op: string): void {
    if (state !== "RUNNING") {
      throw new Error(`${op} requires RUNNING (current=${state})`);
    }
  }

  function initialize(): O3SupportOperationsManagerSnapshot {
    if (state !== "IDLE" && state !== "STOPPED") {
      throw new Error(
        `initialize requires IDLE or STOPPED (current=${state})`,
      );
    }
    clearO3SupportOperationsLayer();
    startedAt = undefined;
    stoppedAt = undefined;
    state = "READY";
    return snapshot();
  }

  function start(): O3SupportOperationsManagerSnapshot {
    if (state !== "READY" && state !== "STOPPED") {
      throw new Error(`start requires READY or STOPPED (current=${state})`);
    }
    state = "RUNNING";
    startedAt = nowIso();
    stoppedAt = undefined;
    return snapshot();
  }

  function stop(): O3SupportOperationsManagerSnapshot {
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
    registerTicket: (input) => {
      assertRunning("registerTicket");
      return registerTicket(input);
    },
    updateTicketStatus: (input) => {
      assertRunning("updateTicketStatus");
      return updateTicketStatus(input);
    },
    advanceWorkflow: (input) => {
      assertRunning("advanceWorkflow");
      return advanceSupportWorkflow(input);
    },
    assignSupport: (input) => {
      assertRunning("assignSupport");
      return assignSupport(input);
    },
    publishArticle: (input) => {
      assertRunning("publishArticle");
      return publishKnowledgeArticle(input);
    },
    indexArticle: (input) => {
      assertRunning("indexArticle");
      return indexKnowledgeArticle(input);
    },
    registerSlaPolicy: (input) => {
      assertRunning("registerSlaPolicy");
      return registerSlaPolicy(input);
    },
    measureSla: (input) => {
      assertRunning("measureSla");
      return measureSlaMetrics(input);
    },
    trackResolution: (input) => {
      assertRunning("trackResolution");
      return trackResolution(input);
    },
    generateReport: (input) => {
      assertRunning("generateReport");
      return generateResolutionReport(input);
    },
    evaluateReadiness: () => {
      assertRunning("evaluateReadiness");
      return evaluateO3SupportOperationsReadiness();
    },
    manifest: getO3RegistryManifest,
  };
}

export {
  assertO3SupportOperationsReadinessReady,
  getKnowledgeArticle,
  getKnowledgeIndexEntry,
  getResolution,
  getResolutionReport,
  getSlaMetrics,
  getSlaPolicy,
  getSupportAssignment,
  getSupportWorkflow,
  getTicket,
  getTicketStatus,
  listKnowledgeArticles,
  listKnowledgeIndex,
  listResolutionReports,
  listResolutions,
  listSlaMetrics,
  listSlaPolicies,
  listSupportAssignments,
  listSupportWorkflows,
  listTicketStatuses,
  listTickets,
};

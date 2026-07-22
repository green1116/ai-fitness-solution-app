/**
 * Post-Launch P6 — Enterprise Support Operations Manager
 */

import { getAdminConsoleRegistryManifest } from "../../product/e12/admin/admin.manager";
import { getSupportRegistryManifest } from "../../launch/support/support.manager";
import { getCustomerSuccessRegistryManifest } from "../customer-success/success.manager";
import { getGrowthRegistryManifest } from "../growth/growth.manager";
import { getIncidentRegistryManifest } from "../incident/incident.manager";
import {
  bindKnowledgeArticleToCase,
  bindOperationsIncidentToCase,
  clearEnterpriseSupportCases,
  getEnterpriseSupportCase,
  listEnterpriseSupportCases,
  openEnterpriseSupportCase,
  setEnterpriseSupportCaseStatus,
} from "./support.case";
import {
  OPERATIONS_ENTERPRISE_SUPPORT_BASE,
  OPERATIONS_ENTERPRISE_SUPPORT_FREEZE_VERSION,
  OPERATIONS_ENTERPRISE_SUPPORT_ID,
  OPERATIONS_ENTERPRISE_SUPPORT_VERSION,
} from "./support.constants";
import {
  clearKnowledgeArticles,
  createKnowledgeArticle,
  getKnowledgeArticle,
  listKnowledgeArticles,
  publishKnowledgeArticle,
} from "./support.knowledge";
import { computeEnterpriseSupportMetrics } from "./support.metrics";
import {
  assertEnterpriseSupportReadinessReady,
  evaluateEnterpriseSupportReadiness,
} from "./support.readiness";
import {
  clearEscalationRoutingDecisions,
  getEscalationRoutingDecision,
  listEscalationRoutingDecisions,
  routeSupportEscalation,
} from "./support.routing";
import {
  clearCustomerSupportWorkflows,
  getCustomerSupportWorkflow,
  listCustomerSupportWorkflows,
  startCustomerSupportWorkflow,
} from "./support.workflow";
import type {
  CreateKnowledgeArticleInput,
  CustomerSupportWorkflow,
  EnterpriseSupportCase,
  EnterpriseSupportManagerStatus,
  EnterpriseSupportMetrics,
  EnterpriseSupportReadinessResult,
  EnterpriseSupportRegistryManifest,
  EscalationRoutingDecision,
  KnowledgeArticle,
  OpenSupportCaseInput,
  RouteSupportEscalationInput,
  StartCustomerSupportWorkflowInput,
  SupportCaseStatus,
} from "./support.types";

export type EnterpriseSupportManagerSnapshot = {
  managerId: string;
  status: EnterpriseSupportManagerStatus;
  layerId: typeof OPERATIONS_ENTERPRISE_SUPPORT_ID;
  version: typeof OPERATIONS_ENTERPRISE_SUPPORT_VERSION;
  caseCount: number;
  workflowCount: number;
  routingCount: number;
  knowledgeCount: number;
  supportProfileCount: number;
  incidentCount: number;
  customerHealthProfileCount: number;
  adminAuditCount: number;
  growthDashboardCount: number;
  startedAt?: string;
  stoppedAt?: string;
};

export type EnterpriseSupportOperationsManager = {
  initialize: () => EnterpriseSupportManagerSnapshot;
  start: () => EnterpriseSupportManagerSnapshot;
  stop: () => EnterpriseSupportManagerSnapshot;
  status: () => EnterpriseSupportManagerSnapshot;
  openCase: (input: OpenSupportCaseInput) => EnterpriseSupportCase;
  setCaseStatus: (
    id: string,
    status: SupportCaseStatus,
    detail?: string,
  ) => EnterpriseSupportCase;
  bindKnowledge: typeof bindKnowledgeArticleToCase;
  bindIncident: typeof bindOperationsIncidentToCase;
  getCase: typeof getEnterpriseSupportCase;
  listCases: typeof listEnterpriseSupportCases;
  startWorkflow: (
    input: StartCustomerSupportWorkflowInput,
  ) => CustomerSupportWorkflow;
  getWorkflow: typeof getCustomerSupportWorkflow;
  listWorkflows: typeof listCustomerSupportWorkflows;
  routeEscalation: (
    input: RouteSupportEscalationInput,
  ) => EscalationRoutingDecision;
  getRouting: typeof getEscalationRoutingDecision;
  listRoutings: typeof listEscalationRoutingDecisions;
  createArticle: (input: CreateKnowledgeArticleInput) => KnowledgeArticle;
  publishArticle: typeof publishKnowledgeArticle;
  getArticle: typeof getKnowledgeArticle;
  listArticles: typeof listKnowledgeArticles;
  computeMetrics: (filter?: {
    productId?: string;
    supportSlaProfileId?: string;
  }) => EnterpriseSupportMetrics;
  evaluateReadiness: (
    supportCaseId: string,
  ) => EnterpriseSupportReadinessResult;
  manifest: () => EnterpriseSupportRegistryManifest;
};

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

export function getEnterpriseSupportRegistryManifest(): EnterpriseSupportRegistryManifest {
  return {
    enterpriseSupportId: OPERATIONS_ENTERPRISE_SUPPORT_ID,
    version: OPERATIONS_ENTERPRISE_SUPPORT_VERSION,
    freezeVersion: OPERATIONS_ENTERPRISE_SUPPORT_FREEZE_VERSION,
    base: OPERATIONS_ENTERPRISE_SUPPORT_BASE,
    caseCount: listEnterpriseSupportCases().length,
    workflowCount: listCustomerSupportWorkflows().length,
    routingCount: listEscalationRoutingDecisions().length,
    knowledgeCount: listKnowledgeArticles().length,
  };
}

export function clearEnterpriseSupportLayer(): void {
  clearCustomerSupportWorkflows();
  clearEscalationRoutingDecisions();
  clearKnowledgeArticles();
  clearEnterpriseSupportCases();
}

export function createEnterpriseSupportOperationsManager(options?: {
  managerId?: string;
}): EnterpriseSupportOperationsManager {
  const managerId =
    options?.managerId?.trim() || createId("ops-p6-es-mgr");
  let state: EnterpriseSupportManagerStatus = "IDLE";
  let startedAt: string | undefined;
  let stoppedAt: string | undefined;

  function snapshot(): EnterpriseSupportManagerSnapshot {
    const supportReg = getSupportRegistryManifest();
    const irReg = getIncidentRegistryManifest();
    const csReg = getCustomerSuccessRegistryManifest();
    const adminReg = getAdminConsoleRegistryManifest();
    const growthReg = getGrowthRegistryManifest();
    const reg = getEnterpriseSupportRegistryManifest();
    return {
      managerId,
      status: state,
      layerId: OPERATIONS_ENTERPRISE_SUPPORT_ID,
      version: OPERATIONS_ENTERPRISE_SUPPORT_VERSION,
      caseCount: reg.caseCount,
      workflowCount: reg.workflowCount,
      routingCount: reg.routingCount,
      knowledgeCount: reg.knowledgeCount,
      supportProfileCount: supportReg.profileCount,
      incidentCount: irReg.incidentCount,
      customerHealthProfileCount: csReg.healthProfileCount,
      adminAuditCount: adminReg.auditCount,
      growthDashboardCount: growthReg.dashboardCount,
      startedAt,
      stoppedAt,
    };
  }

  function assertRunning(op: string): void {
    if (state !== "RUNNING") {
      throw new Error(`${op} requires RUNNING (current=${state})`);
    }
  }

  function initialize(): EnterpriseSupportManagerSnapshot {
    if (state !== "IDLE" && state !== "STOPPED") {
      throw new Error(
        `initialize requires IDLE or STOPPED (current=${state})`,
      );
    }
    clearEnterpriseSupportLayer();
    startedAt = undefined;
    stoppedAt = undefined;
    state = "READY";
    return snapshot();
  }

  function start(): EnterpriseSupportManagerSnapshot {
    if (state !== "READY" && state !== "STOPPED") {
      throw new Error(`start requires READY or STOPPED (current=${state})`);
    }
    state = "RUNNING";
    startedAt = nowIso();
    stoppedAt = undefined;
    return snapshot();
  }

  function stop(): EnterpriseSupportManagerSnapshot {
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
    openCase: (input) => {
      assertRunning("openCase");
      return openEnterpriseSupportCase(input);
    },
    setCaseStatus: (id, status, detail) => {
      assertRunning("setCaseStatus");
      return setEnterpriseSupportCaseStatus(id, status, detail);
    },
    bindKnowledge: (supportCaseId, knowledgeArticleId) => {
      assertRunning("bindKnowledge");
      return bindKnowledgeArticleToCase(supportCaseId, knowledgeArticleId);
    },
    bindIncident: (supportCaseId, operationsIncidentId) => {
      assertRunning("bindIncident");
      return bindOperationsIncidentToCase(supportCaseId, operationsIncidentId);
    },
    getCase: getEnterpriseSupportCase,
    listCases: listEnterpriseSupportCases,
    startWorkflow: (input) => {
      assertRunning("startWorkflow");
      return startCustomerSupportWorkflow(input);
    },
    getWorkflow: getCustomerSupportWorkflow,
    listWorkflows: listCustomerSupportWorkflows,
    routeEscalation: (input) => {
      assertRunning("routeEscalation");
      return routeSupportEscalation(input);
    },
    getRouting: getEscalationRoutingDecision,
    listRoutings: listEscalationRoutingDecisions,
    createArticle: (input) => {
      assertRunning("createArticle");
      return createKnowledgeArticle(input);
    },
    publishArticle: (id) => {
      assertRunning("publishArticle");
      return publishKnowledgeArticle(id);
    },
    getArticle: getKnowledgeArticle,
    listArticles: listKnowledgeArticles,
    computeMetrics: (filter) => {
      assertRunning("computeMetrics");
      return computeEnterpriseSupportMetrics(filter);
    },
    evaluateReadiness: (supportCaseId) => {
      assertRunning("evaluateReadiness");
      return evaluateEnterpriseSupportReadiness(supportCaseId);
    },
    manifest: getEnterpriseSupportRegistryManifest,
  };
}

export { assertEnterpriseSupportReadinessReady };

/**
 * Evolution P3 — Autonomous Customer Success Manager
 */

import { getCommercialControlRegistryManifest } from "../../product/e12/commercial/commercial.manager";
import { getCustomerSuccessRegistryManifest } from "../../operations/customer-success/success.manager";
import { getGrowthRegistryManifest } from "../../operations/growth/growth.manager";
import { getPredictiveRegistryManifest } from "../predictive/predictive.manager";
import {
  EVOLUTION_AUTONOMOUS_CUSTOMER_SUCCESS_BASE,
  EVOLUTION_AUTONOMOUS_CUSTOMER_SUCCESS_FREEZE_VERSION,
  EVOLUTION_AUTONOMOUS_CUSTOMER_SUCCESS_ID,
  EVOLUTION_AUTONOMOUS_CUSTOMER_SUCCESS_VERSION,
} from "./customer.constants";
import {
  clearChurnPreventionPlans,
  getChurnPreventionPlan,
  listChurnPreventionPlans,
  planChurnPrevention,
} from "./customer.churn";
import {
  automateEngagement,
  clearEngagementAutomations,
  getEngagementAutomation,
  listEngagementAutomations,
} from "./customer.engagement";
import {
  clearExpansionOpportunities,
  detectExpansionOpportunity,
  getExpansionOpportunity,
  listExpansionOpportunities,
} from "./customer.expansion";
import {
  clearCustomerIntelligenceProfiles,
  createCustomerIntelligenceProfile,
  getCustomerIntelligenceProfile,
  listCustomerIntelligenceProfiles,
} from "./customer.intelligence";
import {
  assertAutonomousCsReadinessReady,
  evaluateAutonomousCsReadiness,
} from "./customer.readiness";
import {
  clearSuccessRecommendations,
  generateSuccessRecommendations,
  getSuccessRecommendation,
  listSuccessRecommendations,
} from "./customer.recommendation";
import type {
  AutomateEngagementInput,
  AutonomousCsManagerStatus,
  AutonomousCsReadinessResult,
  AutonomousCsRegistryManifest,
  ChurnPreventionPlan,
  CreateCustomerIntelligenceInput,
  CustomerIntelligenceProfile,
  DetectExpansionOpportunityInput,
  EngagementAutomation,
  ExpansionOpportunity,
  GenerateSuccessRecommendationsInput,
  PlanChurnPreventionInput,
  SuccessRecommendation,
} from "./customer.types";

export type AutonomousCsManagerSnapshot = {
  managerId: string;
  status: AutonomousCsManagerStatus;
  layerId: typeof EVOLUTION_AUTONOMOUS_CUSTOMER_SUCCESS_ID;
  version: typeof EVOLUTION_AUTONOMOUS_CUSTOMER_SUCCESS_VERSION;
  intelligenceCount: number;
  engagementCount: number;
  recommendationCount: number;
  churnPlanCount: number;
  expansionCount: number;
  predictiveModelCount: number;
  customerHealthCount: number;
  growthDashboardCount: number;
  commercialSlaCount: number;
  startedAt?: string;
  stoppedAt?: string;
};

export type AutonomousCustomerSuccessManager = {
  initialize: () => AutonomousCsManagerSnapshot;
  start: () => AutonomousCsManagerSnapshot;
  stop: () => AutonomousCsManagerSnapshot;
  status: () => AutonomousCsManagerSnapshot;
  createIntelligence: (
    input: CreateCustomerIntelligenceInput,
  ) => CustomerIntelligenceProfile;
  getIntelligence: typeof getCustomerIntelligenceProfile;
  listIntelligences: typeof listCustomerIntelligenceProfiles;
  automateEngagement: (input: AutomateEngagementInput) => EngagementAutomation;
  getEngagement: typeof getEngagementAutomation;
  listEngagements: typeof listEngagementAutomations;
  generateRecommendations: (
    input: GenerateSuccessRecommendationsInput,
  ) => SuccessRecommendation[];
  getRecommendation: typeof getSuccessRecommendation;
  listRecommendations: typeof listSuccessRecommendations;
  planChurnPrevention: (input: PlanChurnPreventionInput) => ChurnPreventionPlan;
  getChurnPlan: typeof getChurnPreventionPlan;
  listChurnPlans: typeof listChurnPreventionPlans;
  detectExpansion: (
    input: DetectExpansionOpportunityInput,
  ) => ExpansionOpportunity;
  getExpansion: typeof getExpansionOpportunity;
  listExpansions: typeof listExpansionOpportunities;
  evaluateReadiness: (
    customerIntelligenceId: string,
  ) => AutonomousCsReadinessResult;
  manifest: () => AutonomousCsRegistryManifest;
};

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

export function getAutonomousCsRegistryManifest(): AutonomousCsRegistryManifest {
  return {
    autonomousCsId: EVOLUTION_AUTONOMOUS_CUSTOMER_SUCCESS_ID,
    version: EVOLUTION_AUTONOMOUS_CUSTOMER_SUCCESS_VERSION,
    freezeVersion: EVOLUTION_AUTONOMOUS_CUSTOMER_SUCCESS_FREEZE_VERSION,
    base: EVOLUTION_AUTONOMOUS_CUSTOMER_SUCCESS_BASE,
    intelligenceCount: listCustomerIntelligenceProfiles().length,
    engagementCount: listEngagementAutomations().length,
    recommendationCount: listSuccessRecommendations().length,
    churnPlanCount: listChurnPreventionPlans().length,
    expansionCount: listExpansionOpportunities().length,
  };
}

export function clearAutonomousCustomerSuccessLayer(): void {
  clearExpansionOpportunities();
  clearChurnPreventionPlans();
  clearSuccessRecommendations();
  clearEngagementAutomations();
  clearCustomerIntelligenceProfiles();
}

export function createAutonomousCustomerSuccessManager(options?: {
  managerId?: string;
}): AutonomousCustomerSuccessManager {
  const managerId =
    options?.managerId?.trim() || createId("evo-p3-acs-mgr");
  let state: AutonomousCsManagerStatus = "IDLE";
  let startedAt: string | undefined;
  let stoppedAt: string | undefined;

  function snapshot(): AutonomousCsManagerSnapshot {
    const predReg = getPredictiveRegistryManifest();
    const csReg = getCustomerSuccessRegistryManifest();
    const growthReg = getGrowthRegistryManifest();
    const commercialReg = getCommercialControlRegistryManifest();
    const reg = getAutonomousCsRegistryManifest();
    return {
      managerId,
      status: state,
      layerId: EVOLUTION_AUTONOMOUS_CUSTOMER_SUCCESS_ID,
      version: EVOLUTION_AUTONOMOUS_CUSTOMER_SUCCESS_VERSION,
      intelligenceCount: reg.intelligenceCount,
      engagementCount: reg.engagementCount,
      recommendationCount: reg.recommendationCount,
      churnPlanCount: reg.churnPlanCount,
      expansionCount: reg.expansionCount,
      predictiveModelCount: predReg.modelCount,
      customerHealthCount: csReg.healthProfileCount,
      growthDashboardCount: growthReg.dashboardCount,
      commercialSlaCount: commercialReg.slaCount,
      startedAt,
      stoppedAt,
    };
  }

  function assertRunning(op: string): void {
    if (state !== "RUNNING") {
      throw new Error(`${op} requires RUNNING (current=${state})`);
    }
  }

  function initialize(): AutonomousCsManagerSnapshot {
    if (state !== "IDLE" && state !== "STOPPED") {
      throw new Error(
        `initialize requires IDLE or STOPPED (current=${state})`,
      );
    }
    clearAutonomousCustomerSuccessLayer();
    startedAt = undefined;
    stoppedAt = undefined;
    state = "READY";
    return snapshot();
  }

  function start(): AutonomousCsManagerSnapshot {
    if (state !== "READY" && state !== "STOPPED") {
      throw new Error(`start requires READY or STOPPED (current=${state})`);
    }
    state = "RUNNING";
    startedAt = nowIso();
    stoppedAt = undefined;
    return snapshot();
  }

  function stop(): AutonomousCsManagerSnapshot {
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
    createIntelligence: (input) => {
      assertRunning("createIntelligence");
      return createCustomerIntelligenceProfile(input);
    },
    getIntelligence: getCustomerIntelligenceProfile,
    listIntelligences: listCustomerIntelligenceProfiles,
    automateEngagement: (input) => {
      assertRunning("automateEngagement");
      return automateEngagement(input);
    },
    getEngagement: getEngagementAutomation,
    listEngagements: listEngagementAutomations,
    generateRecommendations: (input) => {
      assertRunning("generateRecommendations");
      return generateSuccessRecommendations(input);
    },
    getRecommendation: getSuccessRecommendation,
    listRecommendations: listSuccessRecommendations,
    planChurnPrevention: (input) => {
      assertRunning("planChurnPrevention");
      return planChurnPrevention(input);
    },
    getChurnPlan: getChurnPreventionPlan,
    listChurnPlans: listChurnPreventionPlans,
    detectExpansion: (input) => {
      assertRunning("detectExpansion");
      return detectExpansionOpportunity(input);
    },
    getExpansion: getExpansionOpportunity,
    listExpansions: listExpansionOpportunities,
    evaluateReadiness: (customerIntelligenceId) => {
      assertRunning("evaluateReadiness");
      return evaluateAutonomousCsReadiness(customerIntelligenceId);
    },
    manifest: getAutonomousCsRegistryManifest,
  };
}

export { assertAutonomousCsReadinessReady };

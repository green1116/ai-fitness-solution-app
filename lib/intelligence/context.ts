/**
 * FEAT-49 — Intelligence Context
 * Cross-domain context snapshot built on Post-Launch baselines.
 */
import {
  buildAutomationDashboard,
  buildCustomerAnalytics,
  buildCustomerInsights,
  buildOptimizationDashboard,
  buildRetentionDashboard,
  getAutomationDashboard,
  getCustomerAnalytics,
  getCustomerInsights,
  getCustomerSuccessDashboard,
  getOptimizationDashboard,
  getRetentionDashboard,
} from "../post-launch";

export const FEAT_49_ID = "FEAT-49" as const;
export const INTELLIGENCE_CONTEXT_CAPABILITY = "IntelligenceContext" as const;

export type CustomerContextSummary = Readonly<{
  totalCustomers: number;
  activeCustomers: number;
  atRiskCustomers: number;
  healthyCustomers: number;
  churnedCustomers: number;
}>;

export type OperationsContextSummary = Readonly<{
  retentionRate: number;
  renewedCustomers: number;
  openRenewals: number;
  wonExpansions: number;
  optimizationScore: number;
}>;

export type AnalyticsContextSummary = Readonly<{
  totalCustomers: number;
  openSupportCases: number;
  recentEngagements: number;
  churnedCustomers: number;
}>;

export type AutomationContextSummary = Readonly<{
  totalAutomations: number;
  activeWorkflows: number;
  pendingTasks: number;
  runningTasks: number;
  completedTasks: number;
  failedTasks: number;
}>;

export type IntelligenceContext = Readonly<{
  contextId: string;
  customerSummary: CustomerContextSummary;
  operationsSummary: OperationsContextSummary;
  analyticsSummary: AnalyticsContextSummary;
  automationSummary: AutomationContextSummary;
  updatedAt: string;
}>;

let cachedContext: IntelligenceContext | null = null;

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneContext(row: IntelligenceContext): IntelligenceContext {
  return {
    contextId: row.contextId,
    customerSummary: { ...row.customerSummary },
    operationsSummary: { ...row.operationsSummary },
    analyticsSummary: { ...row.analyticsSummary },
    automationSummary: { ...row.automationSummary },
    updatedAt: row.updatedAt,
  };
}

/**
 * Build (and cache) intelligence context from Post-Launch baselines.
 */
export function buildIntelligenceContext(): IntelligenceContext {
  const customerInsights = buildCustomerInsights();
  const retention = buildRetentionDashboard();
  const optimization = buildOptimizationDashboard();
  const analytics = buildCustomerAnalytics();
  const automation = buildAutomationDashboard();

  // Ensure get paths across baselines are reused.
  void getCustomerSuccessDashboard().totalCustomers;
  void getCustomerInsights().totalCustomers;
  void getRetentionDashboard().retentionRate;
  void getOptimizationDashboard().optimizationScore;
  void getCustomerAnalytics().churnedCustomers;
  void getAutomationDashboard().totalAutomations;

  const context: IntelligenceContext = {
    contextId: createId("ctx"),
    customerSummary: {
      totalCustomers: customerInsights.totalCustomers,
      activeCustomers: customerInsights.activeCustomers,
      atRiskCustomers: customerInsights.atRiskCustomers,
      healthyCustomers: customerInsights.healthyCustomers,
      churnedCustomers: customerInsights.churnedCustomers,
    },
    operationsSummary: {
      retentionRate: retention.retentionRate,
      renewedCustomers: retention.renewedCustomers,
      openRenewals: retention.openRenewals,
      wonExpansions: retention.wonExpansions,
      optimizationScore: optimization.optimizationScore,
    },
    analyticsSummary: {
      totalCustomers: analytics.totalCustomers,
      openSupportCases: analytics.openSupportCases,
      recentEngagements: analytics.recentEngagements,
      churnedCustomers: analytics.churnedCustomers,
    },
    automationSummary: {
      totalAutomations: automation.totalAutomations,
      activeWorkflows: automation.activeWorkflows,
      pendingTasks: automation.pendingTasks,
      runningTasks: automation.runningTasks,
      completedTasks: automation.completedTasks,
      failedTasks: automation.failedTasks,
    },
    updatedAt: nowIso(),
  };
  cachedContext = context;
  return cloneContext(context);
}

/**
 * Get the last built intelligence context, or build one if none cached.
 */
export function getIntelligenceContext(): IntelligenceContext {
  if (!cachedContext) {
    return buildIntelligenceContext();
  }
  return cloneContext(cachedContext);
}

/** Test helper — clears cached intelligence context. */
export function clearIntelligenceContext(): void {
  cachedContext = null;
}

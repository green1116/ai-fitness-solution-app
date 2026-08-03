/**
 * Post-launch domain public exports
 */

export {
  clearCustomers,
  CUSTOMER_REGISTRY_CAPABILITY,
  CUSTOMER_STATUSES,
  existsCustomer,
  FEAT_30_ID,
  getCustomer,
  listCustomers,
  registerCustomer,
  type Customer,
  type CustomerStatus,
  type ListCustomersFilter,
  type RegisterCustomerInput,
} from "./customer/customer-registry";

export {
  clearCustomerProfiles,
  createCustomerProfile,
  CUSTOMER_PROFILE_CAPABILITY,
  FEAT_31_ID,
  getCustomerProfile,
  listCustomerProfiles,
  updateCustomerProfile,
  type CreateCustomerProfileInput,
  type CustomerProfile,
  type ListCustomerProfilesFilter,
  type UpdateCustomerProfileInput,
} from "./customer/customer-profile";

export {
  clearCustomerLifecycles,
  CUSTOMER_LIFECYCLE_CAPABILITY,
  CUSTOMER_LIFECYCLE_STAGES,
  CUSTOMER_LIFECYCLE_STATUSES,
  FEAT_32_ID,
  getCustomerLifecycle,
  isCustomerAtRisk,
  listCustomerLifecycle,
  setCustomerLifecycleStage,
  type CustomerLifecycle,
  type CustomerLifecycleStage,
  type CustomerLifecycleStatus,
  type ListCustomerLifecycleFilter,
  type SetCustomerLifecycleStageInput,
} from "./customer/customer-lifecycle";

export {
  clearCustomerHealth,
  CUSTOMER_HEALTH_CAPABILITY,
  CUSTOMER_HEALTH_LEVELS,
  FEAT_33_ID,
  getCustomerHealth,
  isHealthy,
  listCustomerHealth,
  setCustomerHealth,
  type CustomerHealth,
  type CustomerHealthLevel,
  type ListCustomerHealthFilter,
  type SetCustomerHealthInput,
} from "./customer/customer-health";

export {
  clearCustomerEngagements,
  CUSTOMER_ENGAGEMENT_CAPABILITY,
  CUSTOMER_ENGAGEMENT_TYPES,
  FEAT_34_ID,
  getCustomerEngagement,
  hasRecentEngagement,
  listCustomerEngagement,
  recordCustomerEngagement,
  type CustomerEngagement,
  type CustomerEngagementType,
  type ListCustomerEngagementFilter,
  type RecordCustomerEngagementInput,
} from "./customer/customer-engagement";

export {
  clearSupportCases,
  closeSupportCase,
  FEAT_35_ID,
  getSupportCase,
  listSupportCase,
  openSupportCase,
  SUPPORT_CASE_CAPABILITY,
  SUPPORT_CASE_PRIORITIES,
  SUPPORT_CASE_STATUSES,
  updateSupportCaseStatus,
  type ListSupportCaseFilter,
  type OpenSupportCaseInput,
  type SupportCase,
  type SupportCasePriority,
  type SupportCaseStatus,
  type UpdateSupportCaseStatusInput,
} from "./customer/support-case";

export {
  buildCustomerSuccessDashboard,
  clearCustomerSuccessDashboard,
  CUSTOMER_SUCCESS_DASHBOARD_CAPABILITY,
  FEAT_36_ID,
  getCustomerSuccessDashboard,
  type CustomerSuccessDashboard,
} from "./customer/customer-success-dashboard";

export {
  buildCustomerAnalytics,
  clearCustomerAnalytics,
  CUSTOMER_ANALYTICS_CAPABILITY,
  FEAT_37_ID,
  getCustomerAnalytics,
  type CustomerAnalytics,
} from "./customer/customer-analytics";

export {
  addRenewal,
  clearRenewals,
  FEAT_38_ID,
  getRenewal,
  listRenewals,
  RENEWAL_QUEUE_CAPABILITY,
  RENEWAL_STATUSES,
  updateRenewalStatus,
  type AddRenewalInput,
  type ListRenewalsFilter,
  type RenewalQueueItem,
  type RenewalStatus,
  type UpdateRenewalStatusInput,
} from "./customer/renewal-queue";

export {
  addExpansion,
  clearExpansions,
  EXPANSION_QUEUE_CAPABILITY,
  EXPANSION_STATUSES,
  FEAT_39_ID,
  getExpansion,
  listExpansions,
  updateExpansionStatus,
  type AddExpansionInput,
  type ExpansionQueueItem,
  type ExpansionStatus,
  type ListExpansionsFilter,
  type UpdateExpansionStatusInput,
} from "./customer/expansion-queue";

export {
  buildRetentionDashboard,
  clearRetentionDashboard,
  FEAT_40_ID,
  getRetentionDashboard,
  RETENTION_DASHBOARD_CAPABILITY,
  type RetentionDashboard,
} from "./customer/retention-dashboard";

export {
  buildCustomerInsights,
  clearCustomerInsights,
  CUSTOMER_INSIGHTS_CAPABILITY,
  FEAT_41_ID,
  getCustomerInsights,
  type CustomerInsights,
} from "./customer/customer-insights";

export {
  buildRetentionInsights,
  clearRetentionInsights,
  FEAT_42_ID,
  getRetentionInsights,
  RETENTION_INSIGHTS_CAPABILITY,
  type RetentionInsights,
} from "./customer/retention-insights";

export {
  buildExpansionInsights,
  clearExpansionInsights,
  EXPANSION_INSIGHTS_CAPABILITY,
  FEAT_43_ID,
  getExpansionInsights,
  type ExpansionInsights,
} from "./customer/expansion-insights";

export {
  buildOptimizationDashboard,
  clearOptimizationDashboard,
  FEAT_44_ID,
  getOptimizationDashboard,
  OPTIMIZATION_DASHBOARD_CAPABILITY,
  type OptimizationDashboard,
} from "./customer/optimization-dashboard";

export {
  clearCustomerAutomations,
  createCustomerAutomation,
  CUSTOMER_AUTOMATION_ACTIONS,
  CUSTOMER_AUTOMATION_CAPABILITY,
  CUSTOMER_AUTOMATION_TRIGGERS,
  disableCustomerAutomation,
  enableCustomerAutomation,
  FEAT_45_ID,
  getCustomerAutomation,
  listCustomerAutomation,
  type CreateCustomerAutomationInput,
  type CustomerAutomation,
  type CustomerAutomationAction,
  type CustomerAutomationTrigger,
  type ListCustomerAutomationFilter,
} from "./customer/customer-automation";

export {
  clearWorkflows,
  createWorkflow,
  FEAT_46_ID,
  getWorkflow,
  listWorkflow,
  pauseWorkflow,
  resumeWorkflow,
  startWorkflow,
  WORKFLOW_ENGINE_CAPABILITY,
  WORKFLOW_STATUSES,
  type CreateWorkflowInput,
  type ListWorkflowFilter,
  type Workflow,
  type WorkflowStatus,
} from "./customer/workflow-engine";

export {
  clearTasks,
  completeTask,
  enqueueTask,
  failTask,
  FEAT_47_ID,
  getTask,
  listTasks,
  startTask,
  TASK_QUEUE_CAPABILITY,
  TASK_STATUSES,
  type EnqueueTaskInput,
  type ListTasksFilter,
  type TaskQueueItem,
  type TaskStatus,
} from "./customer/task-queue";

export {
  buildAutomationDashboard,
  clearAutomationDashboard,
  AUTOMATION_DASHBOARD_CAPABILITY,
  FEAT_48_ID,
  getAutomationDashboard,
  type AutomationDashboard,
} from "./customer/automation-dashboard";

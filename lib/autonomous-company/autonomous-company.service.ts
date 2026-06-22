/**
 * V62 P3 — Autonomous Company System public API
 */

export {
  runAutonomousCompanyCycle,
  analyzeCompanyState,
  generateBusinessStrategy,
  executeCompanyActionsPublic as executeCompanyActions,
  optimizeRevenueAutomatically,
  optimizeGrowthAutomatically,
  optimizeSalesAutomatically,
  selfHealSystemIssues,
  enforceBusinessPoliciesPublic as enforceBusinessPolicies,
  getGovernanceCatalog,
  getCompanyControllerStatus,
  runCompanyLoopIteration,
  runAutonomousCompanyWhile,
  isCompanyRunning,
} from "./core/autonomous-company.engine";

export { setCompanyRunning, clearCompanyLoopForTests } from "./core/company.loop";

export type {
  CompanyState,
  CompanyCycleOutcome,
  AutonomousCompanyReport,
  CompanyHealth,
} from "./core/company.state";

export { guardExecutionBatch } from "./governance/safety.guard";
export { COMPANY_CONSTRAINTS } from "./governance/constraint.engine";
export { ingestBusinessFeedback, publishFeedbackLoop } from "./control/feedback.loop";

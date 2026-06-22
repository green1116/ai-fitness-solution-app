/**
 * V62 P2 — AI Autonomous Execution System public API
 */

export {
  generateExecutionPlan,
  prioritizeActions,
  executeAction,
  executePlan,
  runAutonomousExecution,
  executeGrowthAction,
  executeSalesAction,
  executePricingAction,
  executeCRMAction,
  dispatchSystemAction,
  monitorExecutionResult,
  reverseExecution,
} from "./core/execution-engine";

export { buildExecutionContext, createTraceId } from "./core/execution.context";
export { validateExecutionAction } from "./core/execution.validation";
export { triggerAutomationRules, runAutomationCycle } from "./automation/automation.engine";
export { runTriggerEngine, inspectTriggers } from "./triggers/trigger.engine";
export { planExecutionsFromDecisions } from "./planner/action-planner";
export { evaluateAutomationRules } from "./automation/automation.rules";
export {
  clearExecutionStoreForTests,
  getExecutionLogs,
} from "./core/execution-log.store";
export {
  resetPlannerCounterForTests,
} from "./planner/action-planner";
export {
  resetRuleCounterForTests,
} from "./automation/automation.rules";
export { clearSchedulerForTests } from "./automation/automation.scheduler";

export type {
  ExecutionAction,
  ExecutionPlan,
  ExecutionResult,
  ExecutionMonitorReport,
} from "./core/execution.types";

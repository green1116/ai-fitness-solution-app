/**
 * V71 P3 — Workflow policy builder (read-only)
 */
import { buildWorkflowDependency } from "./dependency.builder";
import { V71_WORKFLOW_DEPENDENCY_VERSION } from "./workflow.dependency";
import {
  buildAuditTrailManifest,
  buildPolicyExceptionManifest,
  buildPolicyRuleManifest,
  buildRequiredCheckManifest,
  isWorkflowPolicyRefsAligned,
} from "./policy.rules";
import type { WorkflowPolicyReport, WorkflowPolicySignals } from "./workflow.policy";
import {
  V71_WORKFLOW_POLICY_FREEZE_VERSION,
  V71_WORKFLOW_POLICY_VERSION,
} from "./workflow.policy";

const DEFAULT_SIGNALS: WorkflowPolicySignals = {
  workflowDependencyReady: true,
  rulesComplete: true,
  checksComplete: true,
  exceptionsComplete: true,
  auditTrailsComplete: true,
  refsAligned: true,
  freezeVersionDeclared: true,
};

export function buildWorkflowPolicy(input?: {
  deploymentId?: string;
  signals?: WorkflowPolicySignals;
}): WorkflowPolicyReport {
  const deploymentId = input?.deploymentId ?? "v71-workflow-policy-default";

  const workflowDependency = buildWorkflowDependency({ deploymentId });
  const rules = buildPolicyRuleManifest();
  const requiredChecks = buildRequiredCheckManifest();
  const exceptions = buildPolicyExceptionManifest();
  const auditTrails = buildAuditTrailManifest();
  const refsAligned = isWorkflowPolicyRefsAligned();

  const signals: WorkflowPolicySignals = {
    ...DEFAULT_SIGNALS,
    workflowDependencyReady: workflowDependency.dependencyReady,
    rulesComplete: rules.catalogComplete,
    checksComplete: requiredChecks.catalogComplete,
    exceptionsComplete: exceptions.catalogComplete,
    auditTrailsComplete: auditTrails.catalogComplete,
    refsAligned,
    freezeVersionDeclared: V71_WORKFLOW_POLICY_FREEZE_VERSION.length > 0,
    ...input?.signals,
  };

  const policyReady =
    workflowDependency.dependencyReady &&
    rules.catalogComplete &&
    requiredChecks.catalogComplete &&
    exceptions.catalogComplete &&
    auditTrails.catalogComplete &&
    refsAligned &&
    signals.workflowDependencyReady !== false;

  return {
    version: V71_WORKFLOW_POLICY_VERSION,
    freezeVersion: V71_WORKFLOW_POLICY_FREEZE_VERSION,
    reportId: `workflow-policy-${deploymentId}`,
    generatedAt: new Date().toISOString(),
    deploymentId,
    workflowDependencyVersion: V71_WORKFLOW_DEPENDENCY_VERSION,
    workflowDependencyReady: workflowDependency.dependencyReady,
    rules,
    requiredChecks,
    exceptions,
    auditTrails,
    policyReady,
    readinessScore: policyReady ? 100 : 0,
    summary: [
      `workflow-policy ready=${policyReady}`,
      `rules=${rules.ruleCount}`,
      `checks=${requiredChecks.entryCount}`,
      `exceptions=${exceptions.entryCount}`,
      `audits=${auditTrails.entryCount}`,
      `refsAligned=${refsAligned}`,
      `dependency=${workflowDependency.dependencyReady}`,
    ].join(" "),
  };
}

export function assertWorkflowPolicyPass(
  report: WorkflowPolicyReport,
): asserts report is WorkflowPolicyReport & { policyReady: true } {
  if (!report.policyReady) {
    throw new Error(`V71 workflow policy not ready: ${report.summary}`);
  }
}

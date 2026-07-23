/**
 * Commercialization P7 — Commercial Governance Manager
 */

import {
  clearApprovalRules,
  defineApprovalRule,
  evaluateApprovalAmount,
  getApprovalRule,
  listApprovalRules,
} from "./approval/approval.rules";
import {
  clearApprovalWorkflow,
  decideApproval,
  getApprovalRequest,
  listApprovalDecisions,
  listApprovalRequests,
  submitApprovalRequest,
} from "./approval/approval.workflow";
import type {
  ApprovalDecision,
  ApprovalRequest,
  ApprovalRule,
  DecideApprovalInput,
  DefineApprovalRuleInput,
  SubmitApprovalInput,
} from "./approval/approval.types";
import {
  clearAuditRecords,
  getAuditRecord,
  listAuditRecords,
  recordAuditEvent,
} from "./audit/audit.record";
import {
  assembleAuditTrail,
  clearAuditTrails,
  getAuditTrail,
  listAuditTrails,
} from "./audit/audit.trail";
import type {
  AssembleAuditTrailInput,
  AuditRecord,
  AuditTrail,
  RecordAuditInput,
} from "./audit/audit.types";
import {
  clearComplianceChecks,
  getComplianceCheck,
  listComplianceChecks,
  runComplianceCheck,
} from "./compliance/compliance.checks";
import {
  assertCommercialGovernanceReadinessReady,
  clearComplianceStatuses,
  evaluateCommercialGovernanceReadiness,
  evaluateComplianceStatus,
  getComplianceStatus,
  listComplianceStatuses,
} from "./compliance/compliance.status";
import type {
  ComplianceCheck,
  ComplianceStatus,
  EvaluateComplianceStatusInput,
  GovernanceManagerStatus,
  GovernanceReadinessResult,
  GovernanceRegistryManifest,
  RunComplianceCheckInput,
} from "./compliance/compliance.types";
import {
  COMMERCIALIZATION_COMMERCIAL_GOVERNANCE_BASE,
  COMMERCIALIZATION_COMMERCIAL_GOVERNANCE_FREEZE_VERSION,
  COMMERCIALIZATION_COMMERCIAL_GOVERNANCE_ID,
  COMMERCIALIZATION_COMMERCIAL_GOVERNANCE_VERSION,
} from "./governance/governance.constants";
import {
  clearGovernancePolicies,
  defineGovernancePolicy,
  getGovernancePolicy,
  listGovernancePolicies,
} from "./governance/governance.policy";
import {
  clearGovernance,
  getGovernance,
  listGovernance,
  registerGovernance,
} from "./governance/governance.registry";
import type {
  DefinePolicyInput,
  GovernancePolicy,
  GovernanceRecord,
  RegisterGovernanceInput,
} from "./governance/governance.types";
import {
  assessRisk,
  clearRiskAssessments,
  getRiskAssessment,
  listRiskAssessments,
} from "./risk/risk.assessment";
import {
  applyRiskControl,
  clearRiskControls,
  getRiskControl,
  listRiskControls,
} from "./risk/risk.control";
import type {
  ApplyRiskControlInput,
  AssessRiskInput,
  RiskAssessment,
  RiskControl,
} from "./risk/risk.types";

export type CommercialGovernanceManagerSnapshot = {
  managerId: string;
  status: GovernanceManagerStatus;
  layerId: typeof COMMERCIALIZATION_COMMERCIAL_GOVERNANCE_ID;
  version: typeof COMMERCIALIZATION_COMMERCIAL_GOVERNANCE_VERSION;
  governanceCount: number;
  approvalCount: number;
  riskCount: number;
  auditCount: number;
  complianceCheckCount: number;
  startedAt?: string;
  stoppedAt?: string;
};

export type CommercialGovernanceManager = {
  initialize: () => CommercialGovernanceManagerSnapshot;
  start: () => CommercialGovernanceManagerSnapshot;
  stop: () => CommercialGovernanceManagerSnapshot;
  status: () => CommercialGovernanceManagerSnapshot;
  registerGovernance: (input: RegisterGovernanceInput) => GovernanceRecord;
  definePolicy: (input: DefinePolicyInput) => GovernancePolicy;
  defineApprovalRule: (input: DefineApprovalRuleInput) => ApprovalRule;
  submitApproval: (input: SubmitApprovalInput) => ApprovalRequest;
  decideApproval: (input: DecideApprovalInput) => ApprovalDecision;
  evaluateApprovalAmount: (
    amount: number,
    ruleId?: string,
  ) => "AUTO_APPROVE" | "REVIEW" | "ESCALATE";
  assessRisk: (input: AssessRiskInput) => RiskAssessment;
  applyRiskControl: (input: ApplyRiskControlInput) => RiskControl;
  recordAudit: (input: RecordAuditInput) => AuditRecord;
  assembleTrail: (input: AssembleAuditTrailInput) => AuditTrail;
  runComplianceCheck: (input: RunComplianceCheckInput) => ComplianceCheck;
  evaluateCompliance: (
    input?: EvaluateComplianceStatusInput,
  ) => ComplianceStatus;
  evaluateReadiness: () => GovernanceReadinessResult;
  manifest: () => GovernanceRegistryManifest;
};

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

export function getGovernanceRegistryManifest(): GovernanceRegistryManifest {
  return {
    foundationId: COMMERCIALIZATION_COMMERCIAL_GOVERNANCE_ID,
    version: COMMERCIALIZATION_COMMERCIAL_GOVERNANCE_VERSION,
    freezeVersion: COMMERCIALIZATION_COMMERCIAL_GOVERNANCE_FREEZE_VERSION,
    base: COMMERCIALIZATION_COMMERCIAL_GOVERNANCE_BASE,
    governanceCount: listGovernance().length,
    policyCount: listGovernancePolicies().length,
    approvalCount: listApprovalRequests().length,
    ruleCount: listApprovalRules().length,
    riskCount: listRiskAssessments().length,
    controlCount: listRiskControls().length,
    auditCount: listAuditRecords().length,
    trailCount: listAuditTrails().length,
    complianceCheckCount: listComplianceChecks().length,
    complianceStatusCount: listComplianceStatuses().length,
  };
}

export function clearCommercialGovernanceLayer(): void {
  clearComplianceStatuses();
  clearComplianceChecks();
  clearAuditTrails();
  clearAuditRecords();
  clearRiskControls();
  clearRiskAssessments();
  clearApprovalWorkflow();
  clearApprovalRules();
  clearGovernancePolicies();
  clearGovernance();
}

export function createCommercialGovernanceManager(options?: {
  managerId?: string;
}): CommercialGovernanceManager {
  const managerId =
    options?.managerId?.trim() || createId("comm-p7-gov-mgr");
  let state: GovernanceManagerStatus = "IDLE";
  let startedAt: string | undefined;
  let stoppedAt: string | undefined;

  function snapshot(): CommercialGovernanceManagerSnapshot {
    const reg = getGovernanceRegistryManifest();
    return {
      managerId,
      status: state,
      layerId: COMMERCIALIZATION_COMMERCIAL_GOVERNANCE_ID,
      version: COMMERCIALIZATION_COMMERCIAL_GOVERNANCE_VERSION,
      governanceCount: reg.governanceCount,
      approvalCount: reg.approvalCount,
      riskCount: reg.riskCount,
      auditCount: reg.auditCount,
      complianceCheckCount: reg.complianceCheckCount,
      startedAt,
      stoppedAt,
    };
  }

  function assertRunning(op: string): void {
    if (state !== "RUNNING") {
      throw new Error(`${op} requires RUNNING (current=${state})`);
    }
  }

  function initialize(): CommercialGovernanceManagerSnapshot {
    if (state !== "IDLE" && state !== "STOPPED") {
      throw new Error(
        `initialize requires IDLE or STOPPED (current=${state})`,
      );
    }
    clearCommercialGovernanceLayer();
    startedAt = undefined;
    stoppedAt = undefined;
    state = "READY";
    return snapshot();
  }

  function start(): CommercialGovernanceManagerSnapshot {
    if (state !== "READY" && state !== "STOPPED") {
      throw new Error(`start requires READY or STOPPED (current=${state})`);
    }
    state = "RUNNING";
    startedAt = nowIso();
    stoppedAt = undefined;
    return snapshot();
  }

  function stop(): CommercialGovernanceManagerSnapshot {
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
    registerGovernance: (input) => {
      assertRunning("registerGovernance");
      return registerGovernance(input);
    },
    definePolicy: (input) => {
      assertRunning("definePolicy");
      return defineGovernancePolicy(input);
    },
    defineApprovalRule: (input) => {
      assertRunning("defineApprovalRule");
      return defineApprovalRule(input);
    },
    submitApproval: (input) => {
      assertRunning("submitApproval");
      return submitApprovalRequest(input);
    },
    decideApproval: (input) => {
      assertRunning("decideApproval");
      return decideApproval(input);
    },
    evaluateApprovalAmount: (amount, ruleId) => {
      assertRunning("evaluateApprovalAmount");
      return evaluateApprovalAmount(amount, ruleId);
    },
    assessRisk: (input) => {
      assertRunning("assessRisk");
      return assessRisk(input);
    },
    applyRiskControl: (input) => {
      assertRunning("applyRiskControl");
      return applyRiskControl(input);
    },
    recordAudit: (input) => {
      assertRunning("recordAudit");
      return recordAuditEvent(input);
    },
    assembleTrail: (input) => {
      assertRunning("assembleTrail");
      return assembleAuditTrail(input);
    },
    runComplianceCheck: (input) => {
      assertRunning("runComplianceCheck");
      return runComplianceCheck(input);
    },
    evaluateCompliance: (input) => {
      assertRunning("evaluateCompliance");
      return evaluateComplianceStatus(input);
    },
    evaluateReadiness: () => {
      assertRunning("evaluateReadiness");
      return evaluateCommercialGovernanceReadiness();
    },
    manifest: getGovernanceRegistryManifest,
  };
}

export {
  assertCommercialGovernanceReadinessReady,
  getApprovalRequest,
  getApprovalRule,
  getAuditRecord,
  getAuditTrail,
  getComplianceCheck,
  getComplianceStatus,
  getGovernance,
  getGovernancePolicy,
  getRiskAssessment,
  getRiskControl,
  listApprovalDecisions,
  listApprovalRequests,
  listApprovalRules,
  listAuditRecords,
  listAuditTrails,
  listComplianceChecks,
  listComplianceStatuses,
  listGovernance,
  listGovernancePolicies,
  listRiskAssessments,
  listRiskControls,
};

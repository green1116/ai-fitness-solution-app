/**
 * Product Compliance — Governance & Compliance Manager
 */

import {
  clearComplianceAssessments,
  getComplianceAssessment,
  listComplianceAssessments,
  runComplianceAssessment,
} from "./assessment/assessment.registry";
import type {
  ComplianceAssessment,
  RunComplianceAssessmentInput,
} from "./assessment/assessment.types";
import {
  clearComplianceControls,
  defineComplianceControl,
  getComplianceControl,
  listComplianceControls,
  updateComplianceControlStatus,
} from "./control/control.registry";
import type {
  ComplianceControl,
  DefineComplianceControlInput,
  UpdateComplianceControlStatusInput,
} from "./control/control.types";
import {
  clearComplianceEvidences,
  collectComplianceEvidence,
  getComplianceEvidence,
  listComplianceEvidences,
} from "./evidence/evidence.registry";
import type {
  CollectComplianceEvidenceInput,
  ComplianceEvidence,
} from "./evidence/evidence.types";
import {
  clearComplianceFrameworks,
  getComplianceFramework,
  listComplianceFrameworks,
  registerComplianceFramework,
  updateComplianceFrameworkStatus,
} from "./framework/framework.registry";
import type {
  ComplianceFramework,
  RegisterComplianceFrameworkInput,
  UpdateComplianceFrameworkStatusInput,
} from "./framework/framework.types";
import {
  PRODUCT_COMPLIANCE_GOVERNANCE_BASE,
  PRODUCT_COMPLIANCE_GOVERNANCE_FREEZE_VERSION,
  PRODUCT_COMPLIANCE_GOVERNANCE_ID,
  PRODUCT_COMPLIANCE_GOVERNANCE_VERSION,
} from "./governance/governance.constants";
import {
  assertComplianceGovernanceReadinessReady,
  evaluateComplianceGovernanceReadiness,
} from "./governance/governance.readiness";
import type {
  ComplianceManagerStatus,
  ComplianceReadinessResult,
  ComplianceRegistryManifest,
} from "./governance/governance.types";

export type ComplianceManagerSnapshot = {
  managerId: string;
  status: ComplianceManagerStatus;
  layerId: typeof PRODUCT_COMPLIANCE_GOVERNANCE_ID;
  version: typeof PRODUCT_COMPLIANCE_GOVERNANCE_VERSION;
  frameworkCount: number;
  controlCount: number;
  evidenceCount: number;
  assessmentCount: number;
  startedAt?: string;
  stoppedAt?: string;
};

export type ComplianceManager = {
  initialize: () => ComplianceManagerSnapshot;
  start: () => ComplianceManagerSnapshot;
  stop: () => ComplianceManagerSnapshot;
  status: () => ComplianceManagerSnapshot;
  registerFramework: (
    input: RegisterComplianceFrameworkInput,
  ) => ComplianceFramework;
  updateFrameworkStatus: (
    input: UpdateComplianceFrameworkStatusInput,
  ) => ComplianceFramework;
  defineControl: (input: DefineComplianceControlInput) => ComplianceControl;
  updateControlStatus: (
    input: UpdateComplianceControlStatusInput,
  ) => ComplianceControl;
  collectEvidence: (
    input: CollectComplianceEvidenceInput,
  ) => ComplianceEvidence;
  runAssessment: (
    input: RunComplianceAssessmentInput,
  ) => ComplianceAssessment;
  evaluateReadiness: () => ComplianceReadinessResult;
  manifest: () => ComplianceRegistryManifest;
};

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

export function getComplianceRegistryManifest(): ComplianceRegistryManifest {
  return {
    governanceId: PRODUCT_COMPLIANCE_GOVERNANCE_ID,
    version: PRODUCT_COMPLIANCE_GOVERNANCE_VERSION,
    freezeVersion: PRODUCT_COMPLIANCE_GOVERNANCE_FREEZE_VERSION,
    base: PRODUCT_COMPLIANCE_GOVERNANCE_BASE,
    frameworkCount: listComplianceFrameworks().length,
    controlCount: listComplianceControls().length,
    evidenceCount: listComplianceEvidences().length,
    assessmentCount: listComplianceAssessments().length,
  };
}

export function clearComplianceGovernanceLayer(): void {
  clearComplianceAssessments();
  clearComplianceEvidences();
  clearComplianceControls();
  clearComplianceFrameworks();
}

export function createComplianceManager(options?: {
  managerId?: string;
}): ComplianceManager {
  const managerId =
    options?.managerId?.trim() || createId("prod-cmp-mgr");
  let state: ComplianceManagerStatus = "IDLE";
  let startedAt: string | undefined;
  let stoppedAt: string | undefined;

  function snapshot(): ComplianceManagerSnapshot {
    const reg = getComplianceRegistryManifest();
    return {
      managerId,
      status: state,
      layerId: PRODUCT_COMPLIANCE_GOVERNANCE_ID,
      version: PRODUCT_COMPLIANCE_GOVERNANCE_VERSION,
      frameworkCount: reg.frameworkCount,
      controlCount: reg.controlCount,
      evidenceCount: reg.evidenceCount,
      assessmentCount: reg.assessmentCount,
      startedAt,
      stoppedAt,
    };
  }

  function assertRunning(op: string): void {
    if (state !== "RUNNING") {
      throw new Error(`${op} requires RUNNING (current=${state})`);
    }
  }

  function initialize(): ComplianceManagerSnapshot {
    if (state !== "IDLE" && state !== "STOPPED") {
      throw new Error(
        `initialize requires IDLE or STOPPED (current=${state})`,
      );
    }
    clearComplianceGovernanceLayer();
    startedAt = undefined;
    stoppedAt = undefined;
    state = "READY";
    return snapshot();
  }

  function start(): ComplianceManagerSnapshot {
    if (state !== "READY" && state !== "STOPPED") {
      throw new Error(`start requires READY or STOPPED (current=${state})`);
    }
    state = "RUNNING";
    startedAt = nowIso();
    stoppedAt = undefined;
    return snapshot();
  }

  function stop(): ComplianceManagerSnapshot {
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
    registerFramework: (input) => {
      assertRunning("registerFramework");
      return registerComplianceFramework(input);
    },
    updateFrameworkStatus: (input) => {
      assertRunning("updateFrameworkStatus");
      return updateComplianceFrameworkStatus(input);
    },
    defineControl: (input) => {
      assertRunning("defineControl");
      return defineComplianceControl(input);
    },
    updateControlStatus: (input) => {
      assertRunning("updateControlStatus");
      return updateComplianceControlStatus(input);
    },
    collectEvidence: (input) => {
      assertRunning("collectEvidence");
      return collectComplianceEvidence(input);
    },
    runAssessment: (input) => {
      assertRunning("runAssessment");
      return runComplianceAssessment(input);
    },
    evaluateReadiness: () => {
      assertRunning("evaluateReadiness");
      return evaluateComplianceGovernanceReadiness();
    },
    manifest: getComplianceRegistryManifest,
  };
}

export {
  assertComplianceGovernanceReadinessReady,
  getComplianceAssessment,
  getComplianceControl,
  getComplianceEvidence,
  getComplianceFramework,
  listComplianceAssessments,
  listComplianceControls,
  listComplianceEvidences,
  listComplianceFrameworks,
};

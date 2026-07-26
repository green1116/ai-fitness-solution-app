/**
 * Product Integration Governance — Manager
 */

import {
  clearIntegrationGovernanceCompliances,
  getIntegrationGovernanceCompliance,
  listIntegrationGovernanceCompliances,
  recordIntegrationGovernanceCompliance,
} from "./compliance/compliance.registry";
import type {
  IntegrationGovernanceCompliance,
  RecordIntegrationGovernanceComplianceInput,
} from "./compliance/compliance.types";
import {
  clearIntegrationGovernanceReleaseManifests,
  createIntegrationGovernanceReleaseManifest,
  getIntegrationGovernanceReleaseManifest,
  listIntegrationGovernanceReleaseManifests,
  type IntegrationGovernanceReleaseManifest,
} from "./manifest/manifest.registry";
import {
  PRODUCT_INTEGRATION_GOVERNANCE_BASE,
  PRODUCT_INTEGRATION_GOVERNANCE_FREEZE_VERSION,
  PRODUCT_INTEGRATION_GOVERNANCE_ID,
  PRODUCT_INTEGRATION_GOVERNANCE_VERSION,
} from "./management/management.constants";
import {
  assertIntegrationGovernanceReadinessReady,
  evaluateIntegrationGovernanceReadiness,
} from "./management/management.readiness";
import type {
  IntegrationGovernanceManagerStatus,
  IntegrationGovernanceReadinessResult,
  IntegrationGovernanceRegistryManifest,
} from "./management/management.types";
import {
  clearIntegrationGovernancePolicies,
  getIntegrationGovernancePolicy,
  listIntegrationGovernancePolicies,
  registerIntegrationGovernancePolicy,
  updateIntegrationGovernancePolicyStatus,
} from "./policy/policy.registry";
import type {
  IntegrationGovernancePolicy,
  RegisterIntegrationGovernancePolicyInput,
  UpdateIntegrationGovernancePolicyStatusInput,
} from "./policy/policy.types";
import {
  clearIntegrationGovernanceReviews,
  getIntegrationGovernanceReview,
  listIntegrationGovernanceReviews,
  recordIntegrationGovernanceReview,
} from "./review/review.registry";
import type {
  IntegrationGovernanceReview,
  RecordIntegrationGovernanceReviewInput,
} from "./review/review.types";
import {
  clearIntegrationGovernanceStandards,
  getIntegrationGovernanceStandard,
  listIntegrationGovernanceStandards,
  registerIntegrationGovernanceStandard,
} from "./standard/standard.registry";
import type {
  IntegrationGovernanceStandard,
  RegisterIntegrationGovernanceStandardInput,
} from "./standard/standard.types";

export type IntegrationGovernanceManagerSnapshot = {
  managerId: string;
  status: IntegrationGovernanceManagerStatus;
  layerId: typeof PRODUCT_INTEGRATION_GOVERNANCE_ID;
  version: typeof PRODUCT_INTEGRATION_GOVERNANCE_VERSION;
  policyCount: number;
  standardCount: number;
  reviewCount: number;
  complianceCount: number;
  releaseCount: number;
  startedAt?: string;
  stoppedAt?: string;
};

export type IntegrationGovernanceManager = {
  initialize: () => IntegrationGovernanceManagerSnapshot;
  start: () => IntegrationGovernanceManagerSnapshot;
  stop: () => IntegrationGovernanceManagerSnapshot;
  status: () => IntegrationGovernanceManagerSnapshot;
  registerPolicy: (
    input: RegisterIntegrationGovernancePolicyInput,
  ) => IntegrationGovernancePolicy;
  updatePolicyStatus: (
    input: UpdateIntegrationGovernancePolicyStatusInput,
  ) => IntegrationGovernancePolicy;
  registerStandard: (
    input: RegisterIntegrationGovernanceStandardInput,
  ) => IntegrationGovernanceStandard;
  recordReview: (
    input: RecordIntegrationGovernanceReviewInput,
  ) => IntegrationGovernanceReview;
  recordCompliance: (
    input: RecordIntegrationGovernanceComplianceInput,
  ) => IntegrationGovernanceCompliance;
  createReleaseManifest: (input: {
    id?: string;
    policyId: string;
  }) => IntegrationGovernanceReleaseManifest;
  evaluateReadiness: () => IntegrationGovernanceReadinessResult;
  manifest: () => IntegrationGovernanceRegistryManifest;
};

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

export function getIntegrationGovernanceRegistryManifest(): IntegrationGovernanceRegistryManifest {
  return {
    governanceId: PRODUCT_INTEGRATION_GOVERNANCE_ID,
    version: PRODUCT_INTEGRATION_GOVERNANCE_VERSION,
    freezeVersion: PRODUCT_INTEGRATION_GOVERNANCE_FREEZE_VERSION,
    base: PRODUCT_INTEGRATION_GOVERNANCE_BASE,
    policyCount: listIntegrationGovernancePolicies().length,
    standardCount: listIntegrationGovernanceStandards().length,
    reviewCount: listIntegrationGovernanceReviews().length,
    complianceCount: listIntegrationGovernanceCompliances().length,
    releaseCount: listIntegrationGovernanceReleaseManifests().length,
  };
}

export function clearIntegrationGovernanceLayer(): void {
  clearIntegrationGovernanceReleaseManifests();
  clearIntegrationGovernanceCompliances();
  clearIntegrationGovernanceReviews();
  clearIntegrationGovernanceStandards();
  clearIntegrationGovernancePolicies();
}

export function createIntegrationGovernanceManager(options?: {
  managerId?: string;
}): IntegrationGovernanceManager {
  const managerId =
    options?.managerId?.trim() || createId("prod-igov-mgr");
  let state: IntegrationGovernanceManagerStatus = "IDLE";
  let startedAt: string | undefined;
  let stoppedAt: string | undefined;

  function snapshot(): IntegrationGovernanceManagerSnapshot {
    const reg = getIntegrationGovernanceRegistryManifest();
    return {
      managerId,
      status: state,
      layerId: PRODUCT_INTEGRATION_GOVERNANCE_ID,
      version: PRODUCT_INTEGRATION_GOVERNANCE_VERSION,
      policyCount: reg.policyCount,
      standardCount: reg.standardCount,
      reviewCount: reg.reviewCount,
      complianceCount: reg.complianceCount,
      releaseCount: reg.releaseCount,
      startedAt,
      stoppedAt,
    };
  }

  function assertRunning(op: string): void {
    if (state !== "RUNNING") {
      throw new Error(`${op} requires RUNNING (current=${state})`);
    }
  }

  function initialize(): IntegrationGovernanceManagerSnapshot {
    if (state !== "IDLE" && state !== "STOPPED") {
      throw new Error(
        `initialize requires IDLE or STOPPED (current=${state})`,
      );
    }
    clearIntegrationGovernanceLayer();
    startedAt = undefined;
    stoppedAt = undefined;
    state = "READY";
    return snapshot();
  }

  function start(): IntegrationGovernanceManagerSnapshot {
    if (state !== "READY" && state !== "STOPPED") {
      throw new Error(`start requires READY or STOPPED (current=${state})`);
    }
    state = "RUNNING";
    startedAt = nowIso();
    stoppedAt = undefined;
    return snapshot();
  }

  function stop(): IntegrationGovernanceManagerSnapshot {
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
    registerPolicy: (input) => {
      assertRunning("registerPolicy");
      return registerIntegrationGovernancePolicy(input);
    },
    updatePolicyStatus: (input) => {
      assertRunning("updatePolicyStatus");
      return updateIntegrationGovernancePolicyStatus(input);
    },
    registerStandard: (input) => {
      assertRunning("registerStandard");
      return registerIntegrationGovernanceStandard(input);
    },
    recordReview: (input) => {
      assertRunning("recordReview");
      return recordIntegrationGovernanceReview(input);
    },
    recordCompliance: (input) => {
      assertRunning("recordCompliance");
      return recordIntegrationGovernanceCompliance(input);
    },
    createReleaseManifest: (input) => {
      assertRunning("createReleaseManifest");
      return createIntegrationGovernanceReleaseManifest(input);
    },
    evaluateReadiness: () => {
      assertRunning("evaluateReadiness");
      return evaluateIntegrationGovernanceReadiness();
    },
    manifest: getIntegrationGovernanceRegistryManifest,
  };
}

export {
  assertIntegrationGovernanceReadinessReady,
  getIntegrationGovernanceCompliance,
  getIntegrationGovernancePolicy,
  getIntegrationGovernanceReleaseManifest,
  getIntegrationGovernanceReview,
  getIntegrationGovernanceStandard,
  listIntegrationGovernanceCompliances,
  listIntegrationGovernancePolicies,
  listIntegrationGovernanceReleaseManifests,
  listIntegrationGovernanceReviews,
  listIntegrationGovernanceStandards,
};

/**
 * Product API Governance — Manager
 */

import {
  clearGovernanceCompliances,
  getGovernanceCompliance,
  listGovernanceCompliances,
  recordGovernanceCompliance,
} from "./compliance/compliance.registry";
import type {
  GovernanceCompliance,
  RecordGovernanceComplianceInput,
} from "./compliance/compliance.types";
import {
  clearApiGovernanceReleaseManifests,
  createApiGovernanceReleaseManifest,
  getApiGovernanceReleaseManifest,
  listApiGovernanceReleaseManifests,
  type ApiGovernanceReleaseManifest,
} from "./manifest/manifest.registry";
import {
  PRODUCT_API_GOVERNANCE_BASE,
  PRODUCT_API_GOVERNANCE_FREEZE_VERSION,
  PRODUCT_API_GOVERNANCE_ID,
  PRODUCT_API_GOVERNANCE_VERSION,
} from "./management/management.constants";
import {
  assertApiGovernanceReadinessReady,
  evaluateApiGovernanceReadiness,
} from "./management/management.readiness";
import type {
  GovernanceManagerStatus,
  GovernanceReadinessResult,
  GovernanceRegistryManifest,
} from "./management/management.types";
import {
  clearGovernancePolicies,
  getGovernancePolicy,
  listGovernancePolicies,
  registerGovernancePolicy,
  updateGovernancePolicyStatus,
} from "./policy/policy.registry";
import type {
  GovernancePolicy,
  RegisterGovernancePolicyInput,
  UpdateGovernancePolicyStatusInput,
} from "./policy/policy.types";
import {
  clearGovernanceReviews,
  getGovernanceReview,
  listGovernanceReviews,
  recordGovernanceReview,
} from "./review/review.registry";
import type {
  GovernanceReview,
  RecordGovernanceReviewInput,
} from "./review/review.types";
import {
  clearGovernanceStandards,
  getGovernanceStandard,
  listGovernanceStandards,
  registerGovernanceStandard,
} from "./standard/standard.registry";
import type {
  GovernanceStandard,
  RegisterGovernanceStandardInput,
} from "./standard/standard.types";

export type GovernanceManagerSnapshot = {
  managerId: string;
  status: GovernanceManagerStatus;
  layerId: typeof PRODUCT_API_GOVERNANCE_ID;
  version: typeof PRODUCT_API_GOVERNANCE_VERSION;
  policyCount: number;
  standardCount: number;
  reviewCount: number;
  complianceCount: number;
  releaseCount: number;
  startedAt?: string;
  stoppedAt?: string;
};

export type ApiGovernanceManager = {
  initialize: () => GovernanceManagerSnapshot;
  start: () => GovernanceManagerSnapshot;
  stop: () => GovernanceManagerSnapshot;
  status: () => GovernanceManagerSnapshot;
  registerPolicy: (input: RegisterGovernancePolicyInput) => GovernancePolicy;
  updatePolicyStatus: (
    input: UpdateGovernancePolicyStatusInput,
  ) => GovernancePolicy;
  registerStandard: (
    input: RegisterGovernanceStandardInput,
  ) => GovernanceStandard;
  recordReview: (input: RecordGovernanceReviewInput) => GovernanceReview;
  recordCompliance: (
    input: RecordGovernanceComplianceInput,
  ) => GovernanceCompliance;
  createReleaseManifest: (input: {
    id?: string;
    policyId: string;
  }) => ApiGovernanceReleaseManifest;
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

export function getApiGovernanceRegistryManifest(): GovernanceRegistryManifest {
  return {
    governanceId: PRODUCT_API_GOVERNANCE_ID,
    version: PRODUCT_API_GOVERNANCE_VERSION,
    freezeVersion: PRODUCT_API_GOVERNANCE_FREEZE_VERSION,
    base: PRODUCT_API_GOVERNANCE_BASE,
    policyCount: listGovernancePolicies().length,
    standardCount: listGovernanceStandards().length,
    reviewCount: listGovernanceReviews().length,
    complianceCount: listGovernanceCompliances().length,
    releaseCount: listApiGovernanceReleaseManifests().length,
  };
}

export function clearApiGovernanceLayer(): void {
  clearApiGovernanceReleaseManifests();
  clearGovernanceCompliances();
  clearGovernanceReviews();
  clearGovernanceStandards();
  clearGovernancePolicies();
}

export function createApiGovernanceManager(options?: {
  managerId?: string;
}): ApiGovernanceManager {
  const managerId =
    options?.managerId?.trim() || createId("prod-apigov-mgr");
  let state: GovernanceManagerStatus = "IDLE";
  let startedAt: string | undefined;
  let stoppedAt: string | undefined;

  function snapshot(): GovernanceManagerSnapshot {
    const reg = getApiGovernanceRegistryManifest();
    return {
      managerId,
      status: state,
      layerId: PRODUCT_API_GOVERNANCE_ID,
      version: PRODUCT_API_GOVERNANCE_VERSION,
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

  function initialize(): GovernanceManagerSnapshot {
    if (state !== "IDLE" && state !== "STOPPED") {
      throw new Error(
        `initialize requires IDLE or STOPPED (current=${state})`,
      );
    }
    clearApiGovernanceLayer();
    startedAt = undefined;
    stoppedAt = undefined;
    state = "READY";
    return snapshot();
  }

  function start(): GovernanceManagerSnapshot {
    if (state !== "READY" && state !== "STOPPED") {
      throw new Error(`start requires READY or STOPPED (current=${state})`);
    }
    state = "RUNNING";
    startedAt = nowIso();
    stoppedAt = undefined;
    return snapshot();
  }

  function stop(): GovernanceManagerSnapshot {
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
      return registerGovernancePolicy(input);
    },
    updatePolicyStatus: (input) => {
      assertRunning("updatePolicyStatus");
      return updateGovernancePolicyStatus(input);
    },
    registerStandard: (input) => {
      assertRunning("registerStandard");
      return registerGovernanceStandard(input);
    },
    recordReview: (input) => {
      assertRunning("recordReview");
      return recordGovernanceReview(input);
    },
    recordCompliance: (input) => {
      assertRunning("recordCompliance");
      return recordGovernanceCompliance(input);
    },
    createReleaseManifest: (input) => {
      assertRunning("createReleaseManifest");
      return createApiGovernanceReleaseManifest(input);
    },
    evaluateReadiness: () => {
      assertRunning("evaluateReadiness");
      return evaluateApiGovernanceReadiness();
    },
    manifest: getApiGovernanceRegistryManifest,
  };
}

export {
  assertApiGovernanceReadinessReady,
  getApiGovernanceReleaseManifest,
  getGovernanceCompliance,
  getGovernancePolicy,
  getGovernanceReview,
  getGovernanceStandard,
  listApiGovernanceReleaseManifests,
  listGovernanceCompliances,
  listGovernancePolicies,
  listGovernanceReviews,
  listGovernanceStandards,
};

/**
 * Product MFA — Multi-Factor Authentication Manager
 */

import {
  assertFactor,
  clearAssertions,
  getAssertion,
  listAssertions,
} from "./assertion/assertion.registry";
import type {
  AssertFactorInput,
  MfaAssertion,
} from "./assertion/assertion.types";
import {
  clearChallenges,
  getChallenge,
  issueChallenge,
  listChallenges,
  resolveChallenge,
} from "./challenge/challenge.registry";
import type {
  IssueChallengeInput,
  MfaChallenge,
  ResolveChallengeInput,
} from "./challenge/challenge.types";
import {
  activateEnrollment,
  clearEnrollments,
  disableEnrollment,
  enrollFactor,
  getEnrollment,
  listEnrollments,
} from "./enrollment/enrollment.registry";
import type {
  ActivateEnrollmentInput,
  DisableEnrollmentInput,
  EnrollFactorInput,
  MfaEnrollment,
} from "./enrollment/enrollment.types";
import {
  PRODUCT_MFA_SECURITY_BASE,
  PRODUCT_MFA_SECURITY_FREEZE_VERSION,
  PRODUCT_MFA_SECURITY_ID,
  PRODUCT_MFA_SECURITY_VERSION,
} from "./factor/factor.constants";
import {
  assertMfaSecurityReadinessReady,
  evaluateMfaSecurityReadiness,
} from "./factor/factor.readiness";
import type {
  MfaManagerStatus,
  MfaReadinessResult,
  MfaRegistryManifest,
} from "./factor/factor.types";
import {
  clearRecoveryCodes,
  consumeRecoveryCode,
  getRecoveryCode,
  issueRecoveryCodes,
  listRecoveryCodes,
} from "./recovery/recovery.registry";
import type {
  ConsumeRecoveryCodeInput,
  IssueRecoveryCodesInput,
  MfaRecoveryCode,
} from "./recovery/recovery.types";

export type MfaManagerSnapshot = {
  managerId: string;
  status: MfaManagerStatus;
  layerId: typeof PRODUCT_MFA_SECURITY_ID;
  version: typeof PRODUCT_MFA_SECURITY_VERSION;
  enrollmentCount: number;
  challengeCount: number;
  assertionCount: number;
  recoveryCount: number;
  startedAt?: string;
  stoppedAt?: string;
};

export type MfaManager = {
  initialize: () => MfaManagerSnapshot;
  start: () => MfaManagerSnapshot;
  stop: () => MfaManagerSnapshot;
  status: () => MfaManagerSnapshot;
  enrollFactor: (input: EnrollFactorInput) => MfaEnrollment;
  activateEnrollment: (input: ActivateEnrollmentInput) => MfaEnrollment;
  disableEnrollment: (input: DisableEnrollmentInput) => MfaEnrollment;
  issueChallenge: (input: IssueChallengeInput) => MfaChallenge;
  resolveChallenge: (input: ResolveChallengeInput) => MfaChallenge;
  assertFactor: (input: AssertFactorInput) => MfaAssertion;
  issueRecoveryCodes: (input: IssueRecoveryCodesInput) => MfaRecoveryCode[];
  consumeRecoveryCode: (input: ConsumeRecoveryCodeInput) => MfaRecoveryCode;
  evaluateReadiness: () => MfaReadinessResult;
  manifest: () => MfaRegistryManifest;
};

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

export function getMfaRegistryManifest(): MfaRegistryManifest {
  return {
    foundationId: PRODUCT_MFA_SECURITY_ID,
    version: PRODUCT_MFA_SECURITY_VERSION,
    freezeVersion: PRODUCT_MFA_SECURITY_FREEZE_VERSION,
    base: PRODUCT_MFA_SECURITY_BASE,
    enrollmentCount: listEnrollments().length,
    challengeCount: listChallenges().length,
    assertionCount: listAssertions().length,
    recoveryCount: listRecoveryCodes().length,
  };
}

export function clearMfaSecurityLayer(): void {
  clearAssertions();
  clearChallenges();
  clearRecoveryCodes();
  clearEnrollments();
}

export function createMfaManager(options?: {
  managerId?: string;
}): MfaManager {
  const managerId =
    options?.managerId?.trim() || createId("prod-mfa-mgr");
  let state: MfaManagerStatus = "IDLE";
  let startedAt: string | undefined;
  let stoppedAt: string | undefined;

  function snapshot(): MfaManagerSnapshot {
    const reg = getMfaRegistryManifest();
    return {
      managerId,
      status: state,
      layerId: PRODUCT_MFA_SECURITY_ID,
      version: PRODUCT_MFA_SECURITY_VERSION,
      enrollmentCount: reg.enrollmentCount,
      challengeCount: reg.challengeCount,
      assertionCount: reg.assertionCount,
      recoveryCount: reg.recoveryCount,
      startedAt,
      stoppedAt,
    };
  }

  function assertRunning(op: string): void {
    if (state !== "RUNNING") {
      throw new Error(`${op} requires RUNNING (current=${state})`);
    }
  }

  function initialize(): MfaManagerSnapshot {
    if (state !== "IDLE" && state !== "STOPPED") {
      throw new Error(
        `initialize requires IDLE or STOPPED (current=${state})`,
      );
    }
    clearMfaSecurityLayer();
    startedAt = undefined;
    stoppedAt = undefined;
    state = "READY";
    return snapshot();
  }

  function start(): MfaManagerSnapshot {
    if (state !== "READY" && state !== "STOPPED") {
      throw new Error(`start requires READY or STOPPED (current=${state})`);
    }
    state = "RUNNING";
    startedAt = nowIso();
    stoppedAt = undefined;
    return snapshot();
  }

  function stop(): MfaManagerSnapshot {
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
    enrollFactor: (input) => {
      assertRunning("enrollFactor");
      return enrollFactor(input);
    },
    activateEnrollment: (input) => {
      assertRunning("activateEnrollment");
      return activateEnrollment(input);
    },
    disableEnrollment: (input) => {
      assertRunning("disableEnrollment");
      return disableEnrollment(input);
    },
    issueChallenge: (input) => {
      assertRunning("issueChallenge");
      return issueChallenge(input);
    },
    resolveChallenge: (input) => {
      assertRunning("resolveChallenge");
      return resolveChallenge(input);
    },
    assertFactor: (input) => {
      assertRunning("assertFactor");
      return assertFactor(input);
    },
    issueRecoveryCodes: (input) => {
      assertRunning("issueRecoveryCodes");
      return issueRecoveryCodes(input);
    },
    consumeRecoveryCode: (input) => {
      assertRunning("consumeRecoveryCode");
      return consumeRecoveryCode(input);
    },
    evaluateReadiness: () => {
      assertRunning("evaluateReadiness");
      return evaluateMfaSecurityReadiness();
    },
    manifest: getMfaRegistryManifest,
  };
}

export {
  assertMfaSecurityReadinessReady,
  getAssertion,
  getChallenge,
  getEnrollment,
  getRecoveryCode,
  listAssertions,
  listChallenges,
  listEnrollments,
  listRecoveryCodes,
};

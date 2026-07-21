/**
 * Launch P4 — Security Readiness Manager
 */

import { getDemoRegistryManifest } from "../demo/demo.manager";
import { getLaunchRegistryManifest } from "../launch.manager";
import {
  clearAccessReviews,
  getAccessReview,
  listAccessReviews,
  startAccessReview,
} from "./security.access";
import {
  clearAuditValidations,
  getAuditValidation,
  listAuditValidations,
  validateAuditTrail,
} from "./security.audit";
import {
  clearComplianceChecklists,
  createComplianceChecklist,
  getComplianceChecklist,
  listComplianceChecklists,
  markRequiredCompliancePassed,
  setComplianceItem,
} from "./security.compliance";
import {
  LAUNCH_SECURITY_READINESS_BASE,
  LAUNCH_SECURITY_READINESS_FREEZE_VERSION,
  LAUNCH_SECURITY_READINESS_ID,
  LAUNCH_SECURITY_READINESS_VERSION,
} from "./security.constants";
import {
  clearSecurityProfiles,
  createSecurityProfile,
  getSecurityProfile,
  listSecurityProfiles,
  setSecurityProfileStatus,
} from "./security.profile";
import {
  assertSecurityReadinessReady,
  evaluateSecurityReadiness,
} from "./security.readiness";
import type {
  AccessReview,
  AuditValidationResult,
  ComplianceChecklist,
  CreateComplianceChecklistInput,
  CreateSecurityProfileInput,
  SecurityManagerStatus,
  SecurityProfile,
  SecurityReadinessResult,
  SecurityRegistryManifest,
  SetComplianceItemInput,
  StartAccessReviewInput,
  ValidateAuditInput,
} from "./security.types";

export type SecurityManagerSnapshot = {
  managerId: string;
  status: SecurityManagerStatus;
  layerId: typeof LAUNCH_SECURITY_READINESS_ID;
  version: typeof LAUNCH_SECURITY_READINESS_VERSION;
  profileCount: number;
  accessReviewCount: number;
  checklistCount: number;
  auditValidationCount: number;
  launchProfileCount: number;
  demoTenantCount: number;
  startedAt?: string;
  stoppedAt?: string;
};

export type SecurityReadinessManager = {
  initialize: () => SecurityManagerSnapshot;
  start: () => SecurityManagerSnapshot;
  stop: () => SecurityManagerSnapshot;
  status: () => SecurityManagerSnapshot;
  createProfile: (input: CreateSecurityProfileInput) => SecurityProfile;
  getProfile: typeof getSecurityProfile;
  listProfiles: typeof listSecurityProfiles;
  setProfileStatus: typeof setSecurityProfileStatus;
  startAccessReview: (input: StartAccessReviewInput) => AccessReview;
  getAccessReview: typeof getAccessReview;
  listAccessReviews: typeof listAccessReviews;
  createChecklist: (
    input: CreateComplianceChecklistInput,
  ) => ComplianceChecklist;
  setChecklistItem: (input: SetComplianceItemInput) => ComplianceChecklist;
  markChecklistPassed: typeof markRequiredCompliancePassed;
  getChecklist: typeof getComplianceChecklist;
  listChecklists: typeof listComplianceChecklists;
  validateAudit: (input: ValidateAuditInput) => AuditValidationResult;
  getAuditValidation: typeof getAuditValidation;
  listAuditValidations: typeof listAuditValidations;
  evaluateReadiness: (securityProfileId: string) => SecurityReadinessResult;
  manifest: () => SecurityRegistryManifest;
};

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

export function getSecurityRegistryManifest(): SecurityRegistryManifest {
  return {
    securityReadinessId: LAUNCH_SECURITY_READINESS_ID,
    version: LAUNCH_SECURITY_READINESS_VERSION,
    freezeVersion: LAUNCH_SECURITY_READINESS_FREEZE_VERSION,
    base: LAUNCH_SECURITY_READINESS_BASE,
    profileCount: listSecurityProfiles().length,
    accessReviewCount: listAccessReviews().length,
    checklistCount: listComplianceChecklists().length,
    auditValidationCount: listAuditValidations().length,
  };
}

export function clearSecurityLayer(): void {
  clearAuditValidations();
  clearComplianceChecklists();
  clearAccessReviews();
  clearSecurityProfiles();
}

export function createSecurityReadinessManager(options?: {
  managerId?: string;
}): SecurityReadinessManager {
  const managerId =
    options?.managerId?.trim() || createId("launch-p4-mgr");
  let state: SecurityManagerStatus = "IDLE";
  let startedAt: string | undefined;
  let stoppedAt: string | undefined;

  function snapshot(): SecurityManagerSnapshot {
    const launchReg = getLaunchRegistryManifest();
    const demoReg = getDemoRegistryManifest();
    const reg = getSecurityRegistryManifest();
    return {
      managerId,
      status: state,
      layerId: LAUNCH_SECURITY_READINESS_ID,
      version: LAUNCH_SECURITY_READINESS_VERSION,
      profileCount: reg.profileCount,
      accessReviewCount: reg.accessReviewCount,
      checklistCount: reg.checklistCount,
      auditValidationCount: reg.auditValidationCount,
      launchProfileCount: launchReg.profileCount,
      demoTenantCount: demoReg.tenantCount,
      startedAt,
      stoppedAt,
    };
  }

  function assertRunning(op: string): void {
    if (state !== "RUNNING") {
      throw new Error(`${op} requires RUNNING (current=${state})`);
    }
  }

  function initialize(): SecurityManagerSnapshot {
    if (state !== "IDLE" && state !== "STOPPED") {
      throw new Error(
        `initialize requires IDLE or STOPPED (current=${state})`,
      );
    }
    clearSecurityLayer();
    startedAt = undefined;
    stoppedAt = undefined;
    state = "READY";
    return snapshot();
  }

  function start(): SecurityManagerSnapshot {
    if (state !== "READY" && state !== "STOPPED") {
      throw new Error(`start requires READY or STOPPED (current=${state})`);
    }
    state = "RUNNING";
    startedAt = nowIso();
    stoppedAt = undefined;
    return snapshot();
  }

  function stop(): SecurityManagerSnapshot {
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
    createProfile: (input) => {
      assertRunning("createProfile");
      return createSecurityProfile(input);
    },
    getProfile: getSecurityProfile,
    listProfiles: listSecurityProfiles,
    setProfileStatus: (id, status) => {
      assertRunning("setProfileStatus");
      return setSecurityProfileStatus(id, status);
    },
    startAccessReview: (input) => {
      assertRunning("startAccessReview");
      return startAccessReview(input);
    },
    getAccessReview,
    listAccessReviews,
    createChecklist: (input) => {
      assertRunning("createChecklist");
      return createComplianceChecklist(input);
    },
    setChecklistItem: (input) => {
      assertRunning("setChecklistItem");
      return setComplianceItem(input);
    },
    markChecklistPassed: (checklistId) => {
      assertRunning("markChecklistPassed");
      return markRequiredCompliancePassed(checklistId);
    },
    getChecklist: getComplianceChecklist,
    listChecklists: listComplianceChecklists,
    validateAudit: (input) => {
      assertRunning("validateAudit");
      return validateAuditTrail(input);
    },
    getAuditValidation,
    listAuditValidations,
    evaluateReadiness: (securityProfileId) => {
      assertRunning("evaluateReadiness");
      return evaluateSecurityReadiness(securityProfileId);
    },
    manifest: getSecurityRegistryManifest,
  };
}

export { assertSecurityReadinessReady };

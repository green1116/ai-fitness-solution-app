/**
 * Launch P5 — SLA Support Package Manager
 */

import { getSecurityRegistryManifest } from "../security/security.manager";
import { getLaunchRegistryManifest } from "../launch.manager";
import {
  LAUNCH_SLA_SUPPORT_BASE,
  LAUNCH_SLA_SUPPORT_FREEZE_VERSION,
  LAUNCH_SLA_SUPPORT_ID,
  LAUNCH_SLA_SUPPORT_VERSION,
} from "./support.constants";
import {
  advanceSupportIncident,
  activateSupportSlaProfile,
  clearSupportIncidents,
  getSupportIncident,
  listSupportIncidents,
  openSupportIncident,
  resolveSupportIncident,
} from "./support.incident";
import { computeSupportResponseMetrics } from "./support.metrics";
import {
  clearSupportPolicies,
  createSupportPolicy,
  getSupportPolicy,
  listSupportPolicies,
} from "./support.policy";
import {
  bindSupportTier,
  clearSupportSlaProfiles,
  createSupportSlaProfile,
  getSupportSlaProfile,
  listSupportSlaProfiles,
  setSupportSlaProfileStatus,
} from "./support.profile";
import {
  assertSupportReadinessReady,
  evaluateSupportReadiness,
} from "./support.readiness";
import {
  clearSupportTiers,
  createSupportTier,
  getSupportTier,
  listSupportTiers,
} from "./support.tier";
import type {
  AdvanceIncidentInput,
  CreateSupportPolicyInput,
  CreateSupportSlaProfileInput,
  CreateSupportTierInput,
  OpenIncidentInput,
  SupportIncident,
  SupportManagerStatus,
  SupportPolicy,
  SupportReadinessResult,
  SupportRegistryManifest,
  SupportResponseMetrics,
  SupportSlaProfile,
  SupportTierDefinition,
} from "./support.types";

export type SupportManagerSnapshot = {
  managerId: string;
  status: SupportManagerStatus;
  layerId: typeof LAUNCH_SLA_SUPPORT_ID;
  version: typeof LAUNCH_SLA_SUPPORT_VERSION;
  profileCount: number;
  tierCount: number;
  incidentCount: number;
  policyCount: number;
  launchProfileCount: number;
  securityProfileCount: number;
  startedAt?: string;
  stoppedAt?: string;
};

export type SlaSupportPackageManager = {
  initialize: () => SupportManagerSnapshot;
  start: () => SupportManagerSnapshot;
  stop: () => SupportManagerSnapshot;
  status: () => SupportManagerSnapshot;
  createTier: (input: CreateSupportTierInput) => SupportTierDefinition;
  getTier: typeof getSupportTier;
  listTiers: typeof listSupportTiers;
  createProfile: (input: CreateSupportSlaProfileInput) => SupportSlaProfile;
  bindTier: (profileId: string, supportTierId: string) => SupportSlaProfile;
  activateProfile: typeof activateSupportSlaProfile;
  setProfileStatus: typeof setSupportSlaProfileStatus;
  getProfile: typeof getSupportSlaProfile;
  listProfiles: typeof listSupportSlaProfiles;
  createPolicy: (input: CreateSupportPolicyInput) => SupportPolicy;
  getPolicy: typeof getSupportPolicy;
  listPolicies: typeof listSupportPolicies;
  openIncident: (input: OpenIncidentInput) => SupportIncident;
  advanceIncident: (input: AdvanceIncidentInput) => SupportIncident;
  resolveIncident: (incidentId: string, detail?: string) => SupportIncident;
  getIncident: typeof getSupportIncident;
  listIncidents: typeof listSupportIncidents;
  computeMetrics: (supportSlaProfileId: string) => SupportResponseMetrics;
  evaluateReadiness: (supportSlaProfileId: string) => SupportReadinessResult;
  manifest: () => SupportRegistryManifest;
};

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

export function getSupportRegistryManifest(): SupportRegistryManifest {
  return {
    slaSupportId: LAUNCH_SLA_SUPPORT_ID,
    version: LAUNCH_SLA_SUPPORT_VERSION,
    freezeVersion: LAUNCH_SLA_SUPPORT_FREEZE_VERSION,
    base: LAUNCH_SLA_SUPPORT_BASE,
    profileCount: listSupportSlaProfiles().length,
    tierCount: listSupportTiers().length,
    incidentCount: listSupportIncidents().length,
    policyCount: listSupportPolicies().length,
  };
}

export function clearSupportLayer(): void {
  clearSupportIncidents();
  clearSupportPolicies();
  clearSupportSlaProfiles();
  clearSupportTiers();
}

export function createSlaSupportPackageManager(options?: {
  managerId?: string;
}): SlaSupportPackageManager {
  const managerId =
    options?.managerId?.trim() || createId("launch-p5-mgr");
  let state: SupportManagerStatus = "IDLE";
  let startedAt: string | undefined;
  let stoppedAt: string | undefined;

  function snapshot(): SupportManagerSnapshot {
    const launchReg = getLaunchRegistryManifest();
    const securityReg = getSecurityRegistryManifest();
    const reg = getSupportRegistryManifest();
    return {
      managerId,
      status: state,
      layerId: LAUNCH_SLA_SUPPORT_ID,
      version: LAUNCH_SLA_SUPPORT_VERSION,
      profileCount: reg.profileCount,
      tierCount: reg.tierCount,
      incidentCount: reg.incidentCount,
      policyCount: reg.policyCount,
      launchProfileCount: launchReg.profileCount,
      securityProfileCount: securityReg.profileCount,
      startedAt,
      stoppedAt,
    };
  }

  function assertRunning(op: string): void {
    if (state !== "RUNNING") {
      throw new Error(`${op} requires RUNNING (current=${state})`);
    }
  }

  function initialize(): SupportManagerSnapshot {
    if (state !== "IDLE" && state !== "STOPPED") {
      throw new Error(
        `initialize requires IDLE or STOPPED (current=${state})`,
      );
    }
    clearSupportLayer();
    startedAt = undefined;
    stoppedAt = undefined;
    state = "READY";
    return snapshot();
  }

  function start(): SupportManagerSnapshot {
    if (state !== "READY" && state !== "STOPPED") {
      throw new Error(`start requires READY or STOPPED (current=${state})`);
    }
    state = "RUNNING";
    startedAt = nowIso();
    stoppedAt = undefined;
    return snapshot();
  }

  function stop(): SupportManagerSnapshot {
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
    createTier: (input) => {
      assertRunning("createTier");
      return createSupportTier(input);
    },
    getTier: getSupportTier,
    listTiers: listSupportTiers,
    createProfile: (input) => {
      assertRunning("createProfile");
      return createSupportSlaProfile(input);
    },
    bindTier: (profileId, supportTierId) => {
      assertRunning("bindTier");
      return bindSupportTier(profileId, supportTierId);
    },
    activateProfile: (id) => {
      assertRunning("activateProfile");
      return activateSupportSlaProfile(id);
    },
    setProfileStatus: (id, status) => {
      assertRunning("setProfileStatus");
      return setSupportSlaProfileStatus(id, status);
    },
    getProfile: getSupportSlaProfile,
    listProfiles: listSupportSlaProfiles,
    createPolicy: (input) => {
      assertRunning("createPolicy");
      return createSupportPolicy(input);
    },
    getPolicy: getSupportPolicy,
    listPolicies: listSupportPolicies,
    openIncident: (input) => {
      assertRunning("openIncident");
      return openSupportIncident(input);
    },
    advanceIncident: (input) => {
      assertRunning("advanceIncident");
      return advanceSupportIncident(input);
    },
    resolveIncident: (incidentId, detail) => {
      assertRunning("resolveIncident");
      return resolveSupportIncident(incidentId, detail);
    },
    getIncident: getSupportIncident,
    listIncidents: listSupportIncidents,
    computeMetrics: (supportSlaProfileId) => {
      assertRunning("computeMetrics");
      return computeSupportResponseMetrics(supportSlaProfileId);
    },
    evaluateReadiness: (supportSlaProfileId) => {
      assertRunning("evaluateReadiness");
      return evaluateSupportReadiness(supportSlaProfileId);
    },
    manifest: getSupportRegistryManifest,
  };
}

export { assertSupportReadinessReady };

/**
 * Product Partner — Management Manager
 */

import {
  clearPartnerAccesses,
  getPartnerAccess,
  grantPartnerAccess,
  listPartnerAccesses,
  updatePartnerAccessStatus,
} from "./access/access.registry";
import type {
  GrantPartnerAccessInput,
  PartnerAccess,
  UpdatePartnerAccessStatusInput,
} from "./access/access.types";
import {
  clearPartnerAgreements,
  getPartnerAgreement,
  listPartnerAgreements,
  registerPartnerAgreement,
  updatePartnerAgreementStatus,
} from "./agreement/agreement.registry";
import type {
  PartnerAgreement,
  RegisterPartnerAgreementInput,
  UpdatePartnerAgreementStatusInput,
} from "./agreement/agreement.types";
import {
  clearPartnerReleaseManifests,
  createPartnerReleaseManifest,
  getPartnerReleaseManifest,
  listPartnerReleaseManifests,
  type PartnerReleaseManifest,
} from "./manifest/manifest.registry";
import {
  PRODUCT_PARTNER_MANAGEMENT_BASE,
  PRODUCT_PARTNER_MANAGEMENT_FREEZE_VERSION,
  PRODUCT_PARTNER_MANAGEMENT_ID,
  PRODUCT_PARTNER_MANAGEMENT_VERSION,
} from "./management/management.constants";
import {
  assertPartnerManagementReadinessReady,
  evaluatePartnerManagementReadiness,
} from "./management/management.readiness";
import type {
  PartnerManagerStatus,
  PartnerReadinessResult,
  PartnerRegistryManifest,
} from "./management/management.types";
import {
  clearPartnerProfiles,
  getPartnerProfile,
  listPartnerProfiles,
  registerPartnerProfile,
} from "./profile/profile.registry";
import type {
  PartnerProfile,
  RegisterPartnerProfileInput,
} from "./profile/profile.types";
import {
  clearPartners,
  getPartner,
  listPartners,
  registerPartner,
  updatePartnerStatus,
} from "./registry/partner.registry";
import type {
  ProductPartner,
  RegisterPartnerInput,
  UpdatePartnerStatusInput,
} from "./registry/partner.types";

export type PartnerManagerSnapshot = {
  managerId: string;
  status: PartnerManagerStatus;
  layerId: typeof PRODUCT_PARTNER_MANAGEMENT_ID;
  version: typeof PRODUCT_PARTNER_MANAGEMENT_VERSION;
  partnerCount: number;
  profileCount: number;
  agreementCount: number;
  accessCount: number;
  releaseCount: number;
  startedAt?: string;
  stoppedAt?: string;
};

export type PartnerManager = {
  initialize: () => PartnerManagerSnapshot;
  start: () => PartnerManagerSnapshot;
  stop: () => PartnerManagerSnapshot;
  status: () => PartnerManagerSnapshot;
  registerPartner: (input: RegisterPartnerInput) => ProductPartner;
  updatePartnerStatus: (input: UpdatePartnerStatusInput) => ProductPartner;
  registerProfile: (input: RegisterPartnerProfileInput) => PartnerProfile;
  registerAgreement: (
    input: RegisterPartnerAgreementInput,
  ) => PartnerAgreement;
  updateAgreementStatus: (
    input: UpdatePartnerAgreementStatusInput,
  ) => PartnerAgreement;
  grantAccess: (input: GrantPartnerAccessInput) => PartnerAccess;
  updateAccessStatus: (
    input: UpdatePartnerAccessStatusInput,
  ) => PartnerAccess;
  createReleaseManifest: (input: {
    id?: string;
    partnerId: string;
  }) => PartnerReleaseManifest;
  evaluateReadiness: () => PartnerReadinessResult;
  manifest: () => PartnerRegistryManifest;
};

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

export function getPartnerRegistryManifest(): PartnerRegistryManifest {
  return {
    managementId: PRODUCT_PARTNER_MANAGEMENT_ID,
    version: PRODUCT_PARTNER_MANAGEMENT_VERSION,
    freezeVersion: PRODUCT_PARTNER_MANAGEMENT_FREEZE_VERSION,
    base: PRODUCT_PARTNER_MANAGEMENT_BASE,
    partnerCount: listPartners().length,
    profileCount: listPartnerProfiles().length,
    agreementCount: listPartnerAgreements().length,
    accessCount: listPartnerAccesses().length,
    releaseCount: listPartnerReleaseManifests().length,
  };
}

export function clearPartnerManagementLayer(): void {
  clearPartnerReleaseManifests();
  clearPartnerAccesses();
  clearPartnerAgreements();
  clearPartnerProfiles();
  clearPartners();
}

export function createPartnerManager(options?: {
  managerId?: string;
}): PartnerManager {
  const managerId =
    options?.managerId?.trim() || createId("prod-partner-mgr");
  let state: PartnerManagerStatus = "IDLE";
  let startedAt: string | undefined;
  let stoppedAt: string | undefined;

  function snapshot(): PartnerManagerSnapshot {
    const reg = getPartnerRegistryManifest();
    return {
      managerId,
      status: state,
      layerId: PRODUCT_PARTNER_MANAGEMENT_ID,
      version: PRODUCT_PARTNER_MANAGEMENT_VERSION,
      partnerCount: reg.partnerCount,
      profileCount: reg.profileCount,
      agreementCount: reg.agreementCount,
      accessCount: reg.accessCount,
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

  function initialize(): PartnerManagerSnapshot {
    if (state !== "IDLE" && state !== "STOPPED") {
      throw new Error(
        `initialize requires IDLE or STOPPED (current=${state})`,
      );
    }
    clearPartnerManagementLayer();
    startedAt = undefined;
    stoppedAt = undefined;
    state = "READY";
    return snapshot();
  }

  function start(): PartnerManagerSnapshot {
    if (state !== "READY" && state !== "STOPPED") {
      throw new Error(`start requires READY or STOPPED (current=${state})`);
    }
    state = "RUNNING";
    startedAt = nowIso();
    stoppedAt = undefined;
    return snapshot();
  }

  function stop(): PartnerManagerSnapshot {
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
    registerPartner: (input) => {
      assertRunning("registerPartner");
      return registerPartner(input);
    },
    updatePartnerStatus: (input) => {
      assertRunning("updatePartnerStatus");
      return updatePartnerStatus(input);
    },
    registerProfile: (input) => {
      assertRunning("registerProfile");
      return registerPartnerProfile(input);
    },
    registerAgreement: (input) => {
      assertRunning("registerAgreement");
      return registerPartnerAgreement(input);
    },
    updateAgreementStatus: (input) => {
      assertRunning("updateAgreementStatus");
      return updatePartnerAgreementStatus(input);
    },
    grantAccess: (input) => {
      assertRunning("grantAccess");
      return grantPartnerAccess(input);
    },
    updateAccessStatus: (input) => {
      assertRunning("updateAccessStatus");
      return updatePartnerAccessStatus(input);
    },
    createReleaseManifest: (input) => {
      assertRunning("createReleaseManifest");
      return createPartnerReleaseManifest(input);
    },
    evaluateReadiness: () => {
      assertRunning("evaluateReadiness");
      return evaluatePartnerManagementReadiness();
    },
    manifest: getPartnerRegistryManifest,
  };
}

export {
  assertPartnerManagementReadinessReady,
  getPartner,
  getPartnerAccess,
  getPartnerAgreement,
  getPartnerProfile,
  getPartnerReleaseManifest,
  listPartnerAccesses,
  listPartnerAgreements,
  listPartnerProfiles,
  listPartnerReleaseManifests,
  listPartners,
};

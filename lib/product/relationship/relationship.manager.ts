/**
 * Product Relationship — Relationship Management Manager
 */

import {
  clearBonds,
  createBond,
  getBond,
  listBonds,
  updateBondStatus,
} from "./bond/bond.registry";
import type {
  CreateBondInput,
  RelationshipBond,
  UpdateBondStatusInput,
} from "./bond/bond.types";
import {
  classifyBond,
  clearClassifications,
  getClassification,
  listClassifications,
} from "./classification/classification.registry";
import type {
  ClassifyBondInput,
  RelationshipClassification,
} from "./classification/classification.types";
import {
  clearLifecycleEvents,
  getLifecycleEvent,
  listLifecycleEvents,
  transitionBondLifecycle,
} from "./lifecycle/lifecycle.registry";
import type {
  RelationshipLifecycleEvent,
  TransitionBondLifecycleInput,
} from "./lifecycle/lifecycle.types";
import {
  PRODUCT_RELATIONSHIP_MANAGEMENT_BASE,
  PRODUCT_RELATIONSHIP_MANAGEMENT_FREEZE_VERSION,
  PRODUCT_RELATIONSHIP_MANAGEMENT_ID,
  PRODUCT_RELATIONSHIP_MANAGEMENT_VERSION,
} from "./management/management.constants";
import {
  assertRelationshipManagementReadinessReady,
  evaluateRelationshipManagementReadiness,
} from "./management/management.readiness";
import type {
  RelationshipManagerStatus,
  RelationshipReadinessResult,
  RelationshipRegistryManifest,
} from "./management/management.types";
import {
  attachParty,
  clearParties,
  getParty,
  listParties,
} from "./party/party.registry";
import type {
  AttachPartyInput,
  RelationshipParty,
} from "./party/party.types";

export type RelationshipManagerSnapshot = {
  managerId: string;
  status: RelationshipManagerStatus;
  layerId: typeof PRODUCT_RELATIONSHIP_MANAGEMENT_ID;
  version: typeof PRODUCT_RELATIONSHIP_MANAGEMENT_VERSION;
  bondCount: number;
  partyCount: number;
  classificationCount: number;
  lifecycleCount: number;
  startedAt?: string;
  stoppedAt?: string;
};

export type RelationshipManager = {
  initialize: () => RelationshipManagerSnapshot;
  start: () => RelationshipManagerSnapshot;
  stop: () => RelationshipManagerSnapshot;
  status: () => RelationshipManagerSnapshot;
  createBond: (input: CreateBondInput) => RelationshipBond;
  updateBondStatus: (input: UpdateBondStatusInput) => RelationshipBond;
  attachParty: (input: AttachPartyInput) => RelationshipParty;
  classifyBond: (input: ClassifyBondInput) => RelationshipClassification;
  transitionBondLifecycle: (
    input: TransitionBondLifecycleInput,
  ) => RelationshipLifecycleEvent;
  evaluateReadiness: () => RelationshipReadinessResult;
  manifest: () => RelationshipRegistryManifest;
};

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

export function getRelationshipRegistryManifest(): RelationshipRegistryManifest {
  return {
    managementId: PRODUCT_RELATIONSHIP_MANAGEMENT_ID,
    version: PRODUCT_RELATIONSHIP_MANAGEMENT_VERSION,
    freezeVersion: PRODUCT_RELATIONSHIP_MANAGEMENT_FREEZE_VERSION,
    base: PRODUCT_RELATIONSHIP_MANAGEMENT_BASE,
    bondCount: listBonds().length,
    partyCount: listParties().length,
    classificationCount: listClassifications().length,
    lifecycleCount: listLifecycleEvents().length,
  };
}

export function clearRelationshipManagementLayer(): void {
  clearLifecycleEvents();
  clearClassifications();
  clearParties();
  clearBonds();
}

export function createRelationshipManager(options?: {
  managerId?: string;
}): RelationshipManager {
  const managerId =
    options?.managerId?.trim() || createId("prod-rel-mgr");
  let state: RelationshipManagerStatus = "IDLE";
  let startedAt: string | undefined;
  let stoppedAt: string | undefined;

  function snapshot(): RelationshipManagerSnapshot {
    const reg = getRelationshipRegistryManifest();
    return {
      managerId,
      status: state,
      layerId: PRODUCT_RELATIONSHIP_MANAGEMENT_ID,
      version: PRODUCT_RELATIONSHIP_MANAGEMENT_VERSION,
      bondCount: reg.bondCount,
      partyCount: reg.partyCount,
      classificationCount: reg.classificationCount,
      lifecycleCount: reg.lifecycleCount,
      startedAt,
      stoppedAt,
    };
  }

  function assertRunning(op: string): void {
    if (state !== "RUNNING") {
      throw new Error(`${op} requires RUNNING (current=${state})`);
    }
  }

  function initialize(): RelationshipManagerSnapshot {
    if (state !== "IDLE" && state !== "STOPPED") {
      throw new Error(
        `initialize requires IDLE or STOPPED (current=${state})`,
      );
    }
    clearRelationshipManagementLayer();
    startedAt = undefined;
    stoppedAt = undefined;
    state = "READY";
    return snapshot();
  }

  function start(): RelationshipManagerSnapshot {
    if (state !== "READY" && state !== "STOPPED") {
      throw new Error(`start requires READY or STOPPED (current=${state})`);
    }
    state = "RUNNING";
    startedAt = nowIso();
    stoppedAt = undefined;
    return snapshot();
  }

  function stop(): RelationshipManagerSnapshot {
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
    createBond: (input) => {
      assertRunning("createBond");
      return createBond(input);
    },
    updateBondStatus: (input) => {
      assertRunning("updateBondStatus");
      return updateBondStatus(input);
    },
    attachParty: (input) => {
      assertRunning("attachParty");
      return attachParty(input);
    },
    classifyBond: (input) => {
      assertRunning("classifyBond");
      return classifyBond(input);
    },
    transitionBondLifecycle: (input) => {
      assertRunning("transitionBondLifecycle");
      return transitionBondLifecycle(input);
    },
    evaluateReadiness: () => {
      assertRunning("evaluateReadiness");
      return evaluateRelationshipManagementReadiness();
    },
    manifest: getRelationshipRegistryManifest,
  };
}

export {
  assertRelationshipManagementReadinessReady,
  getBond,
  getClassification,
  getLifecycleEvent,
  getParty,
  listBonds,
  listClassifications,
  listLifecycleEvents,
  listParties,
};

/**
 * Launch L2 — Pilot Customer Flow Manager
 */

import {
  acceptPilotDelivery,
  clearDeliveryAcceptances,
  getDeliveryAcceptance,
  listDeliveryAcceptances,
} from "./delivery/delivery.acceptance";
import {
  clearDeliveryCheckpoints,
  getDeliveryCheckpoint,
  listDeliveryCheckpoints,
  recordDeliveryCheckpoint,
} from "./delivery/delivery.checkpoint";
import {
  assertL2PilotReadinessReady,
  evaluateL2PilotReadiness,
} from "./delivery/delivery.readiness";
import type {
  AcceptDeliveryInput,
  DeliveryAcceptance,
  DeliveryCheckpoint,
  L2ManagerStatus,
  L2ReadinessResult,
  L2RegistryManifest,
  RecordCheckpointInput,
} from "./delivery/delivery.types";
import {
  clearFeedbackEntries,
  collectFeedback,
  getFeedbackEntry,
  listFeedbackEntries,
} from "./feedback/feedback.collector";
import {
  clearFeedbackScores,
  getFeedbackScore,
  listFeedbackScores,
  scorePilotFeedback,
} from "./feedback/feedback.score";
import type {
  CollectFeedbackInput,
  FeedbackEntry,
  FeedbackScore,
  ScoreFeedbackInput,
} from "./feedback/feedback.types";
import {
  clearIntakeForms,
  createIntakeForm,
  getIntakeForm,
  listIntakeForms,
} from "./intake/intake.form";
import { advanceIntakeWorkflow } from "./intake/intake.workflow";
import type {
  AdvanceIntakeInput,
  CreateIntakeFormInput,
  IntakeForm,
} from "./intake/intake.types";
import {
  LAUNCH_L2_PILOT_CUSTOMER_FLOW_BASE,
  LAUNCH_L2_PILOT_CUSTOMER_FLOW_FREEZE_VERSION,
  LAUNCH_L2_PILOT_CUSTOMER_FLOW_ID,
  LAUNCH_L2_PILOT_CUSTOMER_FLOW_VERSION,
} from "./pilot/pilot.constants";
import {
  clearPilots,
  getPilot,
  listPilots,
  registerPilot,
} from "./pilot/pilot.registry";
import { updatePilotStatus } from "./pilot/pilot.status";
import type {
  PilotRecord,
  RegisterPilotInput,
  UpdatePilotStatusInput,
} from "./pilot/pilot.types";
import { advanceProjectLifecycle } from "./project/project.lifecycle";
import {
  clearPilotProjects,
  createPilotProject,
  getPilotProject,
  listPilotProjects,
  trackProjectProgress,
} from "./project/project.tracker";
import type {
  AdvanceProjectLifecycleInput,
  CreatePilotProjectInput,
  PilotProject,
  TrackProjectProgressInput,
} from "./project/project.types";

export type L2PilotCustomerFlowManagerSnapshot = {
  managerId: string;
  status: L2ManagerStatus;
  layerId: typeof LAUNCH_L2_PILOT_CUSTOMER_FLOW_ID;
  version: typeof LAUNCH_L2_PILOT_CUSTOMER_FLOW_VERSION;
  pilotCount: number;
  intakeCount: number;
  projectCount: number;
  feedbackCount: number;
  checkpointCount: number;
  startedAt?: string;
  stoppedAt?: string;
};

export type L2PilotCustomerFlowManager = {
  initialize: () => L2PilotCustomerFlowManagerSnapshot;
  start: () => L2PilotCustomerFlowManagerSnapshot;
  stop: () => L2PilotCustomerFlowManagerSnapshot;
  status: () => L2PilotCustomerFlowManagerSnapshot;
  registerPilot: (input: RegisterPilotInput) => PilotRecord;
  updatePilotStatus: (input: UpdatePilotStatusInput) => PilotRecord;
  createIntake: (input: CreateIntakeFormInput) => IntakeForm;
  advanceIntake: (input: AdvanceIntakeInput) => IntakeForm;
  createProject: (input: CreatePilotProjectInput) => PilotProject;
  trackProgress: (input: TrackProjectProgressInput) => PilotProject;
  advanceLifecycle: (input: AdvanceProjectLifecycleInput) => PilotProject;
  collectFeedback: (input: CollectFeedbackInput) => FeedbackEntry;
  scoreFeedback: (input: ScoreFeedbackInput) => FeedbackScore;
  recordCheckpoint: (input: RecordCheckpointInput) => DeliveryCheckpoint;
  acceptDelivery: (input: AcceptDeliveryInput) => DeliveryAcceptance;
  evaluateReadiness: () => L2ReadinessResult;
  manifest: () => L2RegistryManifest;
};

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

export function getL2RegistryManifest(): L2RegistryManifest {
  return {
    foundationId: LAUNCH_L2_PILOT_CUSTOMER_FLOW_ID,
    version: LAUNCH_L2_PILOT_CUSTOMER_FLOW_VERSION,
    freezeVersion: LAUNCH_L2_PILOT_CUSTOMER_FLOW_FREEZE_VERSION,
    base: LAUNCH_L2_PILOT_CUSTOMER_FLOW_BASE,
    pilotCount: listPilots().length,
    intakeCount: listIntakeForms().length,
    projectCount: listPilotProjects().length,
    feedbackCount: listFeedbackEntries().length,
    scoreCount: listFeedbackScores().length,
    checkpointCount: listDeliveryCheckpoints().length,
    acceptanceCount: listDeliveryAcceptances().length,
  };
}

export function clearL2PilotCustomerFlowLayer(): void {
  clearDeliveryAcceptances();
  clearDeliveryCheckpoints();
  clearFeedbackScores();
  clearFeedbackEntries();
  clearPilotProjects();
  clearIntakeForms();
  clearPilots();
}

export function createL2PilotCustomerFlowManager(options?: {
  managerId?: string;
}): L2PilotCustomerFlowManager {
  const managerId =
    options?.managerId?.trim() || createId("launch-l2-pilot-mgr");
  let state: L2ManagerStatus = "IDLE";
  let startedAt: string | undefined;
  let stoppedAt: string | undefined;

  function snapshot(): L2PilotCustomerFlowManagerSnapshot {
    const reg = getL2RegistryManifest();
    return {
      managerId,
      status: state,
      layerId: LAUNCH_L2_PILOT_CUSTOMER_FLOW_ID,
      version: LAUNCH_L2_PILOT_CUSTOMER_FLOW_VERSION,
      pilotCount: reg.pilotCount,
      intakeCount: reg.intakeCount,
      projectCount: reg.projectCount,
      feedbackCount: reg.feedbackCount,
      checkpointCount: reg.checkpointCount,
      startedAt,
      stoppedAt,
    };
  }

  function assertRunning(op: string): void {
    if (state !== "RUNNING") {
      throw new Error(`${op} requires RUNNING (current=${state})`);
    }
  }

  function initialize(): L2PilotCustomerFlowManagerSnapshot {
    if (state !== "IDLE" && state !== "STOPPED") {
      throw new Error(
        `initialize requires IDLE or STOPPED (current=${state})`,
      );
    }
    clearL2PilotCustomerFlowLayer();
    startedAt = undefined;
    stoppedAt = undefined;
    state = "READY";
    return snapshot();
  }

  function start(): L2PilotCustomerFlowManagerSnapshot {
    if (state !== "READY" && state !== "STOPPED") {
      throw new Error(`start requires READY or STOPPED (current=${state})`);
    }
    state = "RUNNING";
    startedAt = nowIso();
    stoppedAt = undefined;
    return snapshot();
  }

  function stop(): L2PilotCustomerFlowManagerSnapshot {
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
    registerPilot: (input) => {
      assertRunning("registerPilot");
      return registerPilot(input);
    },
    updatePilotStatus: (input) => {
      assertRunning("updatePilotStatus");
      return updatePilotStatus(input);
    },
    createIntake: (input) => {
      assertRunning("createIntake");
      return createIntakeForm(input);
    },
    advanceIntake: (input) => {
      assertRunning("advanceIntake");
      return advanceIntakeWorkflow(input);
    },
    createProject: (input) => {
      assertRunning("createProject");
      return createPilotProject(input);
    },
    trackProgress: (input) => {
      assertRunning("trackProgress");
      return trackProjectProgress(input);
    },
    advanceLifecycle: (input) => {
      assertRunning("advanceLifecycle");
      return advanceProjectLifecycle(input);
    },
    collectFeedback: (input) => {
      assertRunning("collectFeedback");
      return collectFeedback(input);
    },
    scoreFeedback: (input) => {
      assertRunning("scoreFeedback");
      return scorePilotFeedback(input);
    },
    recordCheckpoint: (input) => {
      assertRunning("recordCheckpoint");
      return recordDeliveryCheckpoint(input);
    },
    acceptDelivery: (input) => {
      assertRunning("acceptDelivery");
      return acceptPilotDelivery(input);
    },
    evaluateReadiness: () => {
      assertRunning("evaluateReadiness");
      return evaluateL2PilotReadiness();
    },
    manifest: getL2RegistryManifest,
  };
}

export {
  assertL2PilotReadinessReady,
  getDeliveryAcceptance,
  getDeliveryCheckpoint,
  getFeedbackEntry,
  getFeedbackScore,
  getIntakeForm,
  getPilot,
  getPilotProject,
  listDeliveryAcceptances,
  listDeliveryCheckpoints,
  listFeedbackEntries,
  listFeedbackScores,
  listIntakeForms,
  listPilotProjects,
  listPilots,
};

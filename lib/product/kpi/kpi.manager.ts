/**
 * Product KPI — KPI Management Manager
 */

import {
  clearKpiDefinitions,
  defineKpi,
  getKpiDefinition,
  listKpiDefinitions,
  updateKpiStatus,
} from "./definition/definition.registry";
import type {
  DefineKpiInput,
  KpiDefinition,
  UpdateKpiStatusInput,
} from "./definition/definition.types";
import {
  PRODUCT_KPI_MANAGEMENT_BASE,
  PRODUCT_KPI_MANAGEMENT_FREEZE_VERSION,
  PRODUCT_KPI_MANAGEMENT_ID,
  PRODUCT_KPI_MANAGEMENT_VERSION,
} from "./management/management.constants";
import {
  assertKpiManagementReadinessReady,
  evaluateKpiManagementReadiness,
} from "./management/management.readiness";
import type {
  KpiManagerStatus,
  KpiReadinessResult,
  KpiRegistryManifest,
} from "./management/management.types";
import {
  clearKpiMeasurements,
  getKpiMeasurement,
  listKpiMeasurements,
  recordKpiMeasurement,
} from "./measurement/measurement.registry";
import type {
  KpiMeasurement,
  RecordKpiMeasurementInput,
} from "./measurement/measurement.types";
import {
  buildScorecard,
  clearScorecards,
  getScorecard,
  listScorecards,
} from "./scorecard/scorecard.registry";
import type {
  BuildScorecardInput,
  KpiScorecard,
} from "./scorecard/scorecard.types";
import {
  clearKpiTargets,
  getKpiTarget,
  listKpiTargets,
  setKpiTarget,
} from "./target/target.registry";
import type {
  KpiTarget,
  SetKpiTargetInput,
} from "./target/target.types";

export type KpiManagerSnapshot = {
  managerId: string;
  status: KpiManagerStatus;
  layerId: typeof PRODUCT_KPI_MANAGEMENT_ID;
  version: typeof PRODUCT_KPI_MANAGEMENT_VERSION;
  definitionCount: number;
  targetCount: number;
  measurementCount: number;
  scorecardCount: number;
  startedAt?: string;
  stoppedAt?: string;
};

export type KpiManager = {
  initialize: () => KpiManagerSnapshot;
  start: () => KpiManagerSnapshot;
  stop: () => KpiManagerSnapshot;
  status: () => KpiManagerSnapshot;
  defineKpi: (input: DefineKpiInput) => KpiDefinition;
  updateKpiStatus: (input: UpdateKpiStatusInput) => KpiDefinition;
  setKpiTarget: (input: SetKpiTargetInput) => KpiTarget;
  recordKpiMeasurement: (
    input: RecordKpiMeasurementInput,
  ) => KpiMeasurement;
  buildScorecard: (input: BuildScorecardInput) => KpiScorecard;
  evaluateReadiness: () => KpiReadinessResult;
  manifest: () => KpiRegistryManifest;
};

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

export function getKpiRegistryManifest(): KpiRegistryManifest {
  return {
    managementId: PRODUCT_KPI_MANAGEMENT_ID,
    version: PRODUCT_KPI_MANAGEMENT_VERSION,
    freezeVersion: PRODUCT_KPI_MANAGEMENT_FREEZE_VERSION,
    base: PRODUCT_KPI_MANAGEMENT_BASE,
    definitionCount: listKpiDefinitions().length,
    targetCount: listKpiTargets().length,
    measurementCount: listKpiMeasurements().length,
    scorecardCount: listScorecards().length,
  };
}

export function clearKpiManagementLayer(): void {
  clearScorecards();
  clearKpiMeasurements();
  clearKpiTargets();
  clearKpiDefinitions();
}

export function createKpiManager(options?: {
  managerId?: string;
}): KpiManager {
  const managerId =
    options?.managerId?.trim() || createId("prod-kpi-mgr");
  let state: KpiManagerStatus = "IDLE";
  let startedAt: string | undefined;
  let stoppedAt: string | undefined;

  function snapshot(): KpiManagerSnapshot {
    const reg = getKpiRegistryManifest();
    return {
      managerId,
      status: state,
      layerId: PRODUCT_KPI_MANAGEMENT_ID,
      version: PRODUCT_KPI_MANAGEMENT_VERSION,
      definitionCount: reg.definitionCount,
      targetCount: reg.targetCount,
      measurementCount: reg.measurementCount,
      scorecardCount: reg.scorecardCount,
      startedAt,
      stoppedAt,
    };
  }

  function assertRunning(op: string): void {
    if (state !== "RUNNING") {
      throw new Error(`${op} requires RUNNING (current=${state})`);
    }
  }

  function initialize(): KpiManagerSnapshot {
    if (state !== "IDLE" && state !== "STOPPED") {
      throw new Error(
        `initialize requires IDLE or STOPPED (current=${state})`,
      );
    }
    clearKpiManagementLayer();
    startedAt = undefined;
    stoppedAt = undefined;
    state = "READY";
    return snapshot();
  }

  function start(): KpiManagerSnapshot {
    if (state !== "READY" && state !== "STOPPED") {
      throw new Error(`start requires READY or STOPPED (current=${state})`);
    }
    state = "RUNNING";
    startedAt = nowIso();
    stoppedAt = undefined;
    return snapshot();
  }

  function stop(): KpiManagerSnapshot {
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
    defineKpi: (input) => {
      assertRunning("defineKpi");
      return defineKpi(input);
    },
    updateKpiStatus: (input) => {
      assertRunning("updateKpiStatus");
      return updateKpiStatus(input);
    },
    setKpiTarget: (input) => {
      assertRunning("setKpiTarget");
      return setKpiTarget(input);
    },
    recordKpiMeasurement: (input) => {
      assertRunning("recordKpiMeasurement");
      return recordKpiMeasurement(input);
    },
    buildScorecard: (input) => {
      assertRunning("buildScorecard");
      return buildScorecard(input);
    },
    evaluateReadiness: () => {
      assertRunning("evaluateReadiness");
      return evaluateKpiManagementReadiness();
    },
    manifest: getKpiRegistryManifest,
  };
}

export {
  assertKpiManagementReadinessReady,
  getKpiDefinition,
  getKpiMeasurement,
  getKpiTarget,
  getScorecard,
  listKpiDefinitions,
  listKpiMeasurements,
  listKpiTargets,
  listScorecards,
};

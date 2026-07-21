/**
 * E11-P6 — Autonomous Operations Manager
 * Orchestrates operations / recovery / heal / optimize / incidents / policy
 * Integrates anomaly, governance metrics, lifecycle, execution manager
 */

import type { ExecutionManager } from "../execution/execution.manager";
import { detectAnomalies } from "../observability/observability.anomaly";
import {
  E11_AUTONOMOUS_BASE,
  E11_AUTONOMOUS_FREEZE_VERSION,
  E11_AUTONOMOUS_ID,
  E11_AUTONOMOUS_VERSION,
} from "./autonomous.constants";
import { selfHeal } from "./autonomous.healing";
import {
  attachOperationToIncident,
  clearIncidents,
  getIncident,
  listIncidents,
  openIncident,
  setIncidentStatus,
} from "./autonomous.incident";
import {
  clearOperations,
  createOperation,
  getOperation,
  listOperations,
  updateOperation,
} from "./autonomous.operation";
import { optimizeResources } from "./autonomous.optimize";
import {
  clearActionPolicies,
  createActionPolicy,
  listActionPolicies,
  policyAllowsAuto,
  policyAllowsKind,
  resolveActionPolicy,
  severityMeetsOrExceeds,
} from "./autonomous.policy";
import { recoverRuntime } from "./autonomous.recovery";
import type {
  AutonomousActionPolicy,
  AutonomousIncident,
  AutonomousManagerStatus,
  AutonomousOperation,
  AutonomousRegistryManifest,
  CreateActionPolicyInput,
  CreateAutonomousOperationInput,
  HealResult,
  IncidentSeverity,
  OpenIncidentInput,
  OptimizeResult,
  RecoveryResult,
} from "./autonomous.types";

export type AutonomousManagerSnapshot = {
  managerId: string;
  status: AutonomousManagerStatus;
  layerId: typeof E11_AUTONOMOUS_ID;
  version: typeof E11_AUTONOMOUS_VERSION;
  operationCount: number;
  incidentCount: number;
  policyCount: number;
  startedAt?: string;
  stoppedAt?: string;
};

export type AutonomousManager = {
  initialize: () => AutonomousManagerSnapshot;
  start: () => AutonomousManagerSnapshot;
  stop: () => AutonomousManagerSnapshot;
  status: () => AutonomousManagerSnapshot;
  createOperation: (input: CreateAutonomousOperationInput) => AutonomousOperation;
  getOperation: typeof getOperation;
  listOperations: typeof listOperations;
  createPolicy: (input: CreateActionPolicyInput) => AutonomousActionPolicy;
  listPolicies: typeof listActionPolicies;
  openIncident: (input: OpenIncidentInput) => AutonomousIncident;
  getIncident: typeof getIncident;
  listIncidents: typeof listIncidents;
  setIncidentStatus: typeof setIncidentStatus;
  recover: (input: {
    runtimeId: string;
    tenantId?: string;
    anomalyId?: string;
    incidentId?: string;
  }) => RecoveryResult;
  heal: (options?: {
    tenantId?: string;
    openIncidents?: boolean;
  }) => HealResult;
  optimize: (options?: {
    utilizationTarget?: number;
    execution?: ExecutionManager;
    runtimeId?: string;
    tenantId?: string;
  }) => OptimizeResult;
  /**
   * Detect anomalies then auto-act per policy (AUTO mode).
   * ASSISTED/MANUAL only open incidents when severity threshold met.
   */
  reactToAnomalies: (options?: {
    tenantId?: string;
    execution?: ExecutionManager;
    runtimeId?: string;
  }) => {
    anomalies: number;
    operations: string[];
    incidents: string[];
  };
  manifest: () => AutonomousRegistryManifest;
};

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

function anomalyToSeverity(score: number): IncidentSeverity {
  if (score >= 0.9) return "CRITICAL";
  if (score >= 0.7) return "HIGH";
  if (score >= 0.4) return "MEDIUM";
  return "LOW";
}

export function createAutonomousManager(options?: {
  managerId?: string;
}): AutonomousManager {
  const managerId =
    options?.managerId?.trim() || createId("e11-auto-mgr");
  let state: AutonomousManagerStatus = "IDLE";
  let startedAt: string | undefined;
  let stoppedAt: string | undefined;

  function snapshot(): AutonomousManagerSnapshot {
    return {
      managerId,
      status: state,
      layerId: E11_AUTONOMOUS_ID,
      version: E11_AUTONOMOUS_VERSION,
      operationCount: listOperations().length,
      incidentCount: listIncidents().length,
      policyCount: listActionPolicies().length,
      startedAt,
      stoppedAt,
    };
  }

  function assertRunning(op: string): void {
    if (state !== "RUNNING") {
      throw new Error(`${op} requires RUNNING (current=${state})`);
    }
  }

  function initialize(): AutonomousManagerSnapshot {
    if (state !== "IDLE" && state !== "STOPPED") {
      throw new Error(
        `initialize requires IDLE or STOPPED (current=${state})`,
      );
    }
    clearActionPolicies();
    clearIncidents();
    clearOperations();
    startedAt = undefined;
    stoppedAt = undefined;
    state = "READY";
    return snapshot();
  }

  function start(): AutonomousManagerSnapshot {
    if (state !== "READY" && state !== "STOPPED") {
      throw new Error(
        `start requires READY or STOPPED (current=${state})`,
      );
    }
    state = "RUNNING";
    startedAt = nowIso();
    stoppedAt = undefined;
    return snapshot();
  }

  function stop(): AutonomousManagerSnapshot {
    if (state !== "RUNNING") {
      throw new Error(`stop requires RUNNING (current=${state})`);
    }
    for (const incident of listIncidents({ status: "OPEN" })) {
      try {
        setIncidentStatus(incident.id, "CLOSED");
      } catch {
        // ignore
      }
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
    createOperation: (input) => {
      assertRunning("createOperation");
      return createOperation(input);
    },
    getOperation,
    listOperations,
    createPolicy: (input) => {
      assertRunning("createPolicy");
      return createActionPolicy(input);
    },
    listPolicies: listActionPolicies,
    openIncident: (input) => {
      assertRunning("openIncident");
      return openIncident(input);
    },
    getIncident,
    listIncidents,
    setIncidentStatus: (id, status) => {
      assertRunning("setIncidentStatus");
      return setIncidentStatus(id, status);
    },
    recover: (input) => {
      assertRunning("recover");
      return recoverRuntime(input);
    },
    heal: (opts) => {
      assertRunning("heal");
      return selfHeal(opts);
    },
    optimize: (opts) => {
      assertRunning("optimize");
      return optimizeResources(opts);
    },
    reactToAnomalies: (opts) => {
      assertRunning("reactToAnomalies");
      const policy = resolveActionPolicy(opts?.tenantId);
      const anomalies = detectAnomalies(
        opts?.tenantId
          ? { quotaPressureRatio: 0.8 }
          : undefined,
      ).filter((a) =>
        opts?.tenantId ? a.tenantId === opts.tenantId || !a.tenantId : true,
      );

      const operations: string[] = [];
      const incidents: string[] = [];

      for (const anomaly of anomalies) {
        const severity = anomalyToSeverity(anomaly.score);
        const effectivePolicy = policy;

        if (
          effectivePolicy &&
          severityMeetsOrExceeds(
            severity,
            effectivePolicy.autoIncidentSeverity,
          ) &&
          policyAllowsKind(effectivePolicy, "INCIDENT")
        ) {
          const incident = openIncident({
            title: `Auto incident: ${anomaly.kind}`,
            severity,
            anomalyId: anomaly.id,
            runtimeId: anomaly.runtimeId ?? opts?.runtimeId,
            tenantId: anomaly.tenantId ?? opts?.tenantId,
          });
          incidents.push(incident.id);

          if (
            effectivePolicy.mode === "AUTO" &&
            policyAllowsAuto(effectivePolicy, anomaly.score)
          ) {
            if (
              anomaly.runtimeId &&
              policyAllowsKind(effectivePolicy, "RECOVER")
            ) {
              const recovery = recoverRuntime({
                runtimeId: anomaly.runtimeId,
                tenantId: anomaly.tenantId ?? opts?.tenantId,
                anomalyId: anomaly.id,
                incidentId: incident.id,
              });
              attachOperationToIncident(incident.id, recovery.operationId);
              operations.push(recovery.operationId);
              setIncidentStatus(incident.id, "MITIGATING");
              if (recovery.recovered) {
                setIncidentStatus(incident.id, "RESOLVED");
              }
            } else if (policyAllowsKind(effectivePolicy, "OPTIMIZE")) {
              const opt = optimizeResources({
                execution: opts?.execution,
                runtimeId: anomaly.runtimeId ?? opts?.runtimeId,
                tenantId: anomaly.tenantId ?? opts?.tenantId,
              });
              attachOperationToIncident(incident.id, opt.operationId);
              operations.push(opt.operationId);
              setIncidentStatus(incident.id, "MITIGATING");
            }
          } else {
            // ASSISTED/MANUAL: create blocked pending operation for review
            const pending = createOperation({
              kind: "INCIDENT",
              title: `Review anomaly ${anomaly.kind}`,
              anomalyId: anomaly.id,
              incidentId: incident.id,
              runtimeId: anomaly.runtimeId,
              tenantId: anomaly.tenantId,
            });
            updateOperation(pending.id, { status: "BLOCKED" });
            attachOperationToIncident(incident.id, pending.id);
            operations.push(pending.id);
          }
        } else if (
          effectivePolicy?.mode === "AUTO" &&
          anomaly.runtimeId &&
          policyAllowsKind(effectivePolicy, "HEAL") &&
          policyAllowsAuto(effectivePolicy, anomaly.score)
        ) {
          const heal = selfHeal({
            tenantId: anomaly.tenantId ?? opts?.tenantId,
            openIncidents: true,
          });
          operations.push(heal.operationId);
        }
      }

      return {
        anomalies: anomalies.length,
        operations,
        incidents,
      };
    },
    manifest: () => ({
      autonomousId: E11_AUTONOMOUS_ID,
      version: E11_AUTONOMOUS_VERSION,
      freezeVersion: E11_AUTONOMOUS_FREEZE_VERSION,
      base: E11_AUTONOMOUS_BASE,
      operationCount: listOperations().length,
      incidentCount: listIncidents().length,
      policyCount: listActionPolicies().length,
    }),
  };
}

export function getAutonomousRegistryManifest(): AutonomousRegistryManifest {
  return {
    autonomousId: E11_AUTONOMOUS_ID,
    version: E11_AUTONOMOUS_VERSION,
    freezeVersion: E11_AUTONOMOUS_FREEZE_VERSION,
    base: E11_AUTONOMOUS_BASE,
    operationCount: listOperations().length,
    incidentCount: listIncidents().length,
    policyCount: listActionPolicies().length,
  };
}

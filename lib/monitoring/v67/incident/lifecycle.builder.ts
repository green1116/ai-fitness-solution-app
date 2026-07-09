/**
 * V67 P2 — Incident lifecycle report builder (read-only)
 */
import { buildMonitoringFoundationReport } from "../foundation.builder";
import { V67_MONITORING_FOUNDATION_VERSION } from "../foundation.types";

import {
  buildIncidentSnapshot,
  CANONICAL_ESCALATION_PATH,
  CANONICAL_RESOLUTION_PATH,
  simulateLifecyclePath,
} from "./lifecycle.machine";
import { buildIncidentStateManifest } from "./lifecycle.states";
import type {
  IncidentLifecycleReport,
  IncidentLifecycleSignals,
} from "./lifecycle.types";
import { V67_INCIDENT_LIFECYCLE_VERSION } from "./lifecycle.types";
import { buildTransitionRuleManifest } from "./lifecycle.transitions";

const DEFAULT_SIGNALS: IncidentLifecycleSignals = {
  foundationReady: true,
  stateMachineComplete: true,
  transitionRulesComplete: true,
};

export function buildIncidentLifecycleReport(input?: {
  deploymentId?: string;
  signals?: IncidentLifecycleSignals;
}): IncidentLifecycleReport {
  const deploymentId = input?.deploymentId ?? "v67-incident-lifecycle-default";

  const foundation = buildMonitoringFoundationReport({ deploymentId });
  const stateMachine = buildIncidentStateManifest();
  const transitionRules = buildTransitionRuleManifest();

  const signals: IncidentLifecycleSignals = {
    ...DEFAULT_SIGNALS,
    foundationReady: foundation.foundationReady,
    stateMachineComplete: stateMachine.machineComplete,
    transitionRulesComplete: transitionRules.rulesComplete,
    ...input?.signals,
  };

  const resolutionSim = simulateLifecyclePath(CANONICAL_RESOLUTION_PATH);
  const escalationSim = simulateLifecyclePath(CANONICAL_ESCALATION_PATH);

  const sampleLifecycle = [
    buildIncidentSnapshot({
      incidentId: "INC-SAMPLE-001",
      type: "availability",
      state: resolutionSim.path[resolutionSim.path.length - 1] ?? "closed",
    }),
    buildIncidentSnapshot({
      incidentId: "INC-SAMPLE-002",
      type: "security",
      state: escalationSim.path[escalationSim.path.length - 1] ?? "closed",
    }),
    buildIncidentSnapshot({
      incidentId: "INC-SAMPLE-003",
      type: "deployment",
      state: "mitigating",
    }),
  ];

  const lifecycleReady =
    foundation.foundationReady &&
    stateMachine.machineComplete &&
    transitionRules.rulesComplete &&
    resolutionSim.valid &&
    escalationSim.valid &&
    signals.foundationReady !== false;

  return {
    version: V67_INCIDENT_LIFECYCLE_VERSION,
    reportId: `incident-lifecycle-${deploymentId}`,
    generatedAt: new Date().toISOString(),
    deploymentId,
    foundationVersion: V67_MONITORING_FOUNDATION_VERSION,
    foundationReady: foundation.foundationReady,
    stateMachine,
    transitionRules,
    sampleLifecycle,
    lifecycleReady,
    readinessScore: lifecycleReady ? 100 : 0,
    summary: [
      `incident-lifecycle ready=${lifecycleReady}`,
      `states=${stateMachine.stateCount}`,
      `rules=${transitionRules.ruleCount}`,
      `foundation=${foundation.foundationReady}`,
    ].join(" "),
  };
}

export function assertIncidentLifecyclePass(
  report: IncidentLifecycleReport,
): asserts report is IncidentLifecycleReport & { lifecycleReady: true } {
  if (!report.lifecycleReady) {
    throw new Error(`V67 incident lifecycle not ready: ${report.summary}`);
  }
}

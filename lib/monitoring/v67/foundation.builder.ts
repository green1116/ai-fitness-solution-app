/**
 * V67 P1 — Monitoring foundation report builder (read-only)
 */
import { buildAlertContractManifest } from "./alert.contract";
import { buildEventContractManifest } from "./event.contract";
import {
  isUpstreamFrozenMonitoringLockIntact,
  V67_UPSTREAM_FROZEN_MONITORING_LOCK,
} from "./foundation.constants";
import type {
  MonitoringEnvironment,
  MonitoringFoundationReport,
  MonitoringFoundationSignals,
} from "./foundation.types";
import { V67_MONITORING_FOUNDATION_VERSION } from "./foundation.types";
import { buildOncallContractManifest } from "./oncall.contract";
import { buildSloContractManifest } from "./slo.contract";

const DEFAULT_SIGNALS: MonitoringFoundationSignals = {
  v66DeploymentClosed: true,
  alertContractComplete: true,
  eventContractComplete: true,
  sloContractComplete: true,
  oncallContractComplete: true,
  upstreamFrozenIntact: true,
};

export function buildMonitoringFoundationReport(input?: {
  deploymentId?: string;
  environment?: MonitoringEnvironment;
  signals?: MonitoringFoundationSignals;
}): MonitoringFoundationReport {
  const deploymentId = input?.deploymentId ?? "v67-monitoring-foundation-default";
  const environment = input?.environment ?? "production";

  const alertContract = buildAlertContractManifest();
  const eventContract = buildEventContractManifest();
  const sloContract = buildSloContractManifest();
  const oncallContract = buildOncallContractManifest();

  const upstreamFrozenIntact = isUpstreamFrozenMonitoringLockIntact();

  const signals: MonitoringFoundationSignals = {
    ...DEFAULT_SIGNALS,
    alertContractComplete: alertContract.contractComplete,
    eventContractComplete: eventContract.contractComplete,
    sloContractComplete: sloContract.contractComplete,
    oncallContractComplete: oncallContract.contractComplete,
    upstreamFrozenIntact,
    ...input?.signals,
  };

  const contractsComplete =
    alertContract.contractComplete &&
    eventContract.contractComplete &&
    sloContract.contractComplete &&
    oncallContract.contractComplete &&
    upstreamFrozenIntact;

  const foundationReady =
    contractsComplete &&
    signals.v66DeploymentClosed !== false &&
    signals.upstreamFrozenIntact !== false;

  return {
    version: V67_MONITORING_FOUNDATION_VERSION,
    reportId: `monitoring-foundation-${deploymentId}`,
    generatedAt: new Date().toISOString(),
    deploymentId,
    environment,
    upstreamFrozen: V67_UPSTREAM_FROZEN_MONITORING_LOCK,
    upstreamFrozenIntact,
    alertContract,
    eventContract,
    sloContract,
    oncallContract,
    contractsComplete,
    foundationReady,
    readinessScore: foundationReady ? 100 : 0,
    summary: [
      `monitoring-foundation ready=${foundationReady}`,
      `alerts=${alertContract.ruleCount}`,
      `events=${eventContract.eventCount}`,
      `slis=${sloContract.sliCount}`,
      `oncall=${oncallContract.entryCount}`,
      `upstream=${upstreamFrozenIntact}`,
    ].join(" "),
  };
}

export function assertMonitoringFoundationPass(
  report: MonitoringFoundationReport,
): asserts report is MonitoringFoundationReport & { foundationReady: true } {
  if (!report.foundationReady) {
    throw new Error(`V67 monitoring foundation not ready: ${report.summary}`);
  }
}

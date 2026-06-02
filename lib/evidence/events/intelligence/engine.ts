import type { ExternalEvidenceRuntimeSuccess } from "../../types/runtime";
import { buildEventCorrelationIntelligence } from "./correlationIntel";
import { detectRuntimeEventAnomalies } from "./anomalies";
import { buildGovernanceHotspotIntelligence } from "./hotspots";
import { buildRuntimeHealthIntelligence } from "./health";
import { buildReleaseStabilityIntelligence } from "./releaseStability";
import { buildRuntimeRiskIntelligence } from "./risk";
import { buildEventTimelineIntelligence } from "./timeline";
import type {
  BuildRuntimeEventIntelligenceInput,
  RuntimeEventIntelligenceResult,
} from "./types";
import { RUNTIME_EVENT_INTELLIGENCE_VERSION } from "./types";

export function runtimeSnapshotFromSuccess(
  result: ExternalEvidenceRuntimeSuccess,
): BuildRuntimeEventIntelligenceInput["runtimeSnapshot"] {
  return {
    validationOutcome: result.tenderValidation?.outcome,
    auditGovernanceStatus: result.tenderAudit?.governanceStatus,
    governancePosture: result.tenderGovernance?.posture,
    policyBlocked: result.runtimePolicy?.blocked,
    stateReleasable: result.runtimeStateMachine?.releasable,
  };
}

export function buildRuntimeEventIntelligence(
  input: BuildRuntimeEventIntelligenceInput,
): RuntimeEventIntelligenceResult {
  const { orchestration } = input;
  const timeline = buildEventTimelineIntelligence(orchestration);
  const correlation = buildEventCorrelationIntelligence(
    orchestration.records,
    timeline,
  );
  const risk = buildRuntimeRiskIntelligence(orchestration, timeline, input);
  const governanceHotspots = buildGovernanceHotspotIntelligence(
    orchestration,
    timeline,
  );
  const releaseStability = buildReleaseStabilityIntelligence(
    orchestration,
    timeline,
  );
  const health = buildRuntimeHealthIntelligence(
    orchestration,
    risk,
    releaseStability,
    governanceHotspots,
  );
  const anomalies = detectRuntimeEventAnomalies(orchestration, timeline);

  const debugSummary = [
    `Runtime Health: ${health.healthScore}`,
    `Governance Stability: ${health.labels.governanceStability}`,
    `Release Confidence: ${health.labels.releaseConfidence}`,
    `Audit Integrity: ${health.labels.auditIntegrity}`,
    `Executive Readiness: ${health.labels.executiveReadiness}`,
    `Risk: ${risk.overallScore} (${risk.severity})`,
    `Hotspots: ${governanceHotspots.hotspots.length}`,
    `Anomalies: ${anomalies.length}`,
  ].join("\n");

  return {
    version: RUNTIME_EVENT_INTELLIGENCE_VERSION,
    traceId: orchestration.traceId,
    correlationId: orchestration.correlationId,
    timeline,
    correlation,
    risk,
    governanceHotspots,
    releaseStability,
    health,
    anomalies,
    debug: { summary: debugSummary },
  };
}

export function runRuntimeEventIntelligence(
  input: BuildRuntimeEventIntelligenceInput,
): RuntimeEventIntelligenceResult {
  return buildRuntimeEventIntelligence(input);
}

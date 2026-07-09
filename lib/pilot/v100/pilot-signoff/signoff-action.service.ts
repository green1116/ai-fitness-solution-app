/**
 * V100 — Sign-off actions (minimal write to sign-off cache only)
 */

import {
  appendSignoffAction,
  getSignoffState,
  updateSignoffState,
} from "./signoff-cache";
import { buildPilotSignoffReport } from "./signoff.service";
import type { PilotSignoffReport, PilotSignoffState } from "./signoff.types";

export function collectReadiness(input: {
  organizationId: string;
  actorId: string;
  note?: string;
}): PilotSignoffReport {
  const report = buildPilotSignoffReport(input.organizationId);

  appendSignoffAction({
    organizationId: input.organizationId,
    actorId: input.actorId,
    action: "collect_readiness",
    note: input.note ?? `收集 V80–V99 就绪 (${report.layerCount} 层)`,
    meta: { overallPilotScore: report.overallPilotScore },
  });

  return report;
}

export function finalSignoff(input: {
  organizationId: string;
  actorId: string;
  note?: string;
}): PilotSignoffState {
  const report = buildPilotSignoffReport(input.organizationId);
  if (report.readinessSummary.overallReadiness === "not_ready") {
    throw new Error("PILOT_NOT_READY_FOR_SIGNOFF");
  }

  const now = new Date().toISOString();
  const state = updateSignoffState(input.organizationId, {
    releaseStatus: "signed_off",
    signedOffAt: now,
    signedOffBy: input.actorId,
  });

  appendSignoffAction({
    organizationId: input.organizationId,
    actorId: input.actorId,
    action: "final_signoff",
    note: input.note ?? "Pilot 最终签收完成",
    meta: { signedOffAt: now, overallPilotScore: report.overallPilotScore },
  });

  return state;
}

export function freezeBaseline(input: {
  organizationId: string;
  actorId: string;
  note?: string;
}): PilotSignoffState {
  const current = getSignoffState(input.organizationId);
  if (current.releaseStatus !== "signed_off" && current.releaseStatus !== "frozen") {
    throw new Error("SIGNOFF_REQUIRED_BEFORE_FREEZE");
  }

  const now = new Date().toISOString();
  const state = updateSignoffState(input.organizationId, {
    releaseStatus: "frozen",
    frozenAt: now,
    frozenBy: input.actorId,
  });

  appendSignoffAction({
    organizationId: input.organizationId,
    actorId: input.actorId,
    action: "freeze_baseline",
    note: input.note ?? "Pilot 基线已冻结",
    meta: { frozenAt: now },
  });

  return state;
}

export function releaseBaseline(input: {
  organizationId: string;
  actorId: string;
  note?: string;
}): PilotSignoffState {
  const current = getSignoffState(input.organizationId);
  if (current.releaseStatus !== "frozen" && current.releaseStatus !== "released") {
    throw new Error("FREEZE_REQUIRED_BEFORE_RELEASE");
  }

  const now = new Date().toISOString();
  const state = updateSignoffState(input.organizationId, {
    releaseStatus: "released",
    releasedAt: now,
    releasedBy: input.actorId,
  });

  appendSignoffAction({
    organizationId: input.organizationId,
    actorId: input.actorId,
    action: "release_baseline",
    note: input.note ?? "Pilot 发布基线已批准",
    meta: { releasedAt: now },
  });

  return state;
}

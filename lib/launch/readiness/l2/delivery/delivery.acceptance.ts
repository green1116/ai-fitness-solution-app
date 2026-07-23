/**
 * Launch L2 — Delivery acceptance
 */

import { ACCEPTANCE_VERDICTS } from "../pilot/pilot.constants";
import { getPilotProject } from "../project/project.tracker";
import { listDeliveryCheckpoints } from "./delivery.checkpoint";
import type {
  AcceptDeliveryInput,
  AcceptanceVerdict,
  DeliveryAcceptance,
} from "./delivery.types";

const acceptances = new Map<string, DeliveryAcceptance>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneAcceptance(
  acceptance: DeliveryAcceptance,
): DeliveryAcceptance {
  return { ...acceptance };
}

export function acceptPilotDelivery(
  input: AcceptDeliveryInput,
): DeliveryAcceptance {
  const projectId = input.projectId.trim();
  if (!projectId) throw new Error("acceptance.projectId is required");
  if (!getPilotProject(projectId)) {
    throw new Error(`pilot project not found: ${projectId}`);
  }

  const allowed: ReadonlyArray<Exclude<AcceptanceVerdict, "PENDING">> = [
    "ACCEPTED",
    "REJECTED",
    "CONDITIONAL",
  ];
  if (!allowed.includes(input.verdict)) {
    throw new Error(`invalid acceptance verdict: ${input.verdict}`);
  }
  if (!(ACCEPTANCE_VERDICTS as readonly string[]).includes(input.verdict)) {
    throw new Error(`invalid acceptance verdict: ${input.verdict}`);
  }
  if (
    !Number.isFinite(input.score) ||
    input.score < 0 ||
    input.score > 100
  ) {
    throw new Error("acceptance.score must be between 0 and 100");
  }

  const checkpoints = listDeliveryCheckpoints({ projectId });
  if (checkpoints.length < 1) {
    throw new Error(`no delivery checkpoints for project: ${projectId}`);
  }

  const id = input.id?.trim() || createId("l2acc");
  if (acceptances.has(id)) {
    throw new Error(`delivery acceptance already exists: ${id}`);
  }

  const score = Math.round(input.score);
  const notes = (input.notes ?? "").trim() || `verdict=${input.verdict}`;
  const acceptance: DeliveryAcceptance = {
    id,
    projectId,
    verdict: input.verdict,
    score,
    notes,
    detail: `verdict=${input.verdict} score=${score} checkpoints=${checkpoints.length}`,
    acceptedAt: nowIso(),
  };
  acceptances.set(id, acceptance);
  return cloneAcceptance(acceptance);
}

export function getDeliveryAcceptance(
  id: string,
): DeliveryAcceptance | undefined {
  const acceptance = acceptances.get(id.trim());
  return acceptance ? cloneAcceptance(acceptance) : undefined;
}

export function listDeliveryAcceptances(filter?: {
  projectId?: string;
  verdict?: AcceptanceVerdict;
}): DeliveryAcceptance[] {
  let result = [...acceptances.values()];
  if (filter?.projectId) {
    const pid = filter.projectId.trim();
    result = result.filter((a) => a.projectId === pid);
  }
  if (filter?.verdict) {
    result = result.filter((a) => a.verdict === filter.verdict);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneAcceptance);
}

export function clearDeliveryAcceptances(): void {
  acceptances.clear();
}

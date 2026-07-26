/**
 * Product Delivery — Release manifest + checksum
 */

import { createHash } from "node:crypto";

import { listDeliveryDispatchContracts } from "../dispatch/dispatch.registry";
import { listDeliveryPipelines } from "../pipeline/pipeline.registry";
import { getDeliveryRequest } from "../request/request.registry";
import { listDeliveryRetryPolicies } from "../retry/retry.registry";
import { listDeliveryStatuses } from "../status/status.registry";

export type DeliveryReleaseManifest = {
  id: string;
  requestId: string;
  requestKey: string;
  checksum: string;
  pipelineId: string;
  statusId: string;
  retryPolicyId: string;
  dispatchContractId: string;
  createdAt: string;
};

const releases = new Map<string, DeliveryReleaseManifest>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneRelease(
  release: DeliveryReleaseManifest,
): DeliveryReleaseManifest {
  return { ...release };
}

function checksumPayload(payload: unknown): string {
  return createHash("sha256").update(JSON.stringify(payload)).digest("hex");
}

export function createDeliveryReleaseManifest(input: {
  id?: string;
  requestId: string;
}): DeliveryReleaseManifest {
  const requestId = input.requestId.trim();
  if (!requestId) throw new Error("manifest.requestId is required");

  const request = getDeliveryRequest(requestId);
  if (!request) throw new Error(`request not found: ${requestId}`);

  const pipelines = listDeliveryPipelines({ requestId });
  if (pipelines.length < 1) throw new Error("pipeline missing");
  const statuses = listDeliveryStatuses({ requestId });
  const succeeded = statuses.find((s) => s.status === "SUCCEEDED");
  if (!succeeded) throw new Error("succeeded status missing");
  const retries = listDeliveryRetryPolicies({ requestId });
  if (retries.length < 1) throw new Error("retry policy missing");
  const dispatches = listDeliveryDispatchContracts({ requestId });
  const bound = dispatches.find((d) => d.status === "BOUND");
  if (!bound) throw new Error("bound dispatch contract missing");

  const payload = {
    requestKey: request.requestKey,
    channelKey: request.channelKey,
    templateKey: request.templateKey,
    priority: request.priority,
    stages: [...pipelines[0].stages],
    status: succeeded.status,
    attempt: succeeded.attempt,
    retry: {
      maxAttempts: retries[0].maxAttempts,
      backoff: retries[0].backoff,
      baseDelayMs: retries[0].baseDelayMs,
    },
    dispatch: {
      contractKey: bound.contractKey,
      channelKey: bound.channelKey,
    },
  };

  const id = input.id?.trim() || createId("dlvrel");
  if (releases.has(id)) throw new Error(`release already exists: ${id}`);

  const release: DeliveryReleaseManifest = {
    id,
    requestId,
    requestKey: request.requestKey,
    checksum: checksumPayload(payload),
    pipelineId: pipelines[0].id,
    statusId: succeeded.id,
    retryPolicyId: retries[0].id,
    dispatchContractId: bound.id,
    createdAt: nowIso(),
  };
  releases.set(id, release);
  return cloneRelease(release);
}

export function getDeliveryReleaseManifest(
  id: string,
): DeliveryReleaseManifest | undefined {
  const release = releases.get(id.trim());
  return release ? cloneRelease(release) : undefined;
}

export function listDeliveryReleaseManifests(): DeliveryReleaseManifest[] {
  return [...releases.values()]
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneRelease);
}

export function clearDeliveryReleaseManifests(): void {
  releases.clear();
}

/**
 * Product API SDK — Release manifest + checksum
 */

import { createHash } from "node:crypto";

import { getSdkClient } from "../client/client.registry";
import { listSdkOperations } from "../operation/operation.registry";
import { listSdkPackages } from "../package/package.registry";
import { listSdkSchemas } from "../schema/schema.registry";

export type ApiSdkReleaseManifest = {
  id: string;
  clientId: string;
  clientKey: string;
  checksum: string;
  operationId: string;
  schemaId: string;
  packageId: string;
  createdAt: string;
};

const releases = new Map<string, ApiSdkReleaseManifest>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneRelease(release: ApiSdkReleaseManifest): ApiSdkReleaseManifest {
  return { ...release };
}

export function createApiSdkReleaseManifest(input: {
  id?: string;
  clientId: string;
}): ApiSdkReleaseManifest {
  const clientId = input.clientId.trim();
  if (!clientId) throw new Error("manifest.clientId is required");

  const client = getSdkClient(clientId);
  if (!client) throw new Error(`client not found: ${clientId}`);

  const operations = listSdkOperations({ clientId });
  if (operations.length < 1) throw new Error("sdk operation missing");
  const schemas = listSdkSchemas({ operationId: operations[0].id });
  if (schemas.length < 1) throw new Error("sdk schema missing");
  const packages = listSdkPackages({ clientId });
  const published = packages.find((p) => p.status === "PUBLISHED");
  if (!published) throw new Error("published sdk package missing");

  const payload = {
    clientKey: client.clientKey,
    kind: client.kind,
    gatewayKeyRef: client.gatewayKeyRef,
    operation: {
      operationKey: operations[0].operationKey,
      method: operations[0].method,
      path: operations[0].path,
      routeKeyRef: operations[0].routeKeyRef,
    },
    schema: {
      schemaKey: schemas[0].schemaKey,
      kind: schemas[0].kind,
      shapeRef: schemas[0].shapeRef,
    },
    package: {
      packageKey: published.packageKey,
      semver: published.semver,
      status: published.status,
    },
  };

  const id = input.id?.trim() || createId("apisdkrel");
  if (releases.has(id)) throw new Error(`release already exists: ${id}`);

  const release: ApiSdkReleaseManifest = {
    id,
    clientId,
    clientKey: client.clientKey,
    checksum: createHash("sha256")
      .update(JSON.stringify(payload))
      .digest("hex"),
    operationId: operations[0].id,
    schemaId: schemas[0].id,
    packageId: published.id,
    createdAt: nowIso(),
  };
  releases.set(id, release);
  return cloneRelease(release);
}

export function getApiSdkReleaseManifest(
  id: string,
): ApiSdkReleaseManifest | undefined {
  const release = releases.get(id.trim());
  return release ? cloneRelease(release) : undefined;
}

export function listApiSdkReleaseManifests(): ApiSdkReleaseManifest[] {
  return [...releases.values()]
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneRelease);
}

export function clearApiSdkReleaseManifests(): void {
  releases.clear();
}

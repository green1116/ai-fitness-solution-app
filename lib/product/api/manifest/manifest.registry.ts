/**
 * Product API — Release manifest + checksum
 */

import { createHash } from "node:crypto";

import { listApiDefinitions } from "../definition/definition.registry";
import { listApiLifecycles } from "../lifecycle/lifecycle.registry";
import { listApiPolicies } from "../policy/policy.registry";
import { getApi } from "../registry/api.registry";
import { listApiVersions } from "../version/version.registry";

export type ApiReleaseManifest = {
  id: string;
  apiId: string;
  apiKey: string;
  checksum: string;
  definitionId: string;
  versionId: string;
  lifecycleId: string;
  policyId: string;
  createdAt: string;
};

const releases = new Map<string, ApiReleaseManifest>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneRelease(release: ApiReleaseManifest): ApiReleaseManifest {
  return { ...release };
}

export function createApiReleaseManifest(input: {
  id?: string;
  apiId: string;
}): ApiReleaseManifest {
  const apiId = input.apiId.trim();
  if (!apiId) throw new Error("manifest.apiId is required");

  const api = getApi(apiId);
  if (!api) throw new Error(`api not found: ${apiId}`);

  const definitions = listApiDefinitions({ apiId });
  if (definitions.length < 1) throw new Error("definition missing");
  const versions = listApiVersions({ apiId });
  if (versions.length < 1) throw new Error("version missing");
  const lifecycles = listApiLifecycles({ apiId });
  const published = lifecycles.find((l) => l.state === "PUBLISHED");
  if (!published) throw new Error("published lifecycle missing");
  const policies = listApiPolicies({ apiId });
  if (policies.length < 1) throw new Error("policy missing");

  const payload = {
    apiKey: api.apiKey,
    kind: api.kind,
    definitions: definitions
      .map((d) => ({ path: d.path, method: d.method, summary: d.summary }))
      .sort((a, b) =>
        `${a.method}:${a.path}`.localeCompare(`${b.method}:${b.path}`),
      ),
    versions: versions
      .map((v) => ({
        versionTag: v.versionTag,
        definitionIds: [...v.definitionIds],
      }))
      .sort((a, b) => a.versionTag.localeCompare(b.versionTag)),
    lifecycle: { state: published.state, versionId: published.versionId },
    policy: {
      mode: policies[0].mode,
      requireVersion: policies[0].requireVersion,
    },
  };

  const id = input.id?.trim() || createId("apirel");
  if (releases.has(id)) throw new Error(`release already exists: ${id}`);

  const release: ApiReleaseManifest = {
    id,
    apiId,
    apiKey: api.apiKey,
    checksum: createHash("sha256")
      .update(JSON.stringify(payload))
      .digest("hex"),
    definitionId: definitions[0].id,
    versionId: versions[0].id,
    lifecycleId: published.id,
    policyId: policies[0].id,
    createdAt: nowIso(),
  };
  releases.set(id, release);
  return cloneRelease(release);
}

export function getApiReleaseManifest(
  id: string,
): ApiReleaseManifest | undefined {
  const release = releases.get(id.trim());
  return release ? cloneRelease(release) : undefined;
}

export function listApiReleaseManifests(): ApiReleaseManifest[] {
  return [...releases.values()]
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneRelease);
}

export function clearApiReleaseManifests(): void {
  releases.clear();
}

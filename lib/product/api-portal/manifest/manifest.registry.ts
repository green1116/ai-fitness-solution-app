/**
 * Product API Portal — Release manifest + checksum
 */

import { createHash } from "node:crypto";

import { listPortalCatalogEntries } from "../catalog/catalog.registry";
import { listPortalDocuments } from "../documentation/documentation.registry";
import { getPortal } from "../registry/portal.registry";
import { listPortalSurfaces } from "../surface/surface.registry";

export type ApiPortalReleaseManifest = {
  id: string;
  portalId: string;
  portalKey: string;
  checksum: string;
  documentId: string;
  catalogId: string;
  surfaceId: string;
  createdAt: string;
};

const releases = new Map<string, ApiPortalReleaseManifest>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneRelease(
  release: ApiPortalReleaseManifest,
): ApiPortalReleaseManifest {
  return { ...release };
}

export function createApiPortalReleaseManifest(input: {
  id?: string;
  portalId: string;
}): ApiPortalReleaseManifest {
  const portalId = input.portalId.trim();
  if (!portalId) throw new Error("manifest.portalId is required");

  const portal = getPortal(portalId);
  if (!portal) throw new Error(`portal not found: ${portalId}`);

  const documents = listPortalDocuments({ portalId });
  if (documents.length < 1) throw new Error("portal document missing");
  const catalogs = listPortalCatalogEntries({ portalId });
  const published = catalogs.find((c) => c.status === "PUBLISHED");
  if (!published) throw new Error("published catalog entry missing");
  const surfaces = listPortalSurfaces({ portalId });
  if (surfaces.length < 1) throw new Error("portal surface missing");

  const payload = {
    portalKey: portal.portalKey,
    status: portal.status,
    sdkClientKeyRef: portal.sdkClientKeyRef,
    document: {
      docKey: documents[0].docKey,
      kind: documents[0].kind,
      slug: documents[0].slug,
    },
    catalog: {
      catalogKey: published.catalogKey,
      sdkPackageKeyRef: published.sdkPackageKeyRef,
      sdkSemverRef: published.sdkSemverRef,
      status: published.status,
    },
    surface: {
      surfaceKey: surfaces[0].surfaceKey,
      kind: surfaces[0].kind,
      path: surfaces[0].path,
    },
  };

  const id = input.id?.trim() || createId("apiportalrel");
  if (releases.has(id)) throw new Error(`release already exists: ${id}`);

  const release: ApiPortalReleaseManifest = {
    id,
    portalId,
    portalKey: portal.portalKey,
    checksum: createHash("sha256")
      .update(JSON.stringify(payload))
      .digest("hex"),
    documentId: documents[0].id,
    catalogId: published.id,
    surfaceId: surfaces[0].id,
    createdAt: nowIso(),
  };
  releases.set(id, release);
  return cloneRelease(release);
}

export function getApiPortalReleaseManifest(
  id: string,
): ApiPortalReleaseManifest | undefined {
  const release = releases.get(id.trim());
  return release ? cloneRelease(release) : undefined;
}

export function listApiPortalReleaseManifests(): ApiPortalReleaseManifest[] {
  return [...releases.values()]
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneRelease);
}

export function clearApiPortalReleaseManifests(): void {
  releases.clear();
}

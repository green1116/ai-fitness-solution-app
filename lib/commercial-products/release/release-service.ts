import { buildReleaseManifest, validateReleaseManifest } from "./release-manifest";
import { appendReleaseLedger, clearReleaseLedger, listReleaseLedger } from "./release-ledger";
import type {
  ReleaseCreateInput,
  ReleaseLedgerEntry,
  ReleaseListResponse,
  ReleaseLookup,
  ReleaseManifest,
  ReleasePublishInput,
  ReleaseRecord,
  ReleaseRecordResponse,
  ReleaseVerification,
} from "./release-types";
import {
  CP_RELEASE_PRODUCT_VERSION,
  CP_RELEASE_TAG,
  RELEASE_MODULE,
} from "./release-types";

const releases = new Map<string, ReleaseRecord>();

function defaultVerification(input?: Partial<ReleaseVerification>): ReleaseVerification {
  return {
    tsc: input?.tsc ?? true,
    build: input?.build ?? true,
    verify: input?.verify ?? true,
  };
}

function defaultFeatures(): string[] {
  return RELEASE_MODULE.map((module) => `commercial-${module}`);
}

function findRelease(lookup: ReleaseLookup): ReleaseRecord | undefined {
  if (lookup.releaseId) return releases.get(lookup.releaseId);
  for (const record of releases.values()) {
    if (lookup.tag && record.tag === lookup.tag) return record;
    if (lookup.version && record.version === lookup.version) return record;
  }
  return undefined;
}

export class ReleaseService {
  static createRelease(input: ReleaseCreateInput = {}): ReleaseRecordResponse {
    const releaseId = `release-${input.tag ?? CP_RELEASE_TAG}-${Date.now()}`;
    const record: ReleaseRecord = {
      releaseId,
      version: input.version ?? CP_RELEASE_PRODUCT_VERSION,
      status: "draft",
      tag: input.tag ?? CP_RELEASE_TAG,
      features: input.features ?? defaultFeatures(),
      verification: defaultVerification(input.verification),
      createdAt: Date.now(),
    };

    releases.set(releaseId, record);
    const manifest = buildReleaseManifest(record);
    return { ok: true, release: record, manifest };
  }

  static publishRelease(input: ReleasePublishInput): ReleaseRecordResponse {
    const record = releases.get(input.releaseId);
    if (!record) throw new Error(`Release not found: ${input.releaseId}`);

    record.status = "released";
    record.publishedAt = Date.now();
    releases.set(record.releaseId, record);

    const manifest = buildReleaseManifest(record);
    const ledgerEntry: ReleaseLedgerEntry = {
      ledgerId: `ledger-${record.releaseId}`,
      releaseId: record.releaseId,
      version: record.version,
      tag: record.tag,
      status: record.status,
      modules: [...RELEASE_MODULE],
      verification: record.verification,
      publishedAt: record.publishedAt,
    };
    appendReleaseLedger(ledgerEntry);

    return { ok: true, release: record, manifest };
  }

  static listReleases(): ReleaseListResponse {
    const manifest = buildReleaseManifest();
    return {
      ok: true,
      releases: [...releases.values()].sort((a, b) => b.createdAt - a.createdAt),
      ledger: listReleaseLedger(),
      manifest,
    };
  }

  static getRelease(lookup: ReleaseLookup): ReleaseRecordResponse {
    const record = findRelease(lookup);
    if (!record) throw new Error("Release not found");
    return { ok: true, release: record, manifest: buildReleaseManifest(record) };
  }

  static buildReleaseManifest(release?: ReleaseRecord): ReleaseManifest {
    const manifest = buildReleaseManifest(release);
    if (!validateReleaseManifest(manifest)) {
      throw new Error("Release manifest validation failed");
    }
    return manifest;
  }

  static clearAll(): void {
    releases.clear();
    clearReleaseLedger();
  }
}

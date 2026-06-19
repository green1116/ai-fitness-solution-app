import { RELEASE_VERSION } from "./release-types";
import type { ReleaseCreateInput, ReleaseLookup, ReleasePublishInput } from "./release-types";
import { ReleaseService } from "./release-service";

export function createRelease(input: ReleaseCreateInput = {}) {
  return ReleaseService.createRelease(input);
}

export function publishRelease(input: ReleasePublishInput) {
  return ReleaseService.publishRelease(input);
}

export function listReleases() {
  return ReleaseService.listReleases();
}

export function getRelease(lookup: ReleaseLookup) {
  return ReleaseService.getRelease(lookup);
}

export function buildReleaseManifestSnapshot() {
  return ReleaseService.buildReleaseManifest();
}

export function getReleaseRuntimeMeta() {
  return {
    runtimeId: "cp-release-runtime-v47-p2-s10",
    version: RELEASE_VERSION,
    mode: "commercial-products-release" as const,
  };
}

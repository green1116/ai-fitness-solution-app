import type { ReleaseCreateInput, ReleaseLookup, ReleasePublishInput } from "./release-types";

export async function createReleaseHeavy(input: ReleaseCreateInput = {}) {
  const { createRelease } = await import("./release-runtime");
  return createRelease(input);
}

export async function publishReleaseHeavy(input: ReleasePublishInput) {
  const { publishRelease } = await import("./release-runtime");
  return publishRelease(input);
}

export async function listReleasesHeavy() {
  const { listReleases } = await import("./release-runtime");
  return listReleases();
}

export async function getReleaseHeavy(lookup: ReleaseLookup) {
  const { getRelease } = await import("./release-runtime");
  return getRelease(lookup);
}

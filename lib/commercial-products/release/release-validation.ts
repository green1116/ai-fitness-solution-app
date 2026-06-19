import { ReleaseService } from "./release-service";
import { validateReleaseManifest } from "./release-manifest";
import type { ReleaseValidation } from "./release-types";
import { CP_RELEASE_API_PATH, CP_RELEASE_PAGE_PATH, CP_RELEASE_TAG } from "./release-types";
import { createRelease, listReleases, publishRelease } from "./release-runtime";

export function validateCommercialRelease(): ReleaseValidation {
  let runtimeOk = false;
  let serviceOk = false;
  let ledgerOk = false;
  let manifestOk = false;

  try {
    ReleaseService.clearAll();

    const created = createRelease({ tag: CP_RELEASE_TAG });
    const draftStatus = created.release.status;
    const published = publishRelease({ releaseId: created.release.releaseId });
    const listed = listReleases();

    runtimeOk =
      draftStatus === "draft" &&
      published.release.status === "released" &&
      Boolean(published.release.publishedAt);

    serviceOk = listed.releases.length >= 1;
    ledgerOk = listed.ledger.length >= 1 && listed.ledger[0]?.tag === CP_RELEASE_TAG;
    manifestOk = validateReleaseManifest(listed.manifest);
  } catch {
    // flags remain false
  }

  const apiPathRegistered = CP_RELEASE_API_PATH === "/api/commercial-products/release";
  const pagePathRegistered = CP_RELEASE_PAGE_PATH === "/commercial/v47/release";
  const valid =
    runtimeOk && serviceOk && ledgerOk && manifestOk && apiPathRegistered && pagePathRegistered;

  return {
    valid,
    runtimeOk,
    serviceOk,
    ledgerOk,
    manifestOk,
    apiPathRegistered,
    pagePathRegistered,
    summary: [
      `runtimeOk=${runtimeOk}`,
      `serviceOk=${serviceOk}`,
      `ledgerOk=${ledgerOk}`,
      `manifestOk=${manifestOk}`,
      `apiPathRegistered=${apiPathRegistered}`,
      `pagePathRegistered=${pagePathRegistered}`,
      `valid=${valid}`,
    ].join(" "),
  };
}

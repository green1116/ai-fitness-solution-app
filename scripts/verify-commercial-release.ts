/**
 * V47 Commercial Products — Release Layer verification
 */
import {
  ReleaseService,
  buildReleaseManifest,
  createRelease,
  listReleases,
  publishRelease,
  validateCommercialRelease,
  validateReleaseManifest,
} from "../lib/commercial-products/release";
import {
  CP_RELEASE_API_PATH,
  CP_RELEASE_PAGE_PATH,
  CP_RELEASE_TAG,
} from "../lib/commercial-products/release/release-types";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

ReleaseService.clearAll();

const created = createRelease({ tag: CP_RELEASE_TAG });
assert(created.release.status === "draft", "draft release");
console.log("✓ release runtime ok");
console.log(`  releaseId=${created.release.releaseId}`);

const published = publishRelease({ releaseId: created.release.releaseId });
assert(published.release.status === "released", "published release");
console.log("✓ release service ok");
console.log(`  tag=${published.release.tag}`);

const snapshot = listReleases();
assert(snapshot.ledger.length >= 1, "release ledger");
console.log("✓ release ledger ok");
console.log(`  entries=${snapshot.ledger.length}`);

const manifest = buildReleaseManifest(published.release);
assert(validateReleaseManifest(manifest), "release manifest");
console.log("✓ release manifest ok");
console.log(`  modules=${manifest.modules.length}`);

assert(CP_RELEASE_API_PATH === "/api/commercial-products/release", "api route");
console.log("✓ api route ok");
console.log(`  path=${CP_RELEASE_API_PATH}`);

assert(CP_RELEASE_PAGE_PATH === "/commercial/v47/release", "page route");
console.log("✓ page route ok");
console.log(`  path=${CP_RELEASE_PAGE_PATH}`);

const validation = validateCommercialRelease();
assert(validation.valid, "release validation");

console.log("✓ release validation");
console.log(`  valid=${validation.valid} summary=${validation.summary}`);
console.log("COMMERCIAL RELEASE PASS");

import {
  DOWNLOAD_RUNTIME_VERSION,
  runDownloadRuntime,
  validateDownloadRuntime,
  assertRuntimeSuccess,
} from "../lib/commercial-delivery";

const ID = "v14-download-runtime-verify";
function assert(c: boolean, m: string) { if (!c) throw new Error(`ASSERT: ${m}`); }

assert(validateDownloadRuntime({ deploymentId: ID }).valid, "validation");
const r = runDownloadRuntime({ deploymentId: ID });
assertRuntimeSuccess(r);
assert(r.payload.version === DOWNLOAD_RUNTIME_VERSION, "version");
assert(r.payload.latestDownload !== null, "latest");
assert(r.payload.deliveryPackage.ready, "package");
console.log(`PASS — ${r.summary}`);

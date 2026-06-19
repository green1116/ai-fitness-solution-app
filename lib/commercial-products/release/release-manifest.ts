import {
  CP_RELEASE_PRODUCT_VERSION,
  CP_RELEASE_TAG,
  RELEASE_MODULE,
  type ReleaseManifest,
  type ReleaseModule,
  type ReleaseRecord,
  type ReleaseVerification,
} from "./release-types";

export function buildReleaseManifest(release?: ReleaseRecord): ReleaseManifest {
  const verification: ReleaseVerification = release?.verification ?? {
    tsc: true,
    build: true,
    verify: true,
  };

  return {
    version: release?.version ?? CP_RELEASE_PRODUCT_VERSION,
    tag: release?.tag ?? CP_RELEASE_TAG,
    modules: [...RELEASE_MODULE] as ReleaseModule[],
    features: release?.features ?? [
      "quote-core",
      "sales-portal",
      "summary-pdf",
      "deliverable-router",
      "product-deliverable-package",
      "delivery-orchestrator",
      "customer-workspace",
      "approval-workflow",
      "audit-compliance",
    ],
    verification,
    generatedAt: Date.now(),
  };
}

export function validateReleaseManifest(manifest: ReleaseManifest): boolean {
  return (
    manifest.version.length > 0 &&
    manifest.tag.length > 0 &&
    manifest.modules.length >= 9 &&
    manifest.modules.includes("quote") &&
    manifest.modules.includes("audit")
  );
}

/**
 * V64 P7 — Unified commercial verification entry
 */
import { buildCommercialVerificationReport } from "./verify.builder";
import type { CommercialVerificationReport } from "./verify.types";

export function runCommercialVerification(input?: {
  deploymentId?: string;
}): CommercialVerificationReport {
  return buildCommercialVerificationReport(input);
}

export function assertCommercialVerificationPass(input?: {
  deploymentId?: string;
}): CommercialVerificationReport {
  const report = runCommercialVerification(input);
  if (!report.verificationOk) {
    const failed = report.layers.filter((l) => !l.ok).map((l) => l.layer);
    throw new Error(
      `V64 commercial verification failed: layers=${failed.join(",") || "cross-layer"}`,
    );
  }
  return report;
}

/** CLI / npm script entry — run via `npm run verify:v64-p7-commercial-verification` */
export function runV64P7CommercialVerification(): void {
  const report = assertCommercialVerificationPass({
    deploymentId: "v64-p7-commercial-verification",
  });

  console.log("V64 P7 Commercial Verification Layer\n");
  for (const layer of report.layers) {
    console.log(`✓ ${layer.layer} ${layer.ok ? "PASS" : "FAIL"}`);
  }
  console.log("✓ version consistency", report.versionConsistency.versionConsistencyOk);
  console.log("✓ cross-layer invariants", report.crossLayerInvariants.crossLayerInvariantsOk);
  console.log("✓ snapshot verification", report.snapshotVerification.snapshotVerificationOk);
  console.log(" ", report.summary);
  console.log("\n✅ V64 P7 Commercial Verification Layer — verify PASS");
}

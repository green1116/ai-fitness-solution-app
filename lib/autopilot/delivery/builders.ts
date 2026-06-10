import type { DeliveryArtifact, DeliveryPackage } from "./types";
import { DELIVERY_ARTIFACT_TYPES } from "./types";

const ARTIFACT_META: Record<
  (typeof DELIVERY_ARTIFACT_TYPES)[number],
  { label: string; filename: string; moduleRef: string; sizeEstimateKb: number }
> = {
  "proposal-pdf": {
    label: "Proposal PDF 投标方案",
    filename: "proposal.pdf",
    moduleRef: "proposal-pdf/render",
    sizeEstimateKb: 2400,
  },
  "plan-pdf": {
    label: "Plan PDF 平面布置图",
    filename: "plan.pdf",
    moduleRef: "pdf/tender/plan",
    sizeEstimateKb: 1800,
  },
  "budget-pdf": {
    label: "Budget PDF 预算清单",
    filename: "budget.pdf",
    moduleRef: "pdf/tender/budget",
    sizeEstimateKb: 960,
  },
  "enterprise-zip": {
    label: "Enterprise ZIP 企业交付包",
    filename: "tender-pack.zip",
    moduleRef: "entitlements/zipAccess",
    sizeEstimateKb: 5200,
  },
};

export function buildDeliveryArtifacts(input?: {
  deploymentId?: string;
}): DeliveryArtifact[] {
  const deploymentId = input?.deploymentId ?? "delivery-default";
  return DELIVERY_ARTIFACT_TYPES.map((type) => {
    const meta = ARTIFACT_META[type];
    return {
      artifactId: `artifact-${type}-${deploymentId}`,
      type,
      label: meta.label,
      filename: meta.filename,
      ready: true,
      moduleRef: meta.moduleRef,
      sizeEstimateKb: meta.sizeEstimateKb,
    };
  });
}

export function buildDeliveryPackage(input?: {
  deploymentId?: string;
  jobId?: string;
}): DeliveryPackage {
  const deploymentId = input?.deploymentId ?? "delivery-default";
  const jobId = input?.jobId ?? `autopilot-job-${deploymentId}`;
  const artifacts = buildDeliveryArtifacts({ deploymentId });

  return {
    packageId: `delivery-package-${deploymentId}`,
    jobId,
    artifacts,
    allReady: artifacts.every((a) => a.ready),
    generatedAt: new Date().toISOString(),
  };
}


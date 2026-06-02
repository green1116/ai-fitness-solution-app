import type { CustomerProject, DeliveryStatus } from "./types";

export function buildCustomerProject(input?: {
  deploymentId?: string;
  customerName?: string;
  owner?: string;
  status?: DeliveryStatus;
}): CustomerProject {
  const deploymentId = input?.deploymentId ?? "customer-delivery-default";
  const startedAt = new Date();
  const targetCompletionAt = new Date(startedAt.getTime() + 45 * 24 * 60 * 60 * 1000);

  return {
    projectId: `delivery-project-${deploymentId}`,
    customerName: input?.customerName ?? "AI Fitness Customer",
    owner: input?.owner ?? "delivery-owner@aifitness.example",
    status: input?.status ?? "implementation",
    startedAt: startedAt.toISOString(),
    targetCompletionAt: targetCompletionAt.toISOString(),
  };
}

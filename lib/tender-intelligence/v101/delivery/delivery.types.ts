/**
 * E01-P7 — Enterprise Delivery Intelligence types
 * Assemble P1–P6 outputs into Enterprise Delivery Package lifecycle
 */

import type { AgentOrchestrationResult } from "../agent/agent.types";

export const V101_ENTERPRISE_DELIVERY_VERSION = "v101-enterprise-delivery-1" as const;
export const V101_ENTERPRISE_DELIVERY_FREEZE_VERSION =
  "v101-enterprise-delivery-freeze-1" as const;

export type DeliveryLifecycleStage = "orchestration" | "package" | "seal";

export type DeliveryPackageStatus = "pending" | "assembled" | "sealed" | "failed";

export type DeliveryLayer = "P1" | "P2" | "P3" | "P4" | "P5" | "P6";

export type DeliveryArtifactKind =
  | "intake_report"
  | "understanding_report"
  | "intelligence_report"
  | "strategy_report"
  | "proposal_report"
  | "workspace"
  | "requirement_index"
  | "opportunity"
  | "strategy"
  | "blueprint"
  | "orchestration_report";

export type DeliveryChecklistStatus = "pass" | "fail" | "pending";

export type DeliveryPackageItem = {
  id: string;
  kind: DeliveryArtifactKind;
  layer: DeliveryLayer;
  label: string;
  refId?: string;
  required: boolean;
  present: boolean;
  readOnly: true;
};

export type DeliveryChecklistItem = {
  id: string;
  code: string;
  label: string;
  status: DeliveryChecklistStatus;
  detail: string;
  readOnly: true;
};

export type DeliverySeal = {
  id: string;
  packageId: string;
  sealedAt: string;
  packageHash: string;
  freezeVersion: typeof V101_ENTERPRISE_DELIVERY_FREEZE_VERSION;
  artifactCount: number;
  readOnly: true;
};

export type EnterpriseDeliveryPackage = {
  id: string;
  orchestrationReportId: string;
  deploymentId: string;
  status: DeliveryPackageStatus;
  title: string;
  ownerHint: string;
  itemCount: number;
  presentCount: number;
  requiredCount: number;
  completenessRatio: number;
  checklistPassCount: number;
  checklistCount: number;
  items: DeliveryPackageItem[];
  checklist: DeliveryChecklistItem[];
  seal: DeliverySeal | null;
  narrative: string[];
  summary: string;
  createdAt: string;
  updatedAt: string;
  readOnly: true;
};

export type DeliveryLifecycleTransition = {
  from: DeliveryLifecycleStage;
  to: DeliveryLifecycleStage;
  at: string;
  note?: string;
  readOnly: true;
};

export type DeliveryLifecycle = {
  current: DeliveryLifecycleStage;
  stages: DeliveryLifecycleStage[];
  transitions: DeliveryLifecycleTransition[];
  complete: boolean;
  readOnly: true;
};

export type DeliveryKernelInput = {
  deploymentId?: string;
  orchestration: AgentOrchestrationResult;
  titleHint?: string;
  ownerHint?: string;
};

export type DeliveryKernelResult = {
  version: typeof V101_ENTERPRISE_DELIVERY_VERSION;
  freezeVersion: typeof V101_ENTERPRISE_DELIVERY_FREEZE_VERSION;
  reportId: string;
  deploymentId: string;
  generatedAt: string;
  orchestration: AgentOrchestrationResult;
  package: EnterpriseDeliveryPackage | null;
  lifecycle: DeliveryLifecycle;
  ready: boolean;
  readinessScore: number;
  summary: string;
};

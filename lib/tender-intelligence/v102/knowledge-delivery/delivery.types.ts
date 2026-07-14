/**
 * E02-P7 — Knowledge Delivery Intelligence types
 * Memory Recommendation → Enterprise Knowledge Package lifecycle
 */

import type { KnowledgeContext } from "../retrieval/retrieval.types";
import type { SimilarTenderProfile } from "../similarity/similarity.types";
import type {
  MemoryAgentRecommendation,
  MemoryRecommendationItem,
} from "../memory-agent/memory-agent.types";

export const V102_KNOWLEDGE_DELIVERY_VERSION = "v102-knowledge-delivery-1" as const;
export const V102_KNOWLEDGE_DELIVERY_FREEZE_VERSION =
  "v102-knowledge-delivery-freeze-1" as const;

export type KnowledgeDeliveryLifecycleStage =
  | "recommendation"
  | "package"
  | "seal";

export type KnowledgePackageStatus =
  | "pending"
  | "assembled"
  | "sealed"
  | "failed";

export type KnowledgePackageSectionKind =
  | "context_summary"
  | "similarity_profile"
  | "reuse_playbook"
  | "evidence_bundle"
  | "pricing_alignment"
  | "compliance_checklist"
  | "delivery_plan";

export type KnowledgePackageChecklistStatus = "pass" | "fail" | "pending";

export type KnowledgePackageSection = {
  id: string;
  kind: KnowledgePackageSectionKind;
  title: string;
  order: number;
  itemIds: string[];
  summary: string;
  readOnly: true;
};

export type KnowledgePackageChecklistItem = {
  id: string;
  code: string;
  label: string;
  status: KnowledgePackageChecklistStatus;
  detail: string;
  readOnly: true;
};

export type KnowledgePackageSeal = {
  id: string;
  packageId: string;
  sealedAt: string;
  packageHash: string;
  freezeVersion: typeof V102_KNOWLEDGE_DELIVERY_FREEZE_VERSION;
  sectionCount: number;
  recommendationCount: number;
  readOnly: true;
};

export type EnterpriseKnowledgePackage = {
  id: string;
  recommendationId: string;
  contextId: string;
  profileId: string;
  deploymentId: string;
  status: KnowledgePackageStatus;
  title: string;
  ownerHint: string;
  sectionCount: number;
  recommendationCount: number;
  highPriorityCount: number;
  checklistPassCount: number;
  checklistCount: number;
  completenessRatio: number;
  sections: KnowledgePackageSection[];
  recommendations: MemoryRecommendationItem[];
  checklist: KnowledgePackageChecklistItem[];
  seal: KnowledgePackageSeal | null;
  narrative: string[];
  summary: string;
  createdAt: string;
  updatedAt: string;
  readOnly: true;
};

export type KnowledgeDeliveryLifecycleTransition = {
  from: KnowledgeDeliveryLifecycleStage;
  to: KnowledgeDeliveryLifecycleStage;
  at: string;
  note?: string;
  readOnly: true;
};

export type KnowledgeDeliveryLifecycle = {
  current: KnowledgeDeliveryLifecycleStage;
  stages: KnowledgeDeliveryLifecycleStage[];
  transitions: KnowledgeDeliveryLifecycleTransition[];
  complete: boolean;
  readOnly: true;
};

export type KnowledgeDeliveryKernelInput = {
  deploymentId?: string;
  recommendation: MemoryAgentRecommendation;
  context?: KnowledgeContext;
  profile?: SimilarTenderProfile;
  titleHint?: string;
  ownerHint?: string;
};

export type KnowledgeDeliveryKernelResult = {
  version: typeof V102_KNOWLEDGE_DELIVERY_VERSION;
  freezeVersion: typeof V102_KNOWLEDGE_DELIVERY_FREEZE_VERSION;
  reportId: string;
  deploymentId: string;
  generatedAt: string;
  recommendation: MemoryAgentRecommendation;
  package: EnterpriseKnowledgePackage | null;
  lifecycle: KnowledgeDeliveryLifecycle;
  ready: boolean;
  readinessScore: number;
  summary: string;
};

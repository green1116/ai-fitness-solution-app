import type { PROPOSAL_GENERATION_VERSION } from "../shared/types";

export const DELIVERY_SCHEDULE_RUNTIME_VERSION = "v11.0-delivery-schedule-runtime-1" as const;

export interface DeliveryPlanItem { itemId: string; deliverable: string; scheduledDate: string; status: "planned" | "in-progress" | "completed"; }
export interface AcceptancePlanItem { acceptId: string; criterion: string; method: string; responsible: string; }
export interface SupportPlanItem { supportId: string; service: string; sla: string; duration: string; }

export interface DeliveryScheduleRuntimePayload {
  version: typeof DELIVERY_SCHEDULE_RUNTIME_VERSION;
  proposalVersion: typeof PROPOSAL_GENERATION_VERSION;
  deliveryPlan: DeliveryPlanItem[];
  acceptancePlan: AcceptancePlanItem[];
  supportPlan: SupportPlanItem[];
  summary: string;
}

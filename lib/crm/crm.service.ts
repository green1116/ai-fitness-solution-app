/**
 * V60 P2 — CRM service orchestrator
 */

export { createCustomer, findOrCreateCustomer, listCustomers, getCustomerById } from "./customer/customer.service";
export { updateCustomerLifecycle } from "./customer/customer.lifecycle";
export { createLead, scoreLeadById, promoteLeadToOpportunity } from "./lead/lead.service";
export { scoreLead } from "./lead/lead.scoring";
export { createOpportunity, updateOpportunityStage } from "./opportunity/opportunity.service";
export { createDeal, closeDealWon, closeDealLost, trackDealProgress, calculateDealValue } from "./deal/deal.service";
export { logCRMActivity, logProductActivity } from "./activity/activity.tracker";
export { buildCustomerTimeline } from "./activity/activity.timeline";
export { aggregateCRMMetrics } from "./crm.metrics";
export { describeSalesFunnel, advanceLeadToOpportunity } from "./pipeline/crm.pipeline.engine";
export { assembleCrmWorkSurface } from "./crm.workspace-surface";
export {
  recordEnterpriseConsultationAsLead,
  recordQuoteAsLead,
  recordBudgetAsOpportunity,
  recordTenderAsDeal,
} from "./crm.product-bridge";

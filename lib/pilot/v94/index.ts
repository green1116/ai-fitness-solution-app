/**
 * V94 — Executive briefing & decision support
 */

export {
  V94_EXECUTIVE_BRIEFING_VERSION,
  type BriefingActionEntry,
  type BriefingActionType,
  type BriefingContent,
  type BriefingPack,
  type BriefingPackDetail,
  type BriefingPackStatus,
  type BriefingPriority,
  type DecisionSupportItem,
  type ExecutiveBriefingDashboard,
  type KeyOpportunityItem,
  type KeyRiskItem,
  type PendingDecisionItem,
} from "./executive-briefing/briefing.types";

export {
  clearBriefingCacheForTests,
  getBriefingPack,
  listBriefingActions,
  listBriefingPacks,
  listPackActions,
} from "./executive-briefing/briefing-cache";

export { buildBriefingContent } from "./executive-briefing/briefing.service";

export { buildDecisionSupportList } from "./executive-briefing/decision-support.service";

export {
  generateBriefingPack,
  markDecisionActed,
  recordBriefingAction,
} from "./executive-briefing/briefing-pack.service";

export {
  buildBriefingPackDetail,
  buildExecutiveBriefingDashboard,
} from "./executive-briefing/briefing-dashboard.service";

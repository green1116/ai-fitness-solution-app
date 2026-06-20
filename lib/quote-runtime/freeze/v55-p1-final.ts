import { WORKSPACE_QUOTE_RUNTIME_P1_META, V55_QUOTE_P1_VERIFY_CHECKS } from "./v55-p1-meta";
import { WORKSPACE_QUOTE_RUNTIME_P1_TAG } from "../shared/quote-constants";

export const WORKSPACE_QUOTE_RUNTIME_P1_FREEZE = {
  tag: WORKSPACE_QUOTE_RUNTIME_P1_TAG,
  version: WORKSPACE_QUOTE_RUNTIME_P1_META.version,
  status: WORKSPACE_QUOTE_RUNTIME_P1_META.status,
  frozen: false,
  dependencyTag: WORKSPACE_QUOTE_RUNTIME_P1_META.dependencyTag,
  verifyChecks: V55_QUOTE_P1_VERIFY_CHECKS,
  nextHorizon: WORKSPACE_QUOTE_RUNTIME_P1_META.nextHorizon,
  note: WORKSPACE_QUOTE_RUNTIME_P1_META.note,
} as const;

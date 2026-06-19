import {
  SAAS_PRODUCT_PORTAL_P2_TAG,
  SAAS_PRODUCT_PORTAL_VERSION,
  V51_API_DEPENDENCY_TAG,
} from "./shared/portal-constants";
import { SAAS_PRODUCT_PORTAL_P2_FREEZE } from "./freeze/v52-p2-meta";

export const SAAS_PRODUCT_PORTAL_META = {
  version: SAAS_PRODUCT_PORTAL_VERSION,
  tag: SAAS_PRODUCT_PORTAL_P2_TAG,
  phase: "v52-portal-ui-p2",
  status: SAAS_PRODUCT_PORTAL_P2_FREEZE.status,
  dependencyTag: SAAS_PRODUCT_PORTAL_P2_FREEZE.dependencyTag,
  apiDependencyTag: V51_API_DEPENDENCY_TAG,
  frozen: SAAS_PRODUCT_PORTAL_P2_FREEZE.frozen,
  nextHorizon: SAAS_PRODUCT_PORTAL_P2_FREEZE.nextHorizon,
} as const;

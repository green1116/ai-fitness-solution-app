import {
  SAAS_PRODUCT_PORTAL_P7_TAG,
  SAAS_PRODUCT_PORTAL_VERSION,
  V51_API_DEPENDENCY_TAG,
} from "./shared/portal-constants";
import { SAAS_PRODUCT_PORTAL_P7_FREEZE } from "./freeze/v52-p7-meta";

export const SAAS_PRODUCT_PORTAL_META = {
  version: SAAS_PRODUCT_PORTAL_VERSION,
  tag: SAAS_PRODUCT_PORTAL_P7_TAG,
  phase: "v52-portal-ui-p7",
  status: SAAS_PRODUCT_PORTAL_P7_FREEZE.status,
  dependencyTag: SAAS_PRODUCT_PORTAL_P7_FREEZE.dependencyTag,
  apiDependencyTag: V51_API_DEPENDENCY_TAG,
  frozen: SAAS_PRODUCT_PORTAL_P7_FREEZE.frozen,
  nextHorizon: SAAS_PRODUCT_PORTAL_P7_FREEZE.nextHorizon,
} as const;

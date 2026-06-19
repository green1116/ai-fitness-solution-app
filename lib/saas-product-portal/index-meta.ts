import {
  SAAS_PRODUCT_PORTAL_P2_TAG,
  SAAS_PRODUCT_PORTAL_VERSION,
  V51_API_DEPENDENCY_TAG,
} from "./shared/portal-constants";

export const SAAS_PRODUCT_PORTAL_META = {
  version: SAAS_PRODUCT_PORTAL_VERSION,
  tag: SAAS_PRODUCT_PORTAL_P2_TAG,
  phase: "v52-portal-ui-p2",
  dependencyTag: V51_API_DEPENDENCY_TAG,
  frozen: false,
} as const;

import {
  SAAS_PRODUCT_PORTAL_P8_TAG,
  SAAS_PRODUCT_PORTAL_VERSION,
  V51_API_DEPENDENCY_TAG,
} from "./shared/portal-constants";
import { SAAS_PRODUCT_PORTAL_P8_FREEZE } from "./freeze/v52-p8-meta";

export const SAAS_PRODUCT_PORTAL_META = {
  version: SAAS_PRODUCT_PORTAL_VERSION,
  tag: SAAS_PRODUCT_PORTAL_P8_TAG,
  phase: "v52-portal-ui-p8",
  status: SAAS_PRODUCT_PORTAL_P8_FREEZE.status,
  dependencyTag: SAAS_PRODUCT_PORTAL_P8_FREEZE.dependencyTag,
  apiDependencyTag: V51_API_DEPENDENCY_TAG,
  frozen: SAAS_PRODUCT_PORTAL_P8_FREEZE.frozen,
  nextHorizon: SAAS_PRODUCT_PORTAL_P8_FREEZE.nextHorizon,
} as const;

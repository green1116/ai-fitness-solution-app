import { existsSync } from "fs";
import { join } from "path";
import {
  SAAS_PRODUCT_API_FINAL_TAG,
  SAAS_PRODUCT_API_P8_TAG,
} from "../shared/api-constants";
import { V51_META } from "../freeze/v51-final-meta";
import { validateApiP7 } from "./validate-api-p7";
import type { ApiP8Validation } from "../shared/api-types";

function validateDocumentationReady(): boolean {
  return (
    existsSync(join(process.cwd(), "docs", "commercialization", "V51-FINAL-FREEZE.md")) &&
    existsSync(join(process.cwd(), "docs", "commercialization", "V51-META.json"))
  );
}

export async function validateApiP8(): Promise<ApiP8Validation> {
  const p7 = await validateApiP7({ includeRegression: false });

  const metaLocked =
    V51_META.frozen === true &&
    V51_META.tag === SAAS_PRODUCT_API_FINAL_TAG &&
    V51_META.status === "frozen" &&
    V51_META.auditStatus === "pass" &&
    V51_META.routeCount > 0 &&
    V51_META.endpointCount > 0 &&
    V51_META.tenantProtectedCount > 0;

  const documentationReady = validateDocumentationReady();

  const valid = p7.valid && metaLocked && documentationReady;

  return {
    valid,
    summary: [
      `p8Tag=${SAAS_PRODUCT_API_P8_TAG}`,
      `finalTag=${SAAS_PRODUCT_API_FINAL_TAG}`,
      `auditStatus=${V51_META.auditStatus}`,
      `routeCount=${V51_META.routeCount}`,
      `endpointCount=${V51_META.endpointCount}`,
      `metaLocked=${metaLocked}`,
      `documentationReady=${documentationReady}`,
      `valid=${valid}`,
    ].join(" "),
    metaLocked,
    documentationReady,
    auditStatus: V51_META.auditStatus,
    routeCount: V51_META.routeCount,
    endpointCount: V51_META.endpointCount,
  };
}

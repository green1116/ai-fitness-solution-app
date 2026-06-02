/** Result 页 License 与 localStorage 对齐的键名（勿与其他模块混用） */
export const LICENSE_KEY_STORAGE_KEY = "ai_license_key";
export const LICENSE_FP_STORAGE_KEY = "ai_fingerprint";
export const LICENSE_PLAN_STORAGE_KEY = "ai_plan_id";

export type ResultLicenseFormState = {
  licenseKey: string;
  fingerprint: string;
  planId: string;
};

export function readPersistedLicenseForm(): ResultLicenseFormState {
  if (typeof window === "undefined") {
    return { licenseKey: "", fingerprint: "", planId: "attaguy-plan" };
  }
  return {
    licenseKey: (localStorage.getItem(LICENSE_KEY_STORAGE_KEY) || "").trim(),
    fingerprint: (localStorage.getItem(LICENSE_FP_STORAGE_KEY) || "").trim(),
    planId: (localStorage.getItem(LICENSE_PLAN_STORAGE_KEY) || "attaguy-plan").trim(),
  };
}

export function hasPersistedLicenseKey(): boolean {
  return Boolean(readPersistedLicenseForm().licenseKey);
}

/** 清除本机保存的 License 表单（不触发任何下载；仅用于重置授权 / 测试购买链路） */
export function clearPersistedLicenseForm(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(LICENSE_KEY_STORAGE_KEY);
    localStorage.removeItem(LICENSE_FP_STORAGE_KEY);
    localStorage.removeItem(LICENSE_PLAN_STORAGE_KEY);
  } catch {
    // ignore
  }
}

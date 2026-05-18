"use client";

import { useCallback, useEffect, useState } from "react";
import {
  LICENSE_FP_STORAGE_KEY,
  LICENSE_KEY_STORAGE_KEY,
  LICENSE_PLAN_STORAGE_KEY,
  readPersistedLicenseForm,
  type ResultLicenseFormState,
} from "@/lib/commercial/resultLicenseStorage";

const EMPTY_FORM: ResultLicenseFormState = {
  licenseKey: "",
  fingerprint: "",
  planId: "attaguy-plan",
};

export type PaidDownloadLicenseSnapshot = {
  licenseKey: string;
  fingerprint: string;
  planId: string;
};

/**
 * /result 页 License：与 SSR 一致的初始空表单，挂载后从 localStorage 恢复。
 */
export function useResultLicense(opts: {
  planId: string;
  setPageLastError: (msg: string | null) => void;
}) {
  const { planId, setPageLastError } = opts;
  const [licenseForm, setLicenseForm] =
    useState<ResultLicenseFormState>(EMPTY_FORM);
  const [licenseSaveMessage, setLicenseSaveMessage] = useState<string | null>(
    null,
  );

  /** 挂载后仅恢复 localStorage 中的 License 表单；不发起任何 PDF / 付费下载请求 */
  useEffect(() => {
    if (typeof window === "undefined") return;
    const storedKey = (localStorage.getItem(LICENSE_KEY_STORAGE_KEY) || "").trim();
    const storedFp = (localStorage.getItem(LICENSE_FP_STORAGE_KEY) || "").trim();
    const storedPlan = (localStorage.getItem(LICENSE_PLAN_STORAGE_KEY) || "").trim();

    const next: ResultLicenseFormState = {
      licenseKey: storedKey,
      fingerprint: storedFp || (storedKey ? "dev" : ""),
      planId: storedPlan || "attaguy-plan",
    };
    setLicenseForm(next);

    if (storedKey) {
      setLicenseSaveMessage("License 已保存");
    }
  }, []);

  const persistLicenseFields = useCallback(
    (raw: ResultLicenseFormState) => {
      if (typeof window === "undefined") return false;
      const nextLicenseKey = (raw.licenseKey || "").trim();
      const nextFingerprint = (raw.fingerprint || "").trim();
      const nextPlanId = (raw.planId || planId || "attaguy-plan").trim();

      setLicenseForm({
        licenseKey: nextLicenseKey,
        fingerprint: nextFingerprint,
        planId: nextPlanId,
      });

      if (!nextLicenseKey) {
        if (process.env.NODE_ENV !== "production") {
          setPageLastError("请先填写 License Key");
        }
        return false;
      }

      localStorage.setItem(LICENSE_KEY_STORAGE_KEY, nextLicenseKey);
      localStorage.setItem(LICENSE_FP_STORAGE_KEY, nextFingerprint);
      localStorage.setItem(LICENSE_PLAN_STORAGE_KEY, nextPlanId);

      setLicenseSaveMessage("License 已保存");
      return true;
    },
    [planId, setPageLastError],
  );

  const applyWebhookLicensePersist = useCallback(
    (licenseKeyRaw: string) => {
      const persisted = readPersistedLicenseForm();
      const fp =
        (licenseForm.fingerprint || persisted.fingerprint || "dev").trim() ||
        "dev";
      const pid = "attaguy-plan";
      const ok = persistLicenseFields({
        licenseKey: licenseKeyRaw.trim(),
        fingerprint: fp,
        planId: pid,
      });
      return ok;
    },
    [licenseForm, persistLicenseFields],
  );

  /**
   * Pro / Enterprise 下载：仅以 **已写入 localStorage** 的 licenseKey 为准（支付回调自动写入，或开发面板手动保存）。
   */
  const getPaidDownloadLicenseSnapshot = useCallback(
    (requestTier: "pro" | "enterprise"): PaidDownloadLicenseSnapshot | null => {
      const persisted = readPersistedLicenseForm();
      const key = persisted.licenseKey.trim();
      if (!key) {
        return null;
      }
      const fingerprint =
        (
          persisted.fingerprint ||
          licenseForm.fingerprint ||
          "dev"
        ).trim() || "dev";
      const licensePlanId = (
        persisted.planId ||
        licenseForm.planId ||
        planId ||
        "attaguy-plan"
      ).trim();
      return {
        licenseKey: key,
        fingerprint,
        planId: licensePlanId,
      };
    },
    [licenseForm, planId],
  );

  const handleSaveLicense = useCallback(() => {
    persistLicenseFields(licenseForm);
  }, [licenseForm, persistLicenseFields]);

  return {
    licenseForm,
    setLicenseForm,
    licenseSaveMessage,
    setLicenseSaveMessage,
    persistLicenseFields,
    applyWebhookLicensePersist,
    getPaidDownloadLicenseSnapshot,
    handleSaveLicense,
  };
}

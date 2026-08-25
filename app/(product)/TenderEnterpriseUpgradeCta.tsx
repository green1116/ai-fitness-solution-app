"use client";

import Link from "next/link";
import { useCallback, useRef, useState } from "react";

import EnterpriseLeadForm, {
  type EnterpriseLeadFormValue,
} from "@/components/EnterpriseLeadForm";

import type { ProductCommercialContext } from "./commercial-context";
import {
  buildEnterpriseContactNote,
  isEnterpriseRegisterHref,
  resolveEnterpriseContactPlanId,
  tenderEnterpriseUpgradeLabel,
} from "./tender-entitlement";

const SUCCESS_MESSAGE = "商务团队将与您联系";

export function TenderEnterpriseUpgradeCta({
  href,
  label,
  context = {},
}: {
  href: string;
  label?: string;
  context?: ProductCommercialContext;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialEmail, setInitialEmail] = useState("");
  const [success, setSuccess] = useState<string | null>(null);
  const submittedRef = useRef(false);

  const ctaLabel = label ?? tenderEnterpriseUpgradeLabel();
  const buttonClass =
    "inline-flex rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-black hover:bg-emerald-400";

  const openContactForm = useCallback(async () => {
    setSuccess(null);
    submittedRef.current = false;
    setLoading(true);
    try {
      const meRes = await fetch("/api/auth/me");
      const me = (await meRes.json().catch(() => ({}))) as {
        authenticated?: boolean;
        user?: { email?: string | null } | null;
      };
      const email =
        typeof me.user?.email === "string" ? me.user.email.trim() : "";
      setInitialEmail(email);
      setOpen(true);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSubmit = useCallback(
    async (value: EnterpriseLeadFormValue) => {
      if (submittedRef.current || loading) return;
      submittedRef.current = true;
      setLoading(true);
      try {
        const res = await fetch("/api/lead/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            planId: resolveEnterpriseContactPlanId(context),
            company: value.company,
            name: value.name,
            email: value.email,
            note: buildEnterpriseContactNote(value, context),
          }),
        });
        const data = (await res.json().catch(() => null)) as {
          ok?: boolean;
          message?: string;
        } | null;
        if (!res.ok || !data?.ok) {
          submittedRef.current = false;
          throw new Error("SUBMIT_FAILED");
        }
        setOpen(false);
        setSuccess(SUCCESS_MESSAGE);
      } catch {
        submittedRef.current = false;
        throw new Error("SUBMIT_FAILED");
      } finally {
        setLoading(false);
      }
    },
    [context, loading],
  );

  if (isEnterpriseRegisterHref(href)) {
    return (
      <Link href={href} className={buttonClass}>
        {ctaLabel}
      </Link>
    );
  }

  return (
    <span className="inline-flex flex-col items-start gap-1">
      <button
        type="button"
        className={buttonClass}
        disabled={loading}
        onClick={() => {
          void openContactForm();
        }}
      >
        {ctaLabel}
      </button>
      {success ? <span className="text-xs text-emerald-400">{success}</span> : null}
      <EnterpriseLeadForm
        open={open}
        loading={loading}
        initialEmail={initialEmail}
        title="联系 Enterprise 商务"
        description="请留下企业与联系信息，Enterprise 商务团队将在 24 小时内与您沟通方案升级、定制交付与企业采购事宜。"
        submitText="提交咨询"
        onClose={() => {
          if (loading) return;
          setOpen(false);
        }}
        onSubmit={handleSubmit}
      />
    </span>
  );
}

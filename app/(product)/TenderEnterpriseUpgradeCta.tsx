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

const SUCCESS_TITLE = "Enterprise 开通申请已提交";

function successContactLine(email: string): string {
  return email
    ? `商务团队将在 24 小时内通过 ${email} 与您联系。`
    : "商务团队将在 24 小时内与您联系。";
}

const SUCCESS_NEXT_STEP = "开通完成后刷新本页面即可解锁投标，当前项目进度会保留。";

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
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const submittedRef = useRef(false);

  const ctaLabel = label ?? tenderEnterpriseUpgradeLabel();
  const buttonClass =
    "inline-flex rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-black hover:bg-emerald-400";
  const submitted = submittedEmail !== null;

  const openContactForm = useCallback(async () => {
    if (submittedRef.current) return;
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
        setSubmittedEmail(value.email.trim());
        setSuccessDialogOpen(true);
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
      {submitted ? (
        <span
          role="status"
          className="inline-flex rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-300"
        >
          {SUCCESS_TITLE} · 待商务联系
        </span>
      ) : (
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
      )}
      <EnterpriseLeadForm
        open={open && !submitted}
        loading={loading}
        initialEmail={initialEmail}
        title="申请开通 Enterprise"
        description="Enterprise 由商务开通，不支持在线自助支付。请留下企业与联系信息，商务团队将在 24 小时内与您联系，确认方案与开通事宜；开通后即可继续生成投标文件。"
        submitText="提交开通申请"
        onClose={() => {
          if (loading) return;
          setOpen(false);
        }}
        onSubmit={handleSubmit}
      />
      {successDialogOpen && submittedEmail !== null ? (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-4"
        >
          <div className="w-full max-w-md rounded-2xl border border-emerald-500/30 bg-neutral-950 p-6 text-left shadow-2xl">
            <h2 className="text-xl font-semibold text-emerald-300">{SUCCESS_TITLE}</h2>
            <p className="mt-3 text-sm leading-6 text-white/80">
              {successContactLine(submittedEmail)}
            </p>
            <p className="mt-1 text-sm leading-6 text-white/65">{SUCCESS_NEXT_STEP}</p>
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setSuccessDialogOpen(false)}
                className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-black transition hover:opacity-90"
              >
                知道了
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </span>
  );
}

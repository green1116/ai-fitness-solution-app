"use client";

import { useCallback, useRef, useState } from "react";

import EnterpriseLeadForm, {
  type EnterpriseLeadFormValue,
} from "@/components/EnterpriseLeadForm";
import { getPricingTier } from "@/lib/growth/conversion/pricing.strategy";

import type { ProductCommercialContext } from "./commercial-context";

const SUCCESS_MESSAGE = "已收到升级意向，团队将与您联系完成开通";
const proTier = getPricingTier("PRO");

function resolveProContactPlanId(ctx: ProductCommercialContext): string {
  return ctx.projectId?.trim() || ctx.organizationId?.trim() || "product-pro";
}

function buildProUpgradeContactNote(
  value: { phone?: string; title?: string },
  ctx: ProductCommercialContext,
): string {
  const parts: string[] = [];
  if (value.phone?.trim()) parts.push(`手机：${value.phone.trim()}`);
  if (value.title?.trim()) parts.push(`职位：${value.title.trim()}`);
  if (ctx.organizationId?.trim()) parts.push(`organizationId：${ctx.organizationId.trim()}`);
  if (ctx.projectId?.trim()) parts.push(`projectId：${ctx.projectId.trim()}`);
  if (ctx.quoteId?.trim()) parts.push(`quoteId：${ctx.quoteId.trim()}`);
  if (ctx.budgetId?.trim()) parts.push(`budgetId：${ctx.budgetId.trim()}`);
  parts.push(`${proTier.label} ¥${proTier.monthlyPriceCny}/月`);
  parts.push(proTier.headline);
  parts.push("pro_upgrade");
  return parts.join("；");
}

export function ProUpgradeContactCta({
  label,
  context = {},
  buttonClassName,
}: {
  label?: string;
  context?: ProductCommercialContext;
  buttonClassName?: string;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialEmail, setInitialEmail] = useState("");
  const [success, setSuccess] = useState<string | null>(null);
  const submittedRef = useRef(false);

  const ctaLabel = label ?? proTier.cta;
  const buttonClass =
    buttonClassName ??
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
            planId: resolveProContactPlanId(context),
            company: value.company,
            name: value.name,
            email: value.email,
            note: buildProUpgradeContactNote(value, context),
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
        title={`升级${proTier.label}`}
        description={`${proTier.label} · ¥${proTier.monthlyPriceCny}/月 · ${proTier.headline}。提交后由团队联系完成升级，无需重新注册。`}
        submitText="提交升级意向"
        onClose={() => {
          if (loading) return;
          setOpen(false);
        }}
        onSubmit={handleSubmit}
      />
    </span>
  );
}

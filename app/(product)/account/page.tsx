import Link from "next/link";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth/currentUser";
import { resolveOrganizationFeatures } from "@/lib/billing/subscription/subscription.resolver";
import { getOrganizationById } from "@/lib/organization/organization.service";
import { resolveExactSingleOrganizationForUser } from "@/lib/organization/single-org-context";
import type { FeatureFlags } from "@/lib/feature-flags/feature.service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const ENTITLEMENT_ROWS: Array<{ key: keyof FeatureFlags; label: string }> = [
  { key: "canGenerateQuote", label: "方案生成" },
  { key: "canGenerateBudget", label: "预算测算" },
  { key: "canExportPDF", label: "PDF 导出" },
  { key: "canGenerateTender", label: "投标文件" },
  { key: "canUseAPI", label: "API 接入" },
];

function formatPeriodEnd(value: Date | null): string {
  if (!value) return "未设置";
  return value.toLocaleString("zh-CN", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const orgResolved = await resolveExactSingleOrganizationForUser(user.id);
  const organizationId = orgResolved.ok ? orgResolved.organizationId : null;

  let organizationName: string | null = null;
  if (organizationId) {
    const org = await getOrganizationById(organizationId);
    organizationName =
      typeof org?.name === "string" && org.name.trim() ? org.name.trim() : null;
  }

  const features = organizationId
    ? await resolveOrganizationFeatures(organizationId)
    : null;

  const plan = features?.plan ?? "BASIC";
  const status = features?.status ?? (organizationId ? "ACTIVE" : "—");
  const flags = features?.flags;
  const periodEnd = features?.currentPeriodEnd ?? null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">账户</h1>
        <p className="mt-1 text-sm text-zinc-400">
          查看当前登录身份与套餐状态（不含自动续费说明）。
        </p>
      </div>

      <section className="space-y-3 rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
        <h2 className="text-sm font-medium text-zinc-300">身份</h2>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-zinc-500">邮箱</dt>
            <dd className="text-zinc-100">{user.email}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-zinc-500">组织</dt>
            <dd className="text-right text-zinc-100">
              {organizationName || organizationId || "未绑定组织"}
            </dd>
          </div>
          {organizationId ? (
            <div className="flex justify-between gap-4">
              <dt className="text-zinc-500">组织 ID</dt>
              <dd className="break-all text-right text-xs text-zinc-400">
                {organizationId}
              </dd>
            </div>
          ) : null}
        </dl>
      </section>

      <section className="space-y-3 rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
        <h2 className="text-sm font-medium text-zinc-300">订阅</h2>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-zinc-500">当前套餐</dt>
            <dd
              className={
                plan === "BASIC"
                  ? "font-medium text-zinc-200"
                  : "font-medium text-emerald-400"
              }
            >
              {plan}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-zinc-500">状态</dt>
            <dd className="text-zinc-100">{status}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-zinc-500">当前周期结束</dt>
            <dd className="text-zinc-100">{formatPeriodEnd(periodEnd)}</dd>
          </div>
        </dl>
        <p className="text-xs text-zinc-500">
          「当前周期结束」为账户记录字段；页面不表示自动续费。
        </p>
        {plan === "BASIC" ? (
          <p className="text-sm text-zinc-300">
            需要预算与 PDF 能力时，请前往{" "}
            <Link href="/quote" className="text-emerald-400 underline hover:text-emerald-300">
              方案
            </Link>{" "}
            升级专业版。
          </p>
        ) : null}
      </section>

      <section className="space-y-3 rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
        <h2 className="text-sm font-medium text-zinc-300">权益（与产品门控一致）</h2>
        {flags ? (
          <ul className="space-y-2 text-sm">
            {ENTITLEMENT_ROWS.map((row) => (
              <li
                key={row.key}
                className="flex items-center justify-between gap-4 border-b border-zinc-900 py-2 last:border-0"
              >
                <span className="text-zinc-300">{row.label}</span>
                <span
                  className={
                    flags[row.key] ? "text-emerald-400" : "text-zinc-500"
                  }
                >
                  {flags[row.key] ? "已开通" : "未开通"}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-zinc-500">无法加载组织权益（未绑定组织）。</p>
        )}
      </section>

      <Link href="/projects" className="inline-block text-sm text-zinc-400 underline hover:text-zinc-200">
        ← 返回项目
      </Link>
    </div>
  );
}

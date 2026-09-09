import Link from "next/link";
import type { SaasPlan } from "@/lib/saas/types";
import { getPricingTier } from "@/lib/growth/conversion/pricing.strategy";

const PLANS = ["BASIC", "PRO", "ENTERPRISE"] as const;

/** Presentation-only clarity; restates existing tier facts — no new commercial claims. */
const TIER_CLARITY: Record<
  SaasPlan,
  { audience: string; outcome: string; whyUpgrade: string | null }
> = {
  BASIC: {
    audience: "适合需要先生成企业健身方案的正式项目用户",
    outcome: "完成 AI 方案生成与基础企业健身规划",
    whyUpgrade: "若还需要预算测算与企业级 PDF 导出，请升级到专业版",
  },
  PRO: {
    audience: "适合需要方案、预算与 PDF 交付的用户",
    outcome: "完成方案与预算，并导出企业级 PDF",
    whyUpgrade: "若还需要投标文件、API 接入与无限用量，请升级到企业版",
  },
  ENTERPRISE: {
    audience: "适合需要投标交付、API 与无限用量的团队",
    outcome: "完成投标文件生成，并使用 API 与企业支持",
    whyUpgrade: null,
  },
};

export default function PricingPage() {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold">定价方案</h1>
        <p className="mt-2 text-zinc-600">
          可先免费体验；注册后按套餐解锁正式项目能力
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {PLANS.map((plan) => {
          const tier = getPricingTier(plan);
          const clarity = TIER_CLARITY[plan];
          const featured = plan === "PRO";
          return (
            <div
              key={plan}
              className={`flex flex-col rounded-2xl border p-6 ${
                featured
                  ? "border-emerald-400 bg-emerald-50 ring-2 ring-emerald-400/20"
                  : "border-zinc-200"
              }`}
            >
              <p className="text-sm font-medium text-emerald-600">{tier.label}</p>
              <p className="mt-2 text-3xl font-bold">
                ¥{tier.monthlyPriceCny}
                <span className="text-base font-normal text-zinc-500">/月</span>
              </p>
              <h2 className="mt-2 text-xl font-bold">{tier.headline}</h2>

              <p className="mt-4 text-sm font-medium text-zinc-800">适合谁</p>
              <p className="mt-1 text-sm text-zinc-600">{clarity.audience}</p>

              <p className="mt-3 text-sm font-medium text-zinc-800">能完成什么</p>
              <p className="mt-1 text-sm text-zinc-600">{clarity.outcome}</p>

              <p className="mt-3 text-sm font-medium text-zinc-800">核心权益</p>
              <ul className="mt-1 space-y-2 text-sm text-zinc-600">
                {tier.highlights.map((h) => (
                  <li key={h}>✓ {h}</li>
                ))}
              </ul>

              {clarity.whyUpgrade ? (
                <>
                  <p className="mt-3 text-sm font-medium text-zinc-800">为什么升级</p>
                  <p className="mt-1 text-sm text-zinc-600">{clarity.whyUpgrade}</p>
                </>
              ) : null}

              <Link
                href="/register"
                className={`mt-6 inline-block rounded-lg px-4 py-2 text-sm font-semibold ${
                  featured
                    ? "bg-emerald-600 text-white hover:bg-emerald-500"
                    : "bg-zinc-900 text-white hover:bg-zinc-800"
                }`}
              >
                {tier.cta}
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}

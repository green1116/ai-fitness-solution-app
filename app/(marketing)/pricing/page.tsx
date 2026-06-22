import Link from "next/link";
import { getPricingTier } from "@/lib/growth/conversion/pricing.strategy";

const PLANS = ["BASIC", "PRO", "ENTERPRISE"] as const;

export default function PricingPage() {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold">定价方案</h1>
        <p className="mt-2 text-zinc-600">透明 SaaS 定价 · Demo 免费体验 · 注册后按套餐解锁能力</p>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {PLANS.map((plan) => {
          const tier = getPricingTier(plan);
          const featured = plan === "PRO";
          return (
            <div
              key={plan}
              className={`rounded-2xl border p-6 ${
                featured ? "border-emerald-400 bg-emerald-50 ring-2 ring-emerald-400/20" : "border-zinc-200"
              }`}
            >
              <p className="text-sm font-medium text-emerald-600">{tier.label}</p>
              <p className="mt-2 text-3xl font-bold">
                ¥{tier.monthlyPriceCny}
                <span className="text-base font-normal text-zinc-500">/月</span>
              </p>
              <h2 className="mt-2 text-xl font-bold">{tier.headline}</h2>
              <ul className="mt-4 space-y-2 text-sm text-zinc-600">
                {tier.highlights.map((h) => (
                  <li key={h}>✓ {h}</li>
                ))}
              </ul>
              <Link
                href="/register"
                className={`mt-6 inline-block rounded-lg px-4 py-2 text-sm font-semibold ${
                  featured ? "bg-emerald-600 text-white hover:bg-emerald-500" : "bg-zinc-900 text-white hover:bg-zinc-800"
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

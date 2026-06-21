import Link from "next/link";
import { getPricingTier } from "@/lib/growth/conversion/pricing.strategy";

const PLANS = ["BASIC", "PRO", "ENTERPRISE"] as const;

export function Pricing() {
  return (
    <section id="pricing">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-zinc-900 md:text-3xl">定价方案</h2>
        <p className="mt-2 text-zinc-600">Demo 免费体验 · 注册后按套餐解锁能力</p>
      </div>
      <div className="mt-8 grid gap-6 md:grid-cols-3">
        {PLANS.map((plan, i) => {
          const tier = getPricingTier(plan);
          const featured = plan === "PRO";
          return (
            <div
              key={plan}
              className={`relative rounded-2xl border p-6 ${
                featured
                  ? "border-emerald-400 bg-emerald-50 shadow-lg ring-2 ring-emerald-400/30"
                  : "border-zinc-200 bg-white"
              }`}
            >
              {featured ? (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-emerald-600 px-3 py-0.5 text-xs font-semibold text-white">
                  推荐
                </span>
              ) : null}
              <p className="text-sm font-semibold text-emerald-600">{tier.label}</p>
              <p className="mt-2 text-3xl font-bold text-zinc-900">
                ¥{tier.monthlyPriceCny}
                <span className="text-base font-normal text-zinc-500">/月</span>
              </p>
              <h3 className="mt-2 text-lg font-semibold text-zinc-800">{tier.headline}</h3>
              <ul className="mt-4 space-y-2 text-sm text-zinc-600">
                {tier.highlights.map((h) => (
                  <li key={h} className="flex items-start gap-2">
                    <span className="text-emerald-500">✔</span>
                    {h}
                  </li>
                ))}
              </ul>
              <Link
                href={i === 2 ? "/register?plan=ENTERPRISE" : "/register"}
                className={`mt-6 block rounded-lg px-4 py-2.5 text-center text-sm font-semibold ${
                  featured
                    ? "bg-emerald-600 text-white hover:bg-emerald-500"
                    : "border border-zinc-300 text-zinc-800 hover:bg-zinc-50"
                }`}
              >
                {tier.cta}
              </Link>
            </div>
          );
        })}
      </div>
      <p className="mt-4 text-center text-sm text-zinc-500">
        <Link href="/pricing" className="text-emerald-600 hover:underline">
          查看完整定价详情 →
        </Link>
      </p>
    </section>
  );
}

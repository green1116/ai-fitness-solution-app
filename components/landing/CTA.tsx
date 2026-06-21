import Link from "next/link";

const CTAS = [
  { href: "/demo", label: "Start Free Demo", primary: true },
  { href: "/quote-demo", label: "Generate Your First Quote", primary: false },
  { href: "/tender-demo", label: "Build Your Tender Now", primary: false },
];

export function CTA() {
  return (
    <section className="rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-600 to-emerald-800 px-8 py-14 text-center text-white">
      <h2 className="text-2xl font-bold md:text-3xl">准备好用 AI 生成企业方案？</h2>
      <p className="mt-3 text-emerald-100">
        免费 Demo · 无需信用卡 · 3 分钟出方案
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        {CTAS.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className={
              c.primary
                ? "rounded-lg bg-white px-6 py-3 text-sm font-semibold text-emerald-800 hover:bg-emerald-50"
                : "rounded-lg border border-emerald-300/60 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-700/50"
            }
          >
            {c.label}
          </Link>
        ))}
      </div>
      <p className="mt-6 text-sm text-emerald-200">
        Landing Page = AI 自动生成企业方案的「入口销售员」
      </p>
    </section>
  );
}

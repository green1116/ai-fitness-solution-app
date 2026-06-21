import Link from "next/link";

export function Hero() {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-zinc-200 bg-gradient-to-br from-zinc-950 via-zinc-900 to-emerald-950 px-8 py-16 text-white md:px-14 md:py-24">
      <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />
      <div className="relative z-10 mx-auto max-w-4xl text-center md:text-left">
        <p className="text-sm font-medium uppercase tracking-widest text-emerald-400">
          企业健身方案 · AI 自动生成
        </p>
        <h1 className="mt-4 text-4xl font-bold leading-tight md:text-5xl lg:text-6xl">
          AI 自动生成企业健身方案 + 预算 + 标书
        </h1>
        <p className="mt-6 text-lg text-zinc-300 md:text-xl">
          3 分钟生成专业级企业方案
          <span className="mx-2 text-emerald-400">·</span>
          无需人工设计
          <span className="mx-2 text-emerald-400">·</span>
          无需咨询公司
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-3 md:justify-start">
          <Link
            href="/demo"
            className="rounded-lg bg-emerald-500 px-8 py-3.5 text-sm font-semibold text-black transition hover:bg-emerald-400"
          >
            Start Free Demo
          </Link>
          <Link
            href="/quote-demo"
            className="rounded-lg border border-emerald-600 bg-emerald-950/50 px-8 py-3.5 text-sm font-semibold text-emerald-300 transition hover:bg-emerald-900"
          >
            Generate Quote
          </Link>
        </div>
      </div>
    </section>
  );
}

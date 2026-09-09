import Link from "next/link";

export function Hero() {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-zinc-200 bg-gradient-to-br from-zinc-950 via-zinc-900 to-emerald-950 px-8 py-16 text-white md:px-14 md:py-24">
      <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />
      <div className="relative z-10 mx-auto max-w-4xl text-center md:text-left">
        <p className="text-sm font-medium tracking-wide text-emerald-400">
          面向企业健身空间方案服务商与专业交付团队（Pre-Pilot 工作定位）
        </p>
        <h1 className="mt-4 text-4xl font-bold leading-tight md:text-5xl lg:text-6xl">
          AI 企业健身项目解决方案平台
        </h1>
        <p className="mt-6 text-lg text-zinc-300 md:text-xl">
          将客户的企业健身空间需求，快速转化为专业方案、设备配置、预算和投标交付文件。
        </p>
        <div className="mt-10 flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-center md:justify-start">
          <div className="flex flex-col items-center gap-2 sm:items-start">
            <Link
              href="/demo"
              className="rounded-lg bg-emerald-500 px-8 py-3.5 text-sm font-semibold text-black transition hover:bg-emerald-400"
            >
              免费体验
            </Link>
            <p className="max-w-xs text-sm text-zinc-400">
              无需注册，先体验方案、预算和投标结果。
            </p>
          </div>
          <div className="flex flex-col items-center gap-2 sm:items-start">
            <Link
              href="/projects"
              className="rounded-lg border border-zinc-500 bg-zinc-900/60 px-8 py-3.5 text-sm font-semibold text-zinc-100 transition hover:border-zinc-400 hover:bg-zinc-800"
            >
              创建正式项目
            </Link>
            <p className="max-w-xs text-sm text-zinc-400">
              创建完整客户项目，并继续生成方案、预算和投标交付文件。
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

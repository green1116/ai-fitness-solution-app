import Link from "next/link";

export function CTA() {
  return (
    <section className="rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-600 to-emerald-800 px-8 py-14 text-center text-white">
      <h2 className="text-2xl font-bold md:text-3xl">从这里开始</h2>
      <p className="mt-3 text-emerald-100">
        先免费体验结果，或直接创建正式客户项目。
      </p>
      <div className="mt-8 flex flex-col items-center justify-center gap-6 sm:flex-row sm:items-start">
        <div className="flex max-w-xs flex-col items-center gap-2">
          <Link
            href="/demo"
            className="rounded-lg bg-white px-6 py-3 text-sm font-semibold text-emerald-800 hover:bg-emerald-50"
          >
            免费体验
          </Link>
          <p className="text-sm text-emerald-100">
            无需注册，先体验方案、预算和投标结果。
          </p>
        </div>
        <div className="flex max-w-xs flex-col items-center gap-2">
          <Link
            href="/projects"
            className="rounded-lg border border-emerald-300/60 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-700/50"
          >
            创建正式项目
          </Link>
          <p className="text-sm text-emerald-100">
            创建完整客户项目，并继续生成方案、预算和投标交付文件。
          </p>
        </div>
      </div>
    </section>
  );
}

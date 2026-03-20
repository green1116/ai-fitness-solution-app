import Link from "next/link";

export default function Page() {
  return (
    <main className="min-h-screen bg-white text-black">
      <section className="mx-auto flex max-w-6xl flex-col gap-12 px-6 py-16 md:px-10 md:py-24">
        <div className="max-w-3xl">
          <div className="mb-4 inline-flex items-center rounded-full border border-zinc-200 px-3 py-1 text-sm text-zinc-600">
            AI Fitness Solution
          </div>

          <h1 className="text-4xl font-semibold leading-tight tracking-tight md:text-6xl">
            企业健身房方案自动生成系统
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-7 text-zinc-600 md:text-lg">
            面向企业、园区、行政、HR 与招采场景，自动生成健身空间规划方案、预算报告与正式 PDF
            交付文件，提升沟通效率与项目专业度。
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/plan"
              className="inline-flex items-center justify-center rounded-lg bg-black px-5 py-3 text-sm font-medium text-white transition hover:opacity-90"
            >
              立即生成方案
            </Link>

            <Link
              href="/result?planId=attaguy-plan"
              className="inline-flex items-center justify-center rounded-lg border border-zinc-300 px-5 py-3 text-sm font-medium text-black transition hover:bg-zinc-50"
            >
              查看示例报告
            </Link>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-zinc-200 p-6">
            <h2 className="text-lg font-semibold">自动生成方案</h2>
            <p className="mt-3 text-sm leading-6 text-zinc-600">
              根据企业规模、空间面积与预算区间，自动生成结构化健身空间建设方案。
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-200 p-6">
            <h2 className="text-lg font-semibold">输出正式 PDF</h2>
            <p className="mt-3 text-sm leading-6 text-zinc-600">
              支持方案 PDF、预算 PDF 与完整打包文件，适用于汇报、立项与正式沟通。
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-200 p-6">
            <h2 className="text-lg font-semibold">支持企业级场景</h2>
            <p className="mt-3 text-sm leading-6 text-zinc-600">
              可用于企业福利升级、园区配套优化、行政审批沟通与招采前期准备。
            </p>
          </div>
        </div>

        <div className="rounded-2xl bg-zinc-50 p-6 md:p-8">
          <h2 className="text-xl font-semibold">适用场景</h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-600 md:text-base">
            适用于企业内部健身空间规划、员工健康福利升级、办公空间配套完善、预算审批沟通、
            供应商比选、招采汇报与项目立项展示。
          </p>
        </div>
      </section>
    </main>
  );
}
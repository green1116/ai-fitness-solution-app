const SOLUTIONS = [
  { title: "3 分钟生成方案", desc: "输入企业信息，AI 即时输出专业健身空间规划" },
  { title: "自动预算", desc: "设备、安装、运维分项预算一键生成，透明可控" },
  { title: "自动标书", desc: "招采场景标书结构与技术响应框架即时预览" },
  { title: "企业级输出 PDF", desc: "注册后解锁完整 PDF，直接用于汇报与投标" },
];

export function Solution() {
  return (
    <section>
      <div className="text-center">
        <h2 className="text-2xl font-bold text-zinc-900 md:text-3xl">
          AI Fitness Solution 解决
        </h2>
        <p className="mt-2 text-zinc-600">不卖功能，只卖结果 — 节省时间、直接可用</p>
      </div>
      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {SOLUTIONS.map((s) => (
          <div
            key={s.title}
            className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-6 transition hover:border-emerald-200 hover:shadow-md"
          >
            <p className="text-emerald-600">✔</p>
            <h3 className="mt-2 text-lg font-semibold text-zinc-900">{s.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-zinc-600">{s.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

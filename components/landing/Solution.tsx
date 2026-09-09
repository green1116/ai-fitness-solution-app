const SOLUTIONS = [
  { title: "专业方案", desc: "将企业健身空间需求快速整理为可交付的专业规划方案" },
  { title: "设备配置", desc: "按场景输出设备与空间配置建议，便于选型与落地" },
  { title: "项目预算", desc: "设备、安装、运维分项预算一键生成，透明可控" },
  { title: "投标交付文件", desc: "招采场景下快速形成投标交付结构与技术响应预览" },
];

export function Solution() {
  return (
    <section>
      <div className="text-center">
        <h2 className="text-2xl font-bold text-zinc-900 md:text-3xl">
          从需求到交付，一条路径完成
        </h2>
        <p className="mt-2 text-zinc-600">
          专业方案 → 设备配置 → 项目预算 → 投标交付文件
        </p>
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

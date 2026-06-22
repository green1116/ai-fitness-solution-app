const USE_CASES = [
  {
    title: "健身连锁",
    desc: "多门店标准化方案与设备预算，快速复制扩张",
    icon: "🏋️",
  },
  {
    title: "企业 HR",
    desc: "员工健身房福利项目，预算透明、方案专业",
    icon: "👥",
  },
  {
    title: "政府采购",
    desc: "招采标书结构完整，合规评分即时预览",
    icon: "🏛️",
  },
  {
    title: "体育机构",
    desc: "场馆配套健身空间规划与品牌选型建议",
    icon: "⚽",
  },
];

export function UseCases() {
  return (
    <section>
      <div className="text-center">
        <h2 className="text-2xl font-bold text-zinc-900 md:text-3xl">行业场景</h2>
        <p className="mt-2 text-zinc-600">覆盖企业、园区、招采与体育机构</p>
      </div>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {USE_CASES.map((c) => (
          <div
            key={c.title}
            className="rounded-2xl border border-zinc-200 p-6 text-center transition hover:border-emerald-200 hover:shadow-md"
          >
            <span className="text-3xl" aria-hidden>
              {c.icon}
            </span>
            <h3 className="mt-3 font-semibold text-zinc-900">{c.title}</h3>
            <p className="mt-2 text-sm text-zinc-600">{c.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

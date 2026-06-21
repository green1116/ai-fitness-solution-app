const PAINS = [
  { icon: "❌", text: "需要咨询公司（贵）" },
  { icon: "❌", text: "制作周期长（3~7 天）" },
  { icon: "❌", text: "标书复杂（容易出错）" },
  { icon: "❌", text: "预算不透明" },
];

export function Pain() {
  return (
    <section className="rounded-3xl border border-red-100 bg-gradient-to-b from-red-50/80 to-white px-8 py-12">
      <h2 className="text-center text-2xl font-bold text-zinc-900 md:text-3xl">
        企业做健身方案的问题
      </h2>
      <p className="mt-2 text-center text-zinc-600">传统方式耗时、昂贵、风险高</p>
      <ul className="mx-auto mt-8 grid max-w-3xl gap-4 sm:grid-cols-2">
        {PAINS.map((p) => (
          <li
            key={p.text}
            className="flex items-center gap-3 rounded-xl border border-red-100 bg-white px-5 py-4 text-zinc-800 shadow-sm"
          >
            <span className="text-lg" aria-hidden>
              {p.icon}
            </span>
            <span className="font-medium">{p.text}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

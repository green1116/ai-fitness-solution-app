const CASES = [
  { name: "星河科技园", result: "3 天完成 450㎡ 健身空间方案与招采标书", metric: "招采周期缩短 60%" },
  { name: "汇智集团 HR", result: "员工健身房福利项目预算一键生成", metric: "预算编制从 2 周降至 1 天" },
  { name: "城投园区", result: "多楼栋健身配套统一规划与品牌选型", metric: "方案专业度显著提升" },
];

export default function CasePage() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">客户案例</h1>
      <p className="text-zinc-600">企业健身空间 AI 方案落地案例</p>
      <div className="grid gap-4">
        {CASES.map((c) => (
          <div key={c.name} className="rounded-2xl border border-zinc-200 p-6">
            <h2 className="text-lg font-semibold">{c.name}</h2>
            <p className="mt-2 text-sm text-zinc-600">{c.result}</p>
            <p className="mt-2 text-sm font-medium text-emerald-600">{c.metric}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

import Link from "next/link";
import { generateDemoQuote } from "@/lib/demo/quote.demo.engine";

export default function QuoteDemoPage() {
  const sample = generateDemoQuote({
    companyName: "Demo 企业",
    companySize: "200-500人",
    goal: "员工健康",
  });

  return (
    <div className="min-h-screen bg-zinc-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-3xl space-y-6">
        <Link href="/demo" className="text-sm text-emerald-400 hover:underline">
          ← 返回 Demo
        </Link>
        <h1 className="text-2xl font-bold">{sample.title}</h1>
        <p className="text-zinc-400">{sample.summary}</p>
        <ul className="space-y-2 text-sm">
          {sample.equipment.map((e) => (
            <li key={e.name} className="flex justify-between border-b border-zinc-800 py-2">
              <span>{e.name}</span>
              <span className="text-zinc-500">
                {e.zone} × {e.qty}
              </span>
            </li>
          ))}
        </ul>
        <Link href="/register" className="inline-block rounded-lg bg-emerald-500 px-5 py-2 text-sm font-semibold text-black">
          注册保存方案
        </Link>
      </div>
    </div>
  );
}

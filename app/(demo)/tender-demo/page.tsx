import Link from "next/link";
import { generateDemoTender } from "@/lib/demo/tender.demo.engine";

export default function TenderDemoPage() {
  const tender = generateDemoTender({ companyName: "Demo 企业" });

  return (
    <div className="min-h-screen bg-zinc-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-3xl space-y-6">
        <Link href="/demo" className="text-sm text-emerald-400 hover:underline">
          ← 返回 Demo
        </Link>
        <h1 className="text-2xl font-bold">{tender.title}</h1>
        <p className="text-zinc-400">{tender.preview}</p>
        <p className="text-sm text-emerald-400">合规评分：{tender.complianceScore}</p>
        <ol className="list-decimal space-y-1 pl-5 text-sm text-zinc-300">
          {tender.sections.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ol>
        <Link href="/register" className="inline-block rounded-lg bg-emerald-500 px-5 py-2 text-sm font-semibold text-black">
          生成完整标书
        </Link>
      </div>
    </div>
  );
}

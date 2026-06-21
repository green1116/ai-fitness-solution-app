import Link from "next/link";
import { generateDemoBudget } from "@/lib/demo/budget.demo.engine";
import { generateDemoQuote } from "@/lib/demo/quote.demo.engine";

export default function BudgetDemoPage() {
  const quote = generateDemoQuote({ companyName: "Demo 企业" });
  const budget = generateDemoBudget({ companyName: "Demo 企业" }, quote);

  return (
    <div className="min-h-screen bg-zinc-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-3xl space-y-6">
        <Link href="/demo" className="text-sm text-emerald-400 hover:underline">
          ← 返回 Demo
        </Link>
        <h1 className="text-2xl font-bold">预算 Demo</h1>
        <p className="text-3xl font-semibold text-emerald-400">
          ¥{budget.total.toLocaleString()} <span className="text-base text-zinc-500">{budget.currency}</span>
        </p>
        <ul className="space-y-2 text-sm">
          {budget.breakdown.map((b) => (
            <li key={b.category} className="flex justify-between border-b border-zinc-800 py-2">
              <span>{b.category}</span>
              <span>¥{b.amount.toLocaleString()}</span>
            </li>
          ))}
        </ul>
        <Link href="/register" className="inline-block rounded-lg bg-emerald-500 px-5 py-2 text-sm font-semibold text-black">
          解锁完整 PDF
        </Link>
      </div>
    </div>
  );
}

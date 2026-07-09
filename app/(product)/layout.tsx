import Link from "next/link";

import { PilotWorkflowNav } from "@/components/pilot/PilotWorkflowNav";

export default function ProductLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-black text-white">
      <header className="border-b border-zinc-800 px-6 py-4">
        <div className="mx-auto max-w-5xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-widest text-zinc-500">Commercial Flow</p>
              <p className="text-sm font-semibold text-white">导入 → 计算 → 交付 → 归档</p>
            </div>
            <div className="flex flex-wrap gap-3 text-sm">
              <Link href="/pilot/intake" className="font-semibold text-sky-400 hover:text-sky-300">
                上传标书
              </Link>
              <Link href="/dashboard" className="text-zinc-400 hover:text-white">
                控制台
              </Link>
            </div>
          </div>
          <PilotWorkflowNav compact />
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-8">{children}</main>
    </div>
  );
}

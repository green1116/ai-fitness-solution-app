"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string>("");

  useEffect(() => {
    const authed = localStorage.getItem("attaguy_authed");
    const e = localStorage.getItem("attaguy_email") || "";
    if (authed !== "1") {
      router.push("/login");
      return;
    }
    setEmail(e);
  }, [router]);

  const logout = () => {
    localStorage.removeItem("attaguy_authed");
    localStorage.removeItem("attaguy_email");
    router.push("/");
  };

  return (
    <main className="min-h-screen bg-black text-white px-6 py-10">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">我的方案（演示）</h1>
        <p className="text-gray-300 text-sm">
          已登录用户：<span className="text-white font-semibold">{email || "unknown"}</span>
        </p>

        <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 space-y-3">
          <div className="text-lg font-semibold">下一步你可以做什么</div>
          <ul className="list-disc pl-5 text-sm text-gray-300 space-y-1">
            <li>下载完整 PDF（下一阶段接入）</li>
            <li>保存/查看历史方案（下一阶段接入数据库）</li>
            <li>联系顾问，代客下单（下一阶段接入商城）</li>
          </ul>

          <div className="flex flex-col md:flex-row gap-3 pt-2">
            <Link
              href="/plan"
              className="flex-1 bg-white text-black rounded-xl py-4 font-semibold text-center hover:bg-gray-200 transition"
            >
              再生成一份方案
            </Link>

            <button
              onClick={() => alert("下一阶段：这里接 PDF 下载接口")}
              className="flex-1 rounded-xl py-4 font-semibold border border-zinc-700 hover:border-zinc-500 transition"
            >
              下载 PDF（占位）
            </button>
          </div>
        </section>

        <button
          onClick={logout}
          className="text-sm text-gray-400 underline hover:text-gray-200"
        >
          退出登录
        </button>
      </div>
    </main>
  );
}

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
    <main className="min-h-screen bg-black px-6 py-10 text-white">
      <div className="mx-auto max-w-2xl space-y-6">
        <h1 className="text-3xl font-bold">用户控制台</h1>

        <p className="text-sm text-gray-300">
          当前登录邮箱：
          <span className="font-semibold text-white">{email || "unknown"}</span>
        </p>

        <section className="space-y-3 rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
          <div className="text-lg font-semibold">可用功能</div>

          <ul className="list-disc space-y-1 pl-5 text-sm text-gray-300">
            <li>创建企业健身空间方案，并生成 PDF 计划文档</li>
            <li>提交需求参数，进入后续分析与自动化处理流程</li>
            <li>查看下载入口、后续结果页及系统生成的相关输出</li>
          </ul>

          <div className="flex flex-col gap-3 pt-2 md:flex-row">
            <Link
              href="/plan"
              className="flex-1 rounded-xl bg-white py-4 text-center font-semibold text-black transition hover:bg-gray-200"
            >
              开始创建方案
            </Link>

            <button
              onClick={() => alert("PDF 下载入口正在整理中，请先进入方案页进行生成。")}
              className="flex-1 rounded-xl border border-zinc-700 py-4 font-semibold transition hover:border-zinc-500"
            >
              查看 PDF 下载入口
            </button>
          </div>
        </section>

        <section className="space-y-3 rounded-2xl border border-amber-900/40 bg-amber-950/20 p-6">
          <div className="text-lg font-semibold text-amber-100">Enterprise Command Center</div>
          <p className="text-sm text-zinc-400">
            统一企业运维入口 — unified ops · governance · audit · release · access · observability
          </p>
          <Link
            href="/dashboard/command-center"
            className="inline-block rounded-xl border border-amber-700 bg-amber-950/40 px-5 py-3 text-sm font-semibold text-amber-100 transition hover:bg-amber-900/40"
          >
            进入 Command Center
          </Link>
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
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type FormData = {
  companySize: string;
  area: string;
  scenario: string;
  goal: string;
  budget: string;
  email: string;
};

export default function PlanPage() {
  const router = useRouter();

  const [form, setForm] = useState<FormData>({
    companySize: "",
    area: "",
    scenario: "企业办公楼",
    goal: "提升员工健康",
    budget: "5-10万",
    email: "",
  });

  const update = (key: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.companySize || !form.area || !form.email) {
      alert("请至少填写：员工数量、面积、邮箱");
      return;
    }

    try {
      const res = await fetch("/api/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
        throw new Error(errorData.error || errorData.detail || `请求失败 (${res.status})`);
      }

      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await res.text();
        throw new Error(`服务端返回了非 JSON 响应: ${text.substring(0, 100)}`);
      }

      const plan = await res.json();

      if (!plan || plan.error) {
        throw new Error(plan.error || plan.detail || "生成方案失败");
      }

      localStorage.setItem("attaguy_plan", JSON.stringify(plan));
      router.push("/result");
    } catch (err: unknown) {
      console.error("Plan generation error:", err);
      const message = err instanceof Error ? err.message : "生成失败，请稍后重试";
      alert(message);
    }
  };

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-3 text-3xl font-bold md:text-4xl">填写信息，生成方案</h1>

        <p className="mb-8 text-gray-300">
          先不用登录。填写基础信息后即可预览方案；下载 PDF 或保存方案时再登录。
        </p>

        <form onSubmit={onSubmit} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm text-gray-300">员工规模（必填）</label>
            <input
              value={form.companySize}
              onChange={(e) => update("companySize", e.target.value)}
              placeholder="例如：200"
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 outline-none focus:border-zinc-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-gray-300">可用空间面积（㎡，必填）</label>
            <input
              value={form.area}
              onChange={(e) => update("area", e.target.value)}
              placeholder="例如：120"
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 outline-none focus:border-zinc-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-gray-300">场景</label>
            <select
              value={form.scenario}
              onChange={(e) => update("scenario", e.target.value)}
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 outline-none focus:border-zinc-500"
            >
              <option>企业办公楼</option>
              <option>园区 / 写字楼</option>
              <option>酒店 / 公寓</option>
              <option>工厂 / 生产园区</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm text-gray-300">目标</label>
            <select
              value={form.goal}
              onChange={(e) => update("goal", e.target.value)}
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 outline-none focus:border-zinc-500"
            >
              <option>提升员工健康</option>
              <option>减脂塑形</option>
              <option>企业福利</option>
              <option>运动恢复 / 放松</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm text-gray-300">预算区间</label>
            <select
              value={form.budget}
              onChange={(e) => update("budget", e.target.value)}
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 outline-none focus:border-zinc-500"
            >
              <option>5万以内</option>
              <option>5-10万</option>
              <option>10-30万</option>
              <option>30-80万</option>
              <option>80万以上</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm text-gray-300">联系邮箱（必填）</label>
            <input
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              placeholder="例如：name@company.com"
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 outline-none focus:border-zinc-500"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-white py-4 font-semibold text-black transition hover:bg-gray-200"
          >
            生成预览方案
          </button>

          <p className="text-center text-xs text-gray-500">
            我们不会在你未授权的情况下对外展示你的信息。后续下载 PDF 或保存方案时会要求登录。
          </p>
        </form>
      </div>
    </main>
  );
}
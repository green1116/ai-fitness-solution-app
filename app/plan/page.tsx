"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type FormData = {
  companySize: string; // 员工数
  area: string; // 面积
  scenario: string; // 场景
  goal: string; // 目标
  budget: string; // 预算
  email: string; // 邮箱
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
      alert("请至少填写：员工数、面积、邮箱");
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
        throw new Error(`服务器返回了非 JSON 响应: ${text.substring(0, 100)}`);
      }

      // 接收 plan.json（唯一事实源）
      // 数据流向：表单 → LLM → plan.json → localStorage → result/PDF/后台留资/销售升级
      const plan = await res.json();

      if (!plan || plan.error) {
        throw new Error(plan.error || plan.detail || "生成方案失败");
      }

      // 保存 plan.json 到 localStorage（后续 result / PDF / 后台留资 / 销售升级 都从这里读取）
      localStorage.setItem("attaguy_plan", JSON.stringify(plan));

      // 跳转
      router.push("/result");
    } catch (err: any) {
      console.error("Plan generation error:", err);
      alert(err?.message || "生成失败，请稍后重试");
    }
  };

  return (
    <main className="min-h-screen bg-black text-white px-6 py-10">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold mb-3">填写信息，生成方案</h1>
        <p className="text-gray-300 mb-8">
          先不用登录。填写基础信息后即可预览方案；下载 PDF / 保存方案时再登录。
        </p>

        <form onSubmit={onSubmit} className="space-y-5">
          <div>
            <label className="block text-sm text-gray-300 mb-2">员工规模（必填）</label>
            <input
              value={form.companySize}
              onChange={(e) => update("companySize", e.target.value)}
              placeholder="例如：200"
              className="w-full rounded-xl bg-zinc-900 border border-zinc-800 px-4 py-3 outline-none focus:border-zinc-500"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-2">可用空间面积㎡（必填）</label>
            <input
              value={form.area}
              onChange={(e) => update("area", e.target.value)}
              placeholder="例如：120"
              className="w-full rounded-xl bg-zinc-900 border border-zinc-800 px-4 py-3 outline-none focus:border-zinc-500"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-2">场景</label>
            <select
              value={form.scenario}
              onChange={(e) => update("scenario", e.target.value)}
              className="w-full rounded-xl bg-zinc-900 border border-zinc-800 px-4 py-3 outline-none focus:border-zinc-500"
            >
              <option>企业办公楼</option>
              <option>园区 / 写字楼</option>
              <option>酒店 / 公寓</option>
              <option>工厂 / 生产园区</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-2">目标</label>
            <select
              value={form.goal}
              onChange={(e) => update("goal", e.target.value)}
              className="w-full rounded-xl bg-zinc-900 border border-zinc-800 px-4 py-3 outline-none focus:border-zinc-500"
            >
              <option>提升员工健康</option>
              <option>减脂塑形</option>
              <option>企业福利</option>
              <option>运动恢复 / 放松</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-2">预算区间</label>
            <select
              value={form.budget}
              onChange={(e) => update("budget", e.target.value)}
              className="w-full rounded-xl bg-zinc-900 border border-zinc-800 px-4 py-3 outline-none focus:border-zinc-500"
            >
              <option>5万以下</option>
              <option>5-10万</option>
              <option>10-30万</option>
              <option>30-80万</option>
              <option>80万以上</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-2">联系邮箱（必填）</label>
            <input
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              placeholder="例如：name@company.com"
              className="w-full rounded-xl bg-zinc-900 border border-zinc-800 px-4 py-3 outline-none focus:border-zinc-500"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-white text-black rounded-xl py-4 font-semibold hover:bg-gray-200 transition"
          >
            生成预览方案
          </button>

          <p className="text-xs text-gray-500 text-center">
            我们不会在你未授权的情况下对外展示你的信息。后续下载 PDF / 保存方案会要求登录。
          </p>
        </form>
      </div>
    </main>
  );
}

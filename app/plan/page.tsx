"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type FormData = {
  companySize: string; // 鍛樺伐鏁?
  area: string; // 闈㈢Н
  scenario: string; // 鍦烘櫙
  goal: string; // 鐩爣
  budget: string; // 棰勭畻
  email: string; // 閭
};

export default function PlanPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormData>({
    companySize: "",
    area: "",
    scenario: "浼佷笟鍔炲叕妤?,
    goal: "鎻愬崌鍛樺伐鍋ュ悍",
    budget: "5-10涓?,
    email: "",
  });

  const update = (key: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.companySize || !form.area || !form.email) {
      alert("璇疯嚦灏戝～鍐欙細鍛樺伐鏁般€侀潰绉€侀偖绠?);
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
        throw new Error(errorData.error || errorData.detail || `璇锋眰澶辫触 (${res.status})`);
      }

      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await res.text();
        throw new Error(`鏈嶅姟鍣ㄨ繑鍥炰簡闈?JSON 鍝嶅簲: ${text.substring(0, 100)}`);
      }

      // 鎺ユ敹 plan.json锛堝敮涓€浜嬪疄婧愶級
      // 鏁版嵁娴佸悜锛氳〃鍗?鈫?LLM 鈫?plan.json 鈫?localStorage 鈫?result/PDF/鍚庡彴鐣欒祫/閿€鍞崌绾?
      const plan = await res.json();

      if (!plan || plan.error) {
        throw new Error(plan.error || plan.detail || "鐢熸垚鏂规澶辫触");
      }

      // 淇濆瓨 plan.json 鍒?localStorage锛堝悗缁?result / PDF / 鍚庡彴鐣欒祫 / 閿€鍞崌绾?閮戒粠杩欓噷璇诲彇锛?
      localStorage.setItem("attaguy_plan", JSON.stringify(plan));

      // 璺宠浆
      router.push("/result");
    } catch (err: any) {
      console.error("Plan generation error:", err);
      alert(err?.message || "鐢熸垚澶辫触锛岃绋嶅悗閲嶈瘯");
    }
  };

  return (
    <main className="min-h-screen bg-black text-white px-6 py-10">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold mb-3">濉啓淇℃伅锛岀敓鎴愭柟妗?/h1>
        <p className="text-gray-300 mb-8">
          鍏堜笉鐢ㄧ櫥褰曘€傚～鍐欏熀纭€淇℃伅鍚庡嵆鍙瑙堟柟妗堬紱涓嬭浇 PDF / 淇濆瓨鏂规鏃跺啀鐧诲綍銆?
        </p>

        <form onSubmit={onSubmit} className="space-y-5">
          <div>
            <label className="block text-sm text-gray-300 mb-2">鍛樺伐瑙勬ā锛堝繀濉級</label>
            <input
              value={form.companySize}
              onChange={(e) => update("companySize", e.target.value)}
              placeholder="渚嬪锛?00"
              className="w-full rounded-xl bg-zinc-900 border border-zinc-800 px-4 py-3 outline-none focus:border-zinc-500"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-2">鍙敤绌洪棿闈㈢Н銕★紙蹇呭～锛?/label>
            <input
              value={form.area}
              onChange={(e) => update("area", e.target.value)}
              placeholder="渚嬪锛?20"
              className="w-full rounded-xl bg-zinc-900 border border-zinc-800 px-4 py-3 outline-none focus:border-zinc-500"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-2">鍦烘櫙</label>
            <select
              value={form.scenario}
              onChange={(e) => update("scenario", e.target.value)}
              className="w-full rounded-xl bg-zinc-900 border border-zinc-800 px-4 py-3 outline-none focus:border-zinc-500"
            >
              <option>浼佷笟鍔炲叕妤?/option>
              <option>鍥尯 / 鍐欏瓧妤?/option>
              <option>閰掑簵 / 鍏瘬</option>
              <option>宸ュ巶 / 鐢熶骇鍥尯</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-2">鐩爣</label>
            <select
              value={form.goal}
              onChange={(e) => update("goal", e.target.value)}
              className="w-full rounded-xl bg-zinc-900 border border-zinc-800 px-4 py-3 outline-none focus:border-zinc-500"
            >
              <option>鎻愬崌鍛樺伐鍋ュ悍</option>
              <option>鍑忚剛濉戝舰</option>
              <option>浼佷笟绂忓埄</option>
              <option>杩愬姩鎭㈠ / 鏀炬澗</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-2">棰勭畻鍖洪棿</label>
            <select
              value={form.budget}
              onChange={(e) => update("budget", e.target.value)}
              className="w-full rounded-xl bg-zinc-900 border border-zinc-800 px-4 py-3 outline-none focus:border-zinc-500"
            >
              <option>5涓囦互涓?/option>
              <option>5-10涓?/option>
              <option>10-30涓?/option>
              <option>30-80涓?/option>
              <option>80涓囦互涓?/option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-2">鑱旂郴閭锛堝繀濉級</label>
            <input
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              placeholder="渚嬪锛歯ame@company.com"
              className="w-full rounded-xl bg-zinc-900 border border-zinc-800 px-4 py-3 outline-none focus:border-zinc-500"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-white text-black rounded-xl py-4 font-semibold hover:bg-gray-200 transition"
          >
            鐢熸垚棰勮鏂规
          </button>

          <p className="text-xs text-gray-500 text-center">
            鎴戜滑涓嶄細鍦ㄤ綘鏈巿鏉冪殑鎯呭喌涓嬪澶栧睍绀轰綘鐨勪俊鎭€傚悗缁笅杞?PDF / 淇濆瓨鏂规浼氳姹傜櫥褰曘€?
          </p>
        </form>
      </div>
    </main>
  );
}


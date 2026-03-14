"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function EditPlanPage() {
  const router = useRouter();
  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem("attaguy_plan");
    if (!raw) {
      router.push("/plan");
      return;
    }
    setPlan(JSON.parse(raw));
  }, [router]);

  if (!plan) {
    return (
      <main className="min-h-screen bg-black text-white px-6 py-10 flex items-center justify-center">
        <p className="text-gray-300">鍔犺浇涓?..</p>
      </main>
    );
  }

  const handleEquipmentChange = (index: number, field: string, value: any) => {
    const updated = { ...plan };
    updated.equipmentList[index] = {
      ...updated.equipmentList[index],
      [field]: value,
    };
    setPlan(updated);
  };

  const handleAddonChange = (key: string, value: boolean) => {
    const updated = { ...plan };
    updated.addons[key] = value;
    setPlan(updated);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // 璇诲彇鏃х増鏈敤浜庣増鏈帶鍒?
      const oldPlanRaw = localStorage.getItem("attaguy_plan");
      const previousPlan = oldPlanRaw ? JSON.parse(oldPlanRaw) : null;

      // 鐗堟湰鎺у埗锛氱増鏈彿 += 0.1
      let version = "1.0";
      if (previousPlan?.meta?.version) {
        const currentVersion = parseFloat(previousPlan.meta.version);
        version = (currentVersion + 0.1).toFixed(1);
      }

      // 鍒涘缓鏂扮増鏈細鍙洿鏂扮増鏈彿鍜岀敓鎴愭椂闂?
      const newPlan = {
        ...plan,
        meta: {
          ...plan.meta,
          version,
          generatedAt: new Date().toISOString(),
        },
      };

      // 淇濆瓨鏃х増鏈紙鍙€夛細瀛樺埌鍘嗗彶璁板綍锛?
      if (previousPlan) {
        const historyKey = `attaguy_plan_v${previousPlan.meta.version}`;
        localStorage.setItem(historyKey, oldPlanRaw);
      }

      // 淇濆瓨鏂扮増鏈?
      localStorage.setItem("attaguy_plan", JSON.stringify(newPlan));

      router.push("/result");
    } catch (err: any) {
      alert(err?.message || "淇濆瓨澶辫触");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white px-6 py-10">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">缂栬緫鏂规</h1>
          <p className="text-gray-300">淇敼璁惧鏁伴噺銆佸娉ㄥ拰鍙€夋湇鍔?/p>
        </div>

        {/* 璁惧娓呭崟缂栬緫 */}
        <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
          <h2 className="text-xl font-semibold mb-4">璁惧娓呭崟</h2>
          <div className="space-y-4">
            {plan.equipmentList?.map((equip: any, idx: number) => (
              <div key={idx} className="rounded-xl bg-zinc-900 border border-zinc-800 p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="text-xs text-gray-400 mr-2">{equip.category || "鈥?}</span>
                    <span className="font-semibold text-gray-200">{equip.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-300">鏁伴噺锛?/label>
                    <input
                      type="number"
                      min="0"
                      value={equip.qty}
                      onChange={(e) => handleEquipmentChange(idx, "qty", parseInt(e.target.value) || 0)}
                      className="w-20 rounded bg-zinc-800 border border-zinc-700 px-3 py-1 text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">璇存槑/澶囨敞锛?/label>
                  <textarea
                    value={equip.reason || ""}
                    onChange={(e) => handleEquipmentChange(idx, "reason", e.target.value)}
                    className="w-full rounded bg-zinc-800 border border-zinc-700 px-3 py-2 text-white text-sm"
                    rows={2}
                    placeholder="璇疯緭鍏ュ娉?.."
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Addons 鍕鹃€?*/}
        <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
          <h2 className="text-xl font-semibold mb-4">鍙€夋湇鍔?/h2>
          <div className="space-y-3">
            {plan.upsellHints?.map((hint: string, idx: number) => {
              // 鏍规嵁 hint 鍖归厤 addons key
              let addonKey = null;
              if (hint.includes("鍦伴潰") || hint.includes("鏉愭枡")) addonKey = "flooring";
              else if (hint.includes("搴峰") || hint.includes("鎷変几")) addonKey = "rehab";
              else if (hint.includes("3D") || hint.includes("涓夌淮")) addonKey = "design3d";

              return (
                <label
                  key={idx}
                  className="flex items-center gap-3 cursor-pointer hover:bg-zinc-900 p-3 rounded-lg"
                >
                  <input
                    type="checkbox"
                    checked={addonKey ? plan.addons[addonKey] === true : false}
                    onChange={(e) => {
                      if (addonKey) {
                        handleAddonChange(addonKey, e.target.checked);
                      }
                    }}
                    className="w-5 h-5 rounded border-zinc-700 bg-zinc-800 text-white"
                  />
                  <span className="text-gray-200">{hint}</span>
                </label>
              );
            })}
          </div>
        </section>

        {/* 鎿嶄綔鎸夐挳 */}
        <section className="flex gap-4">
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex-1 bg-white text-black rounded-xl py-4 font-semibold hover:bg-gray-200 transition disabled:opacity-50"
          >
            {loading ? "淇濆瓨涓?.." : "淇濆瓨骞剁敓鎴愭柊鐗堟湰"}
          </button>
          <button
            onClick={() => router.push("/result")}
            className="px-6 bg-zinc-800 text-white rounded-xl py-4 font-semibold hover:bg-zinc-700 transition"
          >
            鍙栨秷
          </button>
        </section>
      </div>
    </main>
  );
}



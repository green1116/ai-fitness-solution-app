"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type EquipmentItem = {
  category?: string;
  name?: string;
  qty?: number;
  reason?: string;
};

type PlanData = {
  equipmentList?: EquipmentItem[];
  addons?: Record<string, boolean>;
  upsellHints?: string[];
  planId?: string;
  plan_id?: string;
  meta?: {
    version?: string;
    generatedAt?: string;
    plan_id?: string;
  };
};

function getStoredPlanProjectId(): string {
  try {
    const raw = localStorage.getItem("attaguy_plan");
    if (!raw) return "";
    const p = JSON.parse(raw) as PlanData & { plan_id?: string };
    return String(p?.planId || p?.plan_id || p?.meta?.plan_id || "").trim();
  } catch {
    return "";
  }
}

function navigateToResult(router: { push: (href: string) => void }) {
  const pid = getStoredPlanProjectId();
  if (pid) {
    try {
      localStorage.setItem("projectId", pid);
    } catch {
      // ignore
    }
    router.push(`/result?projectId=${encodeURIComponent(pid)}`);
  } else {
    router.push("/result");
  }
}

export default function EditPlanPage() {
  const router = useRouter();
  const [plan, setPlan] = useState<PlanData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem("attaguy_plan");
    if (!raw) {
      router.push("/plan");
      return;
    }

    try {
      setPlan(JSON.parse(raw));
    } catch {
      router.push("/plan");
    }
  }, [router]);

  if (!plan) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black px-6 py-10 text-white">
        <p className="text-gray-300">加载中...</p>
      </main>
    );
  }

  const handleEquipmentChange = (
    index: number,
    field: keyof EquipmentItem,
    value: string | number
  ) => {
    const updated: PlanData = { ...plan };
    const list = [...(updated.equipmentList || [])];
    list[index] = {
      ...list[index],
      [field]: value,
    };
    updated.equipmentList = list;
    setPlan(updated);
  };

  const handleAddonChange = (key: string, value: boolean) => {
    const updated: PlanData = { ...plan };
    updated.addons = {
      ...(updated.addons || {}),
      [key]: value,
    };
    setPlan(updated);
  };

  const handleSave = async () => {
    setLoading(true);

    try {
      const oldPlanRaw = localStorage.getItem("attaguy_plan");
      const previousPlan = oldPlanRaw ? JSON.parse(oldPlanRaw) : null;

      let version = "1.0";
      if (previousPlan?.meta?.version) {
        const currentVersion = parseFloat(previousPlan.meta.version);
        version = Number.isFinite(currentVersion)
          ? (currentVersion + 0.1).toFixed(1)
          : "1.0";
      }

      const newPlan: PlanData = {
        ...plan,
        meta: {
          ...(plan.meta || {}),
          version,
          generatedAt: new Date().toISOString(),
        },
      };

      const preservedPid = String(
        plan.planId ||
          plan.plan_id ||
          previousPlan?.planId ||
          previousPlan?.plan_id ||
          "",
      ).trim();
      if (preservedPid) {
        newPlan.planId = preservedPid;
        newPlan.plan_id = preservedPid;
      }

      if (previousPlan?.meta?.version && oldPlanRaw) {
        const historyKey = `attaguy_plan_v${previousPlan.meta.version}`;
        localStorage.setItem(historyKey, oldPlanRaw);
      }

      localStorage.setItem("attaguy_plan", JSON.stringify(newPlan));
      navigateToResult(router);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "保存失败";
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white">
      <div className="mx-auto max-w-4xl space-y-8">
        <div>
          <h1 className="mb-3 text-3xl font-bold md:text-4xl">编辑方案</h1>
          <p className="text-gray-300">修改设备数量、备注和可选服务。</p>
        </div>

        <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
          <h2 className="mb-4 text-xl font-semibold">设备清单</h2>
          <div className="space-y-4">
            {plan.equipmentList?.map((equip, idx) => (
              <div key={idx} className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <span className="mr-2 text-xs text-gray-400">
                      {equip.category || "-"}
                    </span>
                    <span className="font-semibold text-gray-200">
                      {equip.name || "未命名设备"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-300">数量：</label>
                    <input
                      type="number"
                      min="0"
                      value={equip.qty ?? 0}
                      onChange={(e) =>
                        handleEquipmentChange(
                          idx,
                          "qty",
                          parseInt(e.target.value, 10) || 0
                        )
                      }
                      className="w-20 rounded border border-zinc-700 bg-zinc-800 px-3 py-1 text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-sm text-gray-400">说明 / 备注：</label>
                  <textarea
                    value={equip.reason || ""}
                    onChange={(e) =>
                      handleEquipmentChange(idx, "reason", e.target.value)
                    }
                    className="w-full rounded border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white"
                    rows={2}
                    placeholder="请输入备注..."
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
          <h2 className="mb-4 text-xl font-semibold">可选服务</h2>
          <div className="space-y-3">
            {plan.upsellHints?.map((hint, idx) => {
              let addonKey: string | null = null;
              if (hint.includes("地面") || hint.includes("材料")) addonKey = "flooring";
              else if (hint.includes("康复") || hint.includes("拉伸")) addonKey = "rehab";
              else if (hint.includes("3D") || hint.includes("三维")) addonKey = "design3d";

              return (
                <label
                  key={idx}
                  className="flex cursor-pointer items-center gap-3 rounded-lg p-3 hover:bg-zinc-900"
                >
                  <input
                    type="checkbox"
                    checked={addonKey ? plan.addons?.[addonKey] === true : false}
                    onChange={(e) => {
                      if (addonKey) {
                        handleAddonChange(addonKey, e.target.checked);
                      }
                    }}
                    className="h-5 w-5 rounded border-zinc-700 bg-zinc-800 text-white"
                  />
                  <span className="text-gray-200">{hint}</span>
                </label>
              );
            })}
          </div>
        </section>

        <section className="flex gap-4">
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex-1 rounded-xl bg-white py-4 font-semibold text-black transition hover:bg-gray-200 disabled:opacity-50"
          >
            {loading ? "保存中..." : "保存并生成新版本"}
          </button>

          <button
            onClick={() => navigateToResult(router)}
            className="rounded-xl bg-zinc-800 px-6 py-4 font-semibold text-white transition hover:bg-zinc-700"
          >
            取消
          </button>
        </section>
      </div>
    </main>
  );
}
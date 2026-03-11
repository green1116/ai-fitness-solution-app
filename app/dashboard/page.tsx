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
        <h1 className="text-3xl font-bold">鎴戠殑鏂规锛堟紨绀猴級</h1>
        <p className="text-gray-300 text-sm">
          宸茬櫥褰曠敤鎴凤細<span className="text-white font-semibold">{email || "unknown"}</span>
        </p>

        <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 space-y-3">
          <div className="text-lg font-semibold">涓嬩竴姝ヤ綘鍙互鍋氫粈涔?/div>
          <ul className="list-disc pl-5 text-sm text-gray-300 space-y-1">
            <li>涓嬭浇瀹屾暣 PDF锛堜笅涓€闃舵鎺ュ叆锛?/li>
            <li>淇濆瓨/鏌ョ湅鍘嗗彶鏂规锛堜笅涓€闃舵鎺ュ叆鏁版嵁搴擄級</li>
            <li>鑱旂郴椤鹃棶锛屼唬瀹笅鍗曪紙涓嬩竴闃舵鎺ュ叆鍟嗗煄锛?/li>
          </ul>

          <div className="flex flex-col md:flex-row gap-3 pt-2">
            <Link
              href="/plan"
              className="flex-1 bg-white text-black rounded-xl py-4 font-semibold text-center hover:bg-gray-200 transition"
            >
              鍐嶇敓鎴愪竴浠芥柟妗?
            </Link>

            <button
              onClick={() => alert("涓嬩竴闃舵锛氳繖閲屾帴 PDF 涓嬭浇鎺ュ彛")}
              className="flex-1 rounded-xl py-4 font-semibold border border-zinc-700 hover:border-zinc-500 transition"
            >
              涓嬭浇 PDF锛堝崰浣嶏級
            </button>
          </div>
        </section>

        <button
          onClick={logout}
          className="text-sm text-gray-400 underline hover:text-gray-200"
        >
          閫€鍑虹櫥褰?
        </button>
      </div>
    </main>
  );
}


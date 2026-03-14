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
        <h1 className="text-3xl font-bold">閹存垹娈戦弬瑙勵攳閿涘牊绱ㄧ粈鐚寸礆</h1>
        <p className="text-gray-300 text-sm">
          瀹歌尙娅ヨぐ鏇犳暏閹村嚖绱?span className="text-white font-semibold">{email || "unknown"}</span>
        </p>

        <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 space-y-3">
          <div className="text-lg font-semibold">娑撳绔村銉ょ稑閸欘垯浜掗崑姘矆娑?/div>
          <ul className="list-disc pl-5 text-sm text-gray-300 space-y-1">
            <li>娑撳娴囩€瑰本鏆?PDF閿涘牅绗呮稉鈧梼鑸殿唽閹恒儱鍙嗛敍?/li>
            <li>娣囨繂鐡?閺屻儳婀呴崢鍡楀蕉閺傝顢嶉敍鍫滅瑓娑撯偓闂冭埖顔岄幒銉ュ弳閺佺増宓佹惔鎿勭礆</li>
            <li>閼辨梻閮存い楣冩６閿涘奔鍞€诡澀绗呴崡鏇礄娑撳绔撮梼鑸殿唽閹恒儱鍙嗛崯鍡楃厔閿?/li>
          </ul>

          <div className="flex flex-col md:flex-row gap-3 pt-2">
            <Link
              href="/plan"
              className="flex-1 bg-white text-black rounded-xl py-4 font-semibold text-center hover:bg-gray-200 transition"
            >
              閸愬秶鏁撻幋鎰娴犺姤鏌熷?
            </Link>

            <button
              onClick={() => alert("娑撳绔撮梼鑸殿唽閿涙俺绻栭柌灞惧复 PDF 娑撳娴囬幒銉ュ經")}
              className="flex-1 rounded-xl py-4 font-semibold border border-zinc-700 hover:border-zinc-500 transition"
            >
              娑撳娴?PDF閿涘牆宕版担宥忕礆
            </button>
          </div>
        </section>

        <button
          onClick={logout}
          className="text-sm text-gray-400 underline hover:text-gray-200"
        >
          闁偓閸戣櫣娅ヨぐ?
        </button>
      </div>
    </main>
  );
}


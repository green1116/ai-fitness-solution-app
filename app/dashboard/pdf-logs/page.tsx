import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type SP = { planId?: string };

function fmt(ts: Date) {
  return ts.toISOString().replace("T", " ").slice(0, 19);
}

function withTimeout<T>(p: Promise<T>, ms: number, label = "timeout"): Promise<T> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error(label)), ms);
    p.then(
      (v) => {
        clearTimeout(t);
        resolve(v);
      },
      (e) => {
        clearTimeout(t);
        reject(e);
      }
    );
  });
}

export default async function PdfLogsPage({
  searchParams,
}: {
  searchParams: Promise<SP> | SP;
}) {
  const sp = await Promise.resolve(searchParams);
  const planId = (sp?.planId || "").trim();

  let rows: any[] = [];
  let dbErr = "";

  try {
    // 鉁?鍏抽敭锛氶伩鍏?LetsTAP/PGBouncer 瀵艰嚧 SSR 鍗℃
    rows = await withTimeout(
      prisma.pdfDownloadLog.findMany({
        where: planId ? { planId } : undefined,
        orderBy: { createdAt: "desc" },
        take: 200,
      }),
      4000,
      "DB_QUERY_TIMEOUT"
    );
  } catch (e: any) {
    dbErr = e?.message || String(e);
    console.error("[PDF_LOGS] DB_ERROR:", dbErr);
  }

  return (
    <div className="min-h-screen bg-[#0b0f14] text-white">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="text-2xl font-semibold">PDF 涓嬭浇瀹¤鏃ュ織</div>
        <div className="mt-2 text-sm text-white/60">
          浠呭睍绀烘渶杩?200 鏉°€傚彲鐢?<span className="text-white/80">?planId=xxx</span> 杩囨护銆?        </div>

        {dbErr ? (
          <div className="mt-5 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200/90">
            鏁版嵁搴撴殏涓嶅彲鐢紙鎴栬繛鎺ヨ秴鏃讹級锛屾棩蹇楅〉宸查檷绾ф樉绀虹┖鍒楄〃銆?br />
            <span className="text-xs opacity-80">閿欒锛歿dbErr}</span>
          </div>
        ) : (
          <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-sm text-white/70">
              褰撳墠杩囨护锛歿" "}
              <span className="text-white/90">{planId ? planId : "锛堟棤锛?}</span>
            </div>
          </div>
        )}

        <div className="mt-6 overflow-x-auto rounded-2xl border border-white/10">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 text-white/70">
              <tr>
                <th className="px-4 py-3">鏃堕棿</th>
                <th className="px-4 py-3">planId</th>
                <th className="px-4 py-3">route</th>
                <th className="px-4 py-3">mode</th>
                <th className="px-4 py-3">level</th>
                <th className="px-4 py-3">format</th>
                <th className="px-4 py-3">versions</th>
                <th className="px-4 py-3">REQSIG</th>
                <th className="px-4 py-3">bytes</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/10">
              {rows.map((r) => (
                <tr key={r.id} className="bg-black/20">
                  <td className="px-4 py-3 text-white/70">{fmt(r.createdAt)}</td>
                  <td className="px-4 py-3">{r.planId}</td>
                  <td className="px-4 py-3 text-white/70">{r.route}</td>
                  <td className="px-4 py-3 text-white/70">{r.mode || "-"}</td>
                  <td className="px-4 py-3 text-white/70">{r.level || "-"}</td>
                  <td className="px-4 py-3 text-white/70">{r.format || "-"}</td>
                  <td className="px-4 py-3 text-white/70">
                    {r.pdfVersion
                      ? `pdf=${r.pdfVersion}`
                      : `plan=${r.planVersion || "-"} | budget=${r.budgetVersion || "-"}`}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-white/80">
                    {r.reqsig ? String(r.reqsig).slice(0, 16) : "-"}
                  </td>
                  <td className="px-4 py-3 text-white/70">
                    {typeof r.bytes === "number" ? r.bytes.toLocaleString() : "-"}
                  </td>
                </tr>
              ))}

              {rows.length === 0 && (
                <tr>
                  <td className="px-4 py-6 text-white/60" colSpan={9}>
                    {dbErr
                      ? "鏁版嵁搴撲笉鍙揪/瓒呮椂锛氳鍏堜慨澶嶇綉缁滐紙LetsTAP锛夋垨鍦ㄥ彲鑱旂綉鐜鎵ц杩佺Щ銆?
                      : "鏆傛棤璁板綍锛堝厛涓嬭浇涓€娆℃柟妗?棰勭畻/鎷涙爣鍖呭啀鍒锋柊锛?}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-6 text-xs text-white/40">
          鎻愮ず锛氬悗缁彲鍔?RBAC/鐧诲綍淇濇姢锛涗篃鍙妸 extra 灞曞紑鍒拌鎯呴〉銆?        </div>
      </div>
    </div>
  );
}

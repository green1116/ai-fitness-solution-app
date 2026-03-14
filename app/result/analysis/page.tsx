"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import VerifyGateModal from "../VerifyGateModal";

// ============================================
// /result 椤甸潰瀹屾暣鍓嶇 HTML + CSS
// ============================================
export default function ResultAnalysisPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const resultId = sp.get("id") || "123"; // 浠?URL 鍙傛暟鑾峰彇 result ID

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  // 浠?URL 鍙傛暟鎴栨暟鎹腑鑾峰彇 proposalNo 鍜?orderNo
  const proposalNo = sp.get("proposalNo") || data?.meta?.proposalNo || "attaguy-plan";
  const orderNo = sp.get("orderNo") || data?.orderNo || "";

  // 鍔犺浇缁撴灉鏁版嵁
  useEffect(() => {
    async function loadData() {
      try {
        // TODO: 鏇挎崲涓虹湡瀹?API锛屼緥濡?/api/result/:id
        const res = await fetch(`/api/result/${resultId}`);
        if (!res.ok) {
          // 濡傛灉 API 澶辫触锛屼娇鐢ㄧず渚嬫暟鎹?
          const sample = {
            summary: "鍩轰簬褰撳墠淇℃伅锛岄」鐩瓨鍦ㄦ樉钁楁満浼氾紝浣嗘帹杩涜矾寰勯闄╅珮銆傚缓璁厛楠岃瘉鏍稿績鍋囪锛岄伩鍏嶅墠鏈熷ぇ瑙勬ā鎶曞叆銆?,
            dims: [
              "鐩爣娓呮櫚搴︼細鐩爣鍋忔ā绯婏紝闇€瑕佹妸\"鎯冲仛鐨勪簨\"鎷嗘垚鍙獙璇佸亣璁俱€?,
              "璧勬簮鍖归厤锛氬綋鍓嶈祫婧愰€傚悎灏忚寖鍥撮獙璇侊紝涓嶉€傚悎鍏ㄩ潰閾哄紑銆?,
              "璺緞鍙€嗘€э細褰撳墠璺緞鍥炴挙鎴愭湰楂橈紝闇€瑕佷繚鐣欏洖閫€鏂规銆?,
              "甯傚満涓嶇‘瀹氭€э細鐪熷疄鐢ㄦ埛鍙嶉灏氭湭閲囬泦銆?,
            ],
            risks: [
              "杩囨棭閿佸畾涓€鏉℃湭缁忛獙璇佺殑璺緞锛屽鑷存墽琛屽悗闅句互鍥炴挙銆?,
              "鎶婃妧鏈毦棰樼瓑鍚屼簬楠岃瘉闂锛屽拷鐣ュ晢涓氬繀瑕佹€с€?,
              "鍏抽敭鏁版嵁鎸囨爣灏氭湭鏄庣‘锛屽鏄撳湪鍚庢湡鍑虹幇鍋忓樊銆?,
            ],
            actions: [
              "鏄庣‘褰撳墠鏈€闇€瑕侀獙璇佺殑涓€涓牳蹇冨亣璁撅紝骞惰璁″皬瑙勬ā娴嬭瘯銆?,
              "寤惰繜涓嶅彲閫嗘垚鏈紝閲囩敤蹇€熻凯浠ｈ幏鍙栫湡瀹炴暟鎹€?,
              "鍒跺畾 2 鍛ㄥ唴鐨勫弽棣堢獥鍙ｏ紝纭繚鏃╂湡缁撹鍙婃椂鏍℃銆?,
            ],
          };
          setData(sample);
          return;
        }
        const result = await res.json();
        setData(result);
      } catch (err: any) {
        console.error("鍔犺浇缁撴灉澶辫触:", err);
        // 浣跨敤绀轰緥鏁版嵁浣滀负 fallback
        const sample = {
          summary: "鍩轰簬褰撳墠淇℃伅锛岄」鐩瓨鍦ㄦ樉钁楁満浼氾紝浣嗘帹杩涜矾寰勯闄╅珮銆傚缓璁厛楠岃瘉鏍稿績鍋囪锛岄伩鍏嶅墠鏈熷ぇ瑙勬ā鎶曞叆銆?,
          dims: [
            "鐩爣娓呮櫚搴︼細鐩爣鍋忔ā绯婏紝闇€瑕佹妸\"鎯冲仛鐨勪簨\"鎷嗘垚鍙獙璇佸亣璁俱€?,
            "璧勬簮鍖归厤锛氬綋鍓嶈祫婧愰€傚悎灏忚寖鍥撮獙璇侊紝涓嶉€傚悎鍏ㄩ潰閾哄紑銆?,
            "璺緞鍙€嗘€э細褰撳墠璺緞鍥炴挙鎴愭湰楂橈紝闇€瑕佷繚鐣欏洖閫€鏂规銆?,
            "甯傚満涓嶇‘瀹氭€э細鐪熷疄鐢ㄦ埛鍙嶉灏氭湭閲囬泦銆?,
          ],
          risks: [
            "杩囨棭閿佸畾涓€鏉℃湭缁忛獙璇佺殑璺緞锛屽鑷存墽琛屽悗闅句互鍥炴挙銆?,
            "鎶婃妧鏈毦棰樼瓑鍚屼簬楠岃瘉闂锛屽拷鐣ュ晢涓氬繀瑕佹€с€?,
            "鍏抽敭鏁版嵁鎸囨爣灏氭湭鏄庣‘锛屽鏄撳湪鍚庢湡鍑虹幇鍋忓樊銆?,
          ],
          actions: [
            "鏄庣‘褰撳墠鏈€闇€瑕侀獙璇佺殑涓€涓牳蹇冨亣璁撅紝骞惰璁″皬瑙勬ā娴嬭瘯銆?,
            "寤惰繜涓嶅彲閫嗘垚鏈紝閲囩敤蹇€熻凯浠ｈ幏鍙栫湡瀹炴暟鎹€?,
            "鍒跺畾 2 鍛ㄥ唴鐨勫弽棣堢獥鍙ｏ紝纭繚鏃╂湡缁撹鍙婃椂鏍℃銆?,
          ],
        };
        setData(sample);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [resultId]);

  // 鍒涘缓璁㈠崟骞惰烦杞埌琛ュ厖淇℃伅椤?
  async function handleBuyClick() {
    try {
      const res = await fetch("/api/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: 49900 }),
      });

      if (!res.ok) throw new Error("鍒涘缓璁㈠崟澶辫触");
      const body = await res.json();

      // 鏄剧ず鏀粯璇存槑
      alert("璇锋寜椤甸潰鎻愮ず鏀粯锛? + JSON.stringify(body.pay_instructions));

      // 璺宠浆鍒拌ˉ鍏呬俊鎭〉
      router.push(`/deep-form?order_no=${body.order_no}`);
    } catch (err: any) {
      alert(err?.message || "鍒涘缓璁㈠崟澶辫触");
    }
  }

  // 涓嬭浇鎶ュ憡 - 鎵撳紑楠岃瘉 Modal
  function handleDownloadClick() {
    setModalOpen(true);
  }

  // 浜哄伐鍜ㄨ
  function handleContactClick() {
    alert("浜哄伐鍜ㄨ鍔熻兘锛氳鑱旂郴瀹㈡湇鎴栧～鍐欒〃鍗?);
  }

  if (loading) {
    return (
      <div style={{ padding: 24, textAlign: "center" }}>
        <p>鍔犺浇涓€︹€?/p>
      </div>
    );
  }

  return (
    <>
      <style jsx>{`
        :root {
          font-family: Inter, system-ui, "Segoe UI", Arial, sans-serif;
          color: #222;
        }
        body {
          margin: 0;
          background: #f5f6f8;
          padding: 24px;
        }
        .container {
          max-width: 920px;
          margin: 20px auto;
          background: #fff;
          border-radius: 10px;
          box-shadow: 0 6px 22px rgba(12, 20, 30, 0.06);
          overflow: hidden;
        }
        header {
          padding: 28px 32px;
          border-bottom: 1px solid #eef0f3;
          background: linear-gradient(90deg, #fbfcfd, #ffffff);
        }
        .title {
          font-size: 20px;
          font-weight: 700;
          margin: 0 0 6px;
        }
        .sub {
          color: #6b7280;
          font-size: 13px;
          margin: 0;
        }
        .summary {
          padding: 22px 32px;
          background: #f7fbff;
          border-left: 4px solid #2b7cff;
        }
        .summary h2 {
          margin: 0;
          font-size: 16px;
        }
        .summary p {
          margin: 8px 0 0;
          color: #1f2937;
          font-size: 15px;
        }
        .grid {
          display: grid;
          grid-template-columns: 1fr 320px;
          gap: 18px;
          padding: 20px 32px;
        }
        .card {
          background: #fff;
          border-radius: 8px;
          padding: 16px;
          border: 1px solid #eef2f6;
        }
        .card h3 {
          margin: 0;
          font-size: 15px;
        }
        .list {
          margin: 8px 0 0;
          padding-left: 18px;
          color: #344054;
        }
        .list li {
          margin: 8px 0;
        }
        .risk {
          background: #fff5f5;
          border-left: 4px solid #ff6b6b;
        }
        .cta {
          padding: 20px 32px;
          border-top: 1px solid #eef0f3;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .btn {
          background: #0b63ff;
          color: #fff;
          padding: 10px 16px;
          border-radius: 8px;
          border: none;
          font-weight: 600;
          cursor: pointer;
        }
        .btn:hover {
          background: #0954d6;
        }
        .muted {
          color: #6b7280;
          font-size: 13px;
        }
        .small-note {
          font-size: 13px;
          color: #475569;
          margin-top: 6px;
        }
        @media (max-width: 900px) {
          .grid {
            grid-template-columns: 1fr;
            padding: 16px;
          }
          .container {
            margin: 8px;
          }
          .cta {
            flex-direction: column;
            gap: 12px;
            align-items: flex-start;
          }
        }
      `}</style>

      <div className="container" id="app">
        <header>
          <div className="title">AI 鍒ゆ柇鍜ㄨ鎶ュ憡</div>
          <div className="sub">
            鍩轰簬浣犳彁浜ょ殑鑳屾櫙涓庤祫婧愶紝AI 缁欏嚭缁撴瀯鍖栧垽鏂€斺€斿彲鐢ㄤ簬鍐崇瓥鏄惁缁х画鎶曞叆
          </div>
        </header>

        <section className="summary">
          <h2>AI 缁煎悎鍒ゆ柇缁撹锛圗xecutive Summary锛?/h2>
          <p id="summary">{data?.summary || "鍔犺浇涓€︹€?}</p>
        </section>

        <div className="grid">
          <div>
            <div className="card">
              <h3>鍏抽敭鍒ゆ柇缁村害锛圓I 鐨勬€濊€冮€昏緫锛?/h3>
              <ol className="list" id="dims">
                {data?.dims?.map((dim: string, i: number) => (
                  <li key={i}>{dim}</li>
                )) || <li>鏆傛棤鏁版嵁</li>}
              </ol>
            </div>

            <div className="card risk" style={{ marginTop: 12 }}>
              <h3>璇嗗埆鍑虹殑鍏抽敭椋庨櫓涓庣洸鍖?/h3>
              <ul className="list" id="risks">
                {data?.risks?.map((risk: string, i: number) => (
                  <li key={i}>{risk}</li>
                )) || <li>鏆傛棤椋庨櫓鎻愮ず</li>}
              </ul>
            </div>

            <div className="card" style={{ marginTop: 12 }}>
              <h3>褰撳墠闃舵鍙墽琛屽缓璁紙鍏嶈垂锛?/h3>
              <ul className="list" id="actions">
                {data?.actions?.map((action: string, i: number) => (
                  <li key={i}>{action}</li>
                )) || <li>鏆傛棤寤鸿</li>}
              </ul>
            </div>
          </div>

          <aside>
            <div className="card">
              <h3>涓嬩竴姝ュ缓璁?/h3>
              <p className="small-note">
                鑻ラ渶寰楀埌閽堝浣犳儏鍐电殑瀹屾暣鍒ゆ柇鎶ュ憡锛堝惈椋庨櫓鎷嗚В銆佹浛浠ｈ矾寰勪笌缁撹锛夛紝璇疯喘涔般€屾繁鍖栧垽鏂柟妗堛€嶃€?
              </p>
              <div style={{ marginTop: 12 }}>
                <button className="btn" id="buyBtn" onClick={handleBuyClick}>
                  鑾峰彇娣卞寲鍒ゆ柇鏂规锛埪?99锛?
                </button>
                <p className="muted" style={{ marginTop: 10 }}>
                  鏀粯鍚庡皢寮曞浣犲～鍐?10 涓叧閿棶棰橈紝48灏忔椂鍐呬氦浠樻姤鍛婏紙浜哄伐+AI).
                </p>
              </div>
            </div>

            <div className="card" style={{ marginTop: 12 }}>
              <h3>甯歌 Q&A</h3>
              <p className="small-note">
                鏈垽鏂笉鍖呭惈浠ｇ爜浜や粯鍜屾墽琛屽缓璁€傝嫢闇€鍚庣画鎵ц鍜ㄨ锛岃鍦ㄦ姤鍛婂唴閫夋嫨璺熻繘鏈嶅姟銆?
              </p>
            </div>
          </aside>
        </div>

        <div className="cta">
          <div className="muted">
            鎶ュ憡鐢?AI + 涓撳澶嶆牳鐢熸垚銆傛姤鍛婁粎渚涘喅绛栧弬鑰冦€?
          </div>
          <div>
            <button
              className="btn"
              id="downloadBtn"
              onClick={handleDownloadClick}
              style={{ marginRight: 8 }}
            >
              涓嬭浇鎶ュ憡锛堢ず渚嬶級
            </button>
            <button
              className="btn"
              id="contactBtn"
              onClick={handleContactClick}
              style={{ background: "#0f1724" }}
            >
              浜哄伐鍜ㄨ
            </button>
          </div>
        </div>
      </div>

      <VerifyGateModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        proposalNo={proposalNo}
        orderNo={orderNo || undefined}
        plan={data}
        onPay={() => router.push("/pay")}
        onVerified={(emailToken: string) => {
          const { maskToken } = require("@/lib/mask");
          console.log("閭楠岃瘉鎴愬姛锛宼oken:", maskToken(emailToken));
        }}
      />
    </>
  );
}


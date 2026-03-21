"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import VerifyGateModal from "../VerifyGateModal";

type AnalysisData = {
  summary: string;
  dims: string[];
  risks: string[];
  actions: string[];
  meta?: {
    proposalNo?: string;
  };
  orderNo?: string;
};

function getSampleData(): AnalysisData {
  return {
    summary:
      "基于当前信息，项目存在明显机会，但推进路径风险较高。建议先验证核心假设，避免前期大规模投入。",
    dims: [
      "目标清晰度：当前目标仍偏模糊，需要把“想做的事”拆成可验证的问题。",
      "资源匹配：现有资源更适合先做小范围验证，不适合立即全面铺开。",
      "路径可逆性：当前方案一旦推进，回撤成本较高，需要预留调整空间。",
      "市场不确定性：真实用户反馈和关键数据仍不足，结论需要更多证据支持。",
    ],
    risks: [
      "过早锁定一条尚未验证的路径，导致后续执行难以回撤。",
      "把技术难点当成核心问题，而忽略商业与需求验证。",
      "关键指标尚未定义清楚，容易造成后续判断偏差。",
    ],
    actions: [
      "明确当前最需要验证的一个核心假设，并设计小规模测试。",
      "延后不可逆投入，优先用快速迭代方式获取真实数据。",
      "设定 2 周内的反馈窗口，确保阶段性结论能被及时修正。",
    ],
  };
}

export default function AnalysisClient() {
  const router = useRouter();
  const sp = useSearchParams();
  const resultId = sp.get("id") || "123";

  const [data, setData] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const proposalNo = sp.get("proposalNo") || data?.meta?.proposalNo || "attaguy-plan";
  const orderNo = sp.get("orderNo") || data?.orderNo || "";

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch(`/api/result/${resultId}`);

        if (!res.ok) {
          setData(getSampleData());
          return;
        }

        const result = (await res.json()) as AnalysisData;
        setData(result);
      } catch (err) {
        console.error("加载结果失败:", err);
        setData(getSampleData());
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [resultId]);

  async function handleBuyClick() {
    try {
      const res = await fetch("/api/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: 49900 }),
      });

      if (!res.ok) {
        throw new Error("创建订单失败");
      }

      const body = await res.json();

      alert("请按页面提示完成支付：" + JSON.stringify(body.pay_instructions));
      router.push(`/deep-form?order_no=${body.order_no}`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "创建订单失败";
      alert(message);
    }
  }

  function handleDownloadClick() {
    setModalOpen(true);
  }

  function handleContactClick() {
    alert("人工咨询功能：请联系客服或填写补充表单。");
  }

  if (loading) {
    return (
      <div style={{ padding: 24, textAlign: "center" }}>
        <p>加载中…</p>
      </div>
    );
  }

  return (
    <>
      <style jsx>{`
        :global(:root) {
          font-family: Inter, system-ui, "Segoe UI", Arial, sans-serif;
          color: #222;
        }

        :global(body) {
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
          line-height: 1.7;
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
          line-height: 1.8;
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
          line-height: 1.7;
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
          gap: 16px;
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
          line-height: 1.7;
        }

        .small-note {
          font-size: 13px;
          color: #475569;
          margin-top: 6px;
          line-height: 1.7;
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
            align-items: flex-start;
          }
        }
      `}</style>

      <div className="container" id="app">
        <header>
          <div className="title">AI 判断咨询报告</div>
          <div className="sub">
            基于你提交的背景与资源，AI 给出结构化判断，用于辅助决策是否继续投入。
          </div>
        </header>

        <section className="summary">
          <h2>AI 综合判断结论（Executive Summary）</h2>
          <p id="summary">{data?.summary || "加载中…"}</p>
        </section>

        <div className="grid">
          <div>
            <div className="card">
              <h3>关键判断维度（AI 的思考逻辑）</h3>
              <ol className="list" id="dims">
                {data?.dims?.length ? (
                  data.dims.map((dim, i) => <li key={i}>{dim}</li>)
                ) : (
                  <li>暂无数据</li>
                )}
              </ol>
            </div>

            <div className="card risk" style={{ marginTop: 12 }}>
              <h3>识别出的关键风险与盲区</h3>
              <ul className="list" id="risks">
                {data?.risks?.length ? (
                  data.risks.map((risk, i) => <li key={i}>{risk}</li>)
                ) : (
                  <li>暂无风险提示</li>
                )}
              </ul>
            </div>

            <div className="card" style={{ marginTop: 12 }}>
              <h3>当前阶段可执行建议（免费）</h3>
              <ul className="list" id="actions">
                {data?.actions?.length ? (
                  data.actions.map((action, i) => <li key={i}>{action}</li>)
                ) : (
                  <li>暂无建议</li>
                )}
              </ul>
            </div>
          </div>

          <aside>
            <div className="card">
              <h3>下一步建议</h3>
              <p className="small-note">
                如果你希望获得针对当前情况的完整判断报告，包含风险拆解、替代路径和结论建议，可以购买“深度判断方案”。
              </p>

              <div style={{ marginTop: 12 }}>
                <button className="btn" id="buyBtn" onClick={handleBuyClick}>
                  获取深度判断方案（￥499）
                </button>

                <p className="muted" style={{ marginTop: 10 }}>
                  支付后将引导你补充 10 个关键问题，我们会在 48 小时内交付报告（人工 + AI）。
                </p>
              </div>
            </div>

            <div className="card" style={{ marginTop: 12 }}>
              <h3>常见 Q&amp;A</h3>
              <p className="small-note">
                本判断不包含代码交付和落地执行建议。如需后续执行咨询，可在报告内选择跟进服务。
              </p>
            </div>
          </aside>
        </div>

        <div className="cta">
          <div className="muted">报告由 AI + 专家复核生成，仅供决策参考。</div>

          <div>
            <button
              className="btn"
              id="downloadBtn"
              onClick={handleDownloadClick}
              style={{ marginRight: 8 }}
            >
              下载报告（示例）
            </button>

            <button
              className="btn"
              id="contactBtn"
              onClick={handleContactClick}
              style={{ background: "#0f1724" }}
            >
              人工咨询
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
        planId={proposalNo}
        mode="full"
        onPay={() => router.push("/pay")}
        onVerified={(downloadToken: string) => {
          const { maskToken } = require("@/lib/mask");
          console.log("邮箱验证成功，token:", maskToken(downloadToken));
        }}
      />
    </>
  );
}
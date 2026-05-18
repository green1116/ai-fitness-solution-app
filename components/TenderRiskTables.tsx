"use client";

import React, { useMemo } from "react";

export type TenderRiskTableRow = {
  requirement?: string;
  response?: string;
  status?: string;
  ref?: string;
  id?: string;
};

type Props = {
  technicalRows: TenderRiskTableRow[];
  businessRows: TenderRiskTableRow[];
  /** 缺失附件编码列表（与 computeTenderRisk 的 code 一致） */
  attachmentCodes?: string[];
  techResponseSectionRef?: React.RefObject<HTMLDivElement | null>;
  bizResponseSectionRef?: React.RefObject<HTMLDivElement | null>;
  attachmentSectionRef?: React.RefObject<HTMLDivElement | null>;
  /** Gate「去补强」关键词映射后的高亮 key，约 2.2s 后由页面清除 */
  highlightFixKey?: string | null;
  getFixHighlightClass?: (key: string) => string;
  highlightRowKey?: string | null;
  getHighlightRowClass?: (key: string) => string;
};

const HIGHLIGHT_ROW_PATTERNS: Record<string, readonly string[]> = {
  "tech-brand": ["品牌"],
  "tech-model": ["型号"],
  "tech-spec": ["规格"],
  "tech-parameter": ["参数"],
  "tech-response": ["技术响应", "响应表"],
  "biz-price": ["报价", "价格"],
  "biz-terms": ["商务条款"],
  "biz-qualification": ["资质"],
  "biz-license": ["营业执照"],
  "biz-performance": ["业绩"],
  "biz-contract": ["合同"],
  "attachment-file": ["附件"],
  "attachment-proof": ["证明"],
  "attachment-certificate": ["证书"],
  "attachment-scan": ["扫描件"],
  "attachment-stamp": ["盖章"],
  "attachment-sign": ["签字", "签署"],
  "attachment-upload": ["上传"],
};

const ROW_HIGHLIGHT_HINTS: Record<string, string> = {
  "tech-brand": "请补充品牌信息",
  "tech-model": "请补充型号信息",
  "tech-spec": "请补充规格信息",
  "tech-parameter": "请补充技术参数",
  "tech-response": "请完善技术响应表述",
  "biz-price": "请核对报价/价格信息",
  "biz-terms": "请完善商务条款响应",
  "biz-qualification": "请补充资质文件",
  "biz-license": "请补充营业执照材料",
  "biz-performance": "请补充业绩证明材料",
  "biz-contract": "请补充合同证明",
  "attachment-file": "请上传附件文件",
  "attachment-proof": "请补充证明材料",
  "attachment-certificate": "请补充证书文件",
  "attachment-scan": "请补充扫描件",
  "attachment-stamp": "请补充盖章文件",
  "attachment-sign": "请补充签字/签署文件",
  "attachment-upload": "请检查上传状态与文件完整性",
};

const FIX_HIGHLIGHT_OFF = "__fix_highlight_off__";
const ROW_HIGHLIGHT_OFF = "__row_highlight_off__";

function rowBlob(row: TenderRiskTableRow) {
  return `${row.requirement || ""}${row.response || ""}`.toLowerCase();
}

function rowMatchesHighlightKey(
  row: TenderRiskTableRow,
  hKey: string | null | undefined
) {
  if (!hKey) return false;
  const patterns = HIGHLIGHT_ROW_PATTERNS[hKey];
  if (!patterns) return false;
  const blob = rowBlob(row);
  return patterns.some((p) => blob.includes(p.toLowerCase()));
}

function trHighlightClass(
  getHighlightRowClass: (k: string) => string,
  row: TenderRiskTableRow,
  hKey: string | null | undefined
) {
  const k =
    hKey && rowMatchesHighlightKey(row, hKey) ? hKey : ROW_HIGHLIGHT_OFF;
  return ["rounded-lg border", getHighlightRowClass(k)].join(" ");
}

function rowHintText(
  row: TenderRiskTableRow,
  hKey: string | null | undefined
) {
  if (!hKey) return null;
  if (!rowMatchesHighlightKey(row, hKey)) return null;
  return ROW_HIGHLIGHT_HINTS[hKey] || "请优先完善该项";
}

function attachmentItemHighlightClass(
  getHighlightRowClass: (k: string) => string,
  code: string,
  hKey: string | null | undefined
) {
  if (!hKey || !hKey.startsWith("attachment-")) {
    return ["rounded-lg border", getHighlightRowClass(ROW_HIGHLIGHT_OFF)].join(
      " "
    );
  }
  const patterns = HIGHLIGHT_ROW_PATTERNS[hKey];
  const t = code.toLowerCase();
  const codeTextMap: Record<string, string> = {
    "attachment-file": "附件",
    "attachment-proof": "证明",
    "attachment-certificate": "证书",
    "attachment-scan": "扫描件",
    "attachment-stamp": "盖章",
    "attachment-sign": "签字 签署",
    "attachment-upload": "上传",
  };
  const alias = codeTextMap[hKey] || "";
  const blob = `${t} ${alias}`.toLowerCase();
  const match =
    patterns && patterns.some((p) => blob.includes(p.toLowerCase()));
  const k = hKey && match ? hKey : ROW_HIGHLIGHT_OFF;
  return ["rounded-lg border", getHighlightRowClass(k)].join(" ");
}

function attachmentHintText(code: string, hKey: string | null | undefined) {
  if (!hKey || !hKey.startsWith("attachment-")) return null;
  const patterns = HIGHLIGHT_ROW_PATTERNS[hKey];
  const codeTextMap: Record<string, string> = {
    "attachment-file": "附件",
    "attachment-proof": "证明",
    "attachment-certificate": "证书",
    "attachment-scan": "扫描件",
    "attachment-stamp": "盖章",
    "attachment-sign": "签字 签署",
    "attachment-upload": "上传",
  };
  const alias = codeTextMap[hKey] || "";
  const blob = `${code.toLowerCase()} ${alias}`.toLowerCase();
  const matched =
    patterns && patterns.some((p) => blob.includes(p.toLowerCase()));
  return matched ? ROW_HIGHLIGHT_HINTS[hKey] || "请优先完善该项" : null;
}

function sectionHighlightClassName(
  getFixHighlightClass: (key: string) => string,
  highlightFixKey: string | null | undefined,
  keys: readonly string[]
) {
  const key =
    highlightFixKey && keys.includes(highlightFixKey)
      ? highlightFixKey
      : FIX_HIGHLIGHT_OFF;
  return ["rounded-xl border", getFixHighlightClass(key)].join(" ");
}

function rowRef(row: TenderRiskTableRow, index: number) {
  return row.ref || row.id || String(index);
}

export default function TenderRiskTables({
  technicalRows,
  businessRows,
  attachmentCodes = [],
  techResponseSectionRef,
  bizResponseSectionRef,
  attachmentSectionRef,
  highlightFixKey,
  getFixHighlightClass,
  highlightRowKey,
  getHighlightRowClass,
}: Props) {
  const deviationRows = useMemo(() => {
    const all = [...technicalRows, ...businessRows];
    const flagged = all.filter(
      (r) =>
        r.status === "偏离" ||
        (typeof r.status === "string" && r.status.includes("偏离"))
    );
    if (flagged.length > 0) return flagged;
    return all.filter(
      (r) =>
        r.status === "部分满足" ||
        r.status === "待确认"
    );
  }, [technicalRows, businessRows]);

  const showAny =
    technicalRows.length > 0 ||
    businessRows.length > 0 ||
    deviationRows.length > 0 ||
    attachmentCodes.length > 0;

  if (!showAny) return null;

  const tableShell =
    "mt-4 w-full overflow-x-auto rounded-xl border border-white/10 text-sm";

  return (
    <div className="mt-4 space-y-6">
      {technicalRows.length > 0 ? (
        <div
          ref={techResponseSectionRef}
          className={
            getFixHighlightClass
              ? sectionHighlightClassName(getFixHighlightClass, highlightFixKey, [
                  "tech-spec",
                  "tech-response",
                ])
              : undefined
          }
        >
          <div className="text-sm font-semibold text-white/90">技术响应表</div>
          <table className={tableShell}>
            <thead className="bg-white/5 text-left text-white/60">
              <tr>
                <th className="px-3 py-2">编号</th>
                <th className="px-3 py-2">条款</th>
                <th className="px-3 py-2">响应</th>
                <th className="px-3 py-2">状态</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10 text-white/85">
              {technicalRows.map((row, index) => (
                <tr
                  key={row.id ?? row.ref ?? index}
                  data-table="technical"
                  data-row-ref={rowRef(row, index)}
                  className={
                    getHighlightRowClass
                      ? trHighlightClass(
                          getHighlightRowClass,
                          row,
                          highlightRowKey
                        )
                      : undefined
                  }
                >
                  <td className="px-3 py-2 font-mono text-xs text-amber-200/90">
                    {rowRef(row, index)}
                  </td>
                  <td className="px-3 py-2">
                    {rowHintText(row, highlightRowKey) ? (
                      <div className="mb-2 inline-flex rounded-full border border-amber-300/40 bg-amber-400/15 px-2 py-1 text-xs font-medium text-amber-200">
                        当前建议优先补强：{rowHintText(row, highlightRowKey)}
                      </div>
                    ) : null}
                    <div>{row.requirement || "—"}</div>
                  </td>
                  <td className="px-3 py-2">{row.response || "—"}</td>
                  <td className="px-3 py-2">{row.status || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {businessRows.length > 0 ? (
        <div
          ref={bizResponseSectionRef}
          className={
            getFixHighlightClass
              ? sectionHighlightClassName(getFixHighlightClass, highlightFixKey, [
                  "biz-price",
                  "biz-qualification",
                ])
              : undefined
          }
        >
          <div className="text-sm font-semibold text-white/90">商务响应表</div>
          <table className={tableShell}>
            <thead className="bg-white/5 text-left text-white/60">
              <tr>
                <th className="px-3 py-2">编号</th>
                <th className="px-3 py-2">条款</th>
                <th className="px-3 py-2">响应</th>
                <th className="px-3 py-2">状态</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10 text-white/85">
              {businessRows.map((row, index) => (
                <tr
                  key={row.id ?? row.ref ?? index}
                  data-table="business"
                  data-row-ref={rowRef(row, index)}
                  className={
                    getHighlightRowClass
                      ? trHighlightClass(
                          getHighlightRowClass,
                          row,
                          highlightRowKey
                        )
                      : undefined
                  }
                >
                  <td className="px-3 py-2 font-mono text-xs text-amber-200/90">
                    {rowRef(row, index)}
                  </td>
                  <td className="px-3 py-2">
                    {rowHintText(row, highlightRowKey) ? (
                      <div className="mb-2 inline-flex rounded-full border border-amber-300/40 bg-amber-400/15 px-2 py-1 text-xs font-medium text-amber-200">
                        当前建议优先补强：{rowHintText(row, highlightRowKey)}
                      </div>
                    ) : null}
                    <div>{row.requirement || "—"}</div>
                  </td>
                  <td className="px-3 py-2">{row.response || "—"}</td>
                  <td className="px-3 py-2">{row.status || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {deviationRows.length > 0 ? (
        <div>
          <div className="text-sm font-semibold text-white/90">偏离表</div>
          <table className={tableShell}>
            <thead className="bg-white/5 text-left text-white/60">
              <tr>
                <th className="px-3 py-2">编号</th>
                <th className="px-3 py-2">条款</th>
                <th className="px-3 py-2">响应</th>
                <th className="px-3 py-2">状态</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10 text-white/85">
              {deviationRows.map((row, index) => (
                <tr
                  key={`dev-${row.id ?? row.ref ?? index}`}
                  data-table="deviation"
                  data-row-ref={rowRef(row, index)}
                  className={
                    getHighlightRowClass
                      ? trHighlightClass(
                          getHighlightRowClass,
                          row,
                          highlightRowKey
                        )
                      : undefined
                  }
                >
                  <td className="px-3 py-2 font-mono text-xs text-amber-200/90">
                    {rowRef(row, index)}
                  </td>
                  <td className="px-3 py-2">
                    {rowHintText(row, highlightRowKey) ? (
                      <div className="mb-2 inline-flex rounded-full border border-amber-300/40 bg-amber-400/15 px-2 py-1 text-xs font-medium text-amber-200">
                        当前建议优先补强：{rowHintText(row, highlightRowKey)}
                      </div>
                    ) : null}
                    <div>{row.requirement || "—"}</div>
                  </td>
                  <td className="px-3 py-2">{row.response || "—"}</td>
                  <td className="px-3 py-2">{row.status || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {attachmentCodes.length > 0 ? (
        <div
          ref={attachmentSectionRef}
          className={
            getFixHighlightClass
              ? sectionHighlightClassName(getFixHighlightClass, highlightFixKey, [
                  "attachment-file",
                  "attachment-sign",
                ])
              : undefined
          }
        >
          <div className="text-sm font-semibold text-white/90">附件项</div>
          <div className="mt-2 space-y-2 rounded-xl border border-white/10 p-3">
            {attachmentCodes.map((code) => (
              <div
                key={code}
                data-attachment-code={code}
                className={[
                  "bg-black/20 px-3 py-2 text-white/80",
                  getHighlightRowClass
                    ? attachmentItemHighlightClass(
                        getHighlightRowClass,
                        code,
                        highlightRowKey
                      )
                    : "rounded-lg border border-white/10",
                ].join(" ")}
              >
                {attachmentHintText(code, highlightRowKey) ? (
                  <div className="mb-2 inline-flex rounded-full border border-amber-300/40 bg-amber-400/15 px-2 py-1 text-xs font-medium text-amber-200">
                    当前建议优先补强：{attachmentHintText(code, highlightRowKey)}
                  </div>
                ) : null}
                <span className="font-mono text-xs text-amber-200/90">
                  {code}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

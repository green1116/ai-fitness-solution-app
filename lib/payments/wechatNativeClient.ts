/**
 * WeChat Pay API v3 Native (QR) client helpers.
 * Signs requests with merchant private key; never log secrets.
 */
import crypto from "node:crypto";

const WECHAT_NATIVE_PATH = "/v3/pay/transactions/native";
const WECHAT_API_HOST = "https://api.mch.weixin.qq.com";

export type WechatNativeConfig = {
  mchId: string;
  appId: string;
  serialNo: string;
  privateKeyPem: string;
};

export type WechatNativePrepayInput = {
  outTradeNo: string;
  description: string;
  amountTotalFen: number;
  notifyUrl: string;
};

export type WechatNativePrepayResult = {
  codeUrl: string;
};

function readRequiredEnv(name: string): string {
  const v = process.env[name]?.trim();
  if (!v) {
    throw new Error(`NOT_CONFIGURED: missing ${name}`);
  }
  return v;
}

/** Normalize PEM from env (supports literal \n escapes). */
export function normalizeWechatPrivateKey(raw: string): string {
  let key = raw.trim().replace(/\\n/g, "\n");
  if (!key.includes("BEGIN")) {
    key = `-----BEGIN PRIVATE KEY-----\n${key}\n-----END PRIVATE KEY-----`;
  }
  return key;
}

export function loadWechatNativeConfig(): WechatNativeConfig {
  return {
    mchId: readRequiredEnv("WECHAT_PAY_MCH_ID"),
    appId: readRequiredEnv("WECHAT_PAY_APP_ID"),
    serialNo: readRequiredEnv("WECHAT_PAY_SERIAL_NO"),
    privateKeyPem: normalizeWechatPrivateKey(
      readRequiredEnv("WECHAT_PAY_PRIVATE_KEY"),
    ),
  };
}

function buildSignMessage(
  method: string,
  urlPath: string,
  timestamp: string,
  nonceStr: string,
  body: string,
): string {
  return `${method}\n${urlPath}\n${timestamp}\n${nonceStr}\n${body}\n`;
}

export function signWechatPayV3(
  message: string,
  privateKeyPem: string,
): string {
  const signer = crypto.createSign("RSA-SHA256");
  signer.update(message);
  signer.end();
  return signer.sign(privateKeyPem, "base64");
}

function buildAuthorizationHeader(opts: {
  mchId: string;
  serialNo: string;
  privateKeyPem: string;
  method: string;
  urlPath: string;
  body: string;
}): string {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const nonceStr = crypto.randomBytes(16).toString("hex");
  const message = buildSignMessage(
    opts.method,
    opts.urlPath,
    timestamp,
    nonceStr,
    opts.body,
  );
  const signature = signWechatPayV3(message, opts.privateKeyPem);
  return (
    `WECHATPAY2-SHA256-RSA2048 ` +
    `mchid="${opts.mchId}",` +
    `nonce_str="${nonceStr}",` +
    `signature="${signature}",` +
    `timestamp="${timestamp}",` +
    `serial_no="${opts.serialNo}"`
  );
}

export type WechatTransactionQueryResult = {
  outTradeNo: string;
  transactionId: string;
  tradeState: string;
  mchid: string;
  appid?: string;
  amountTotal: number;
  currency: string | null;
};

/**
 * GET /v3/pay/transactions/out-trade-no/{out_trade_no}?mchid=...
 * Authoritative transaction query for reconciliation when notify was missed.
 */
export async function queryWechatTransactionByOutTradeNo(
  outTradeNo: string,
): Promise<WechatTransactionQueryResult> {
  const id = outTradeNo.trim();
  if (!id) {
    throw new Error("WECHAT_QUERY_MISSING_OUT_TRADE_NO");
  }

  const config = loadWechatNativeConfig();
  const pathWithQuery = `/v3/pay/transactions/out-trade-no/${encodeURIComponent(id)}?mchid=${encodeURIComponent(config.mchId)}`;
  const authorization = buildAuthorizationHeader({
    mchId: config.mchId,
    serialNo: config.serialNo,
    privateKeyPem: config.privateKeyPem,
    method: "GET",
    urlPath: pathWithQuery,
    body: "",
  });

  const res = await fetch(`${WECHAT_API_HOST}${pathWithQuery}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: authorization,
    },
  });

  const rawText = await res.text().catch(() => "");
  let parsed: Record<string, unknown> = {};
  try {
    parsed = rawText ? (JSON.parse(rawText) as Record<string, unknown>) : {};
  } catch {
    parsed = {};
  }

  if (!res.ok) {
    const code = typeof parsed.code === "string" ? parsed.code : "";
    const message =
      typeof parsed.message === "string" && parsed.message.trim()
        ? parsed.message.trim()
        : `WeChat Pay query failed with HTTP ${res.status}`;
    throw new Error(
      `WECHAT_QUERY_FAILED: ${code ? `${code}: ` : ""}${message}`,
    );
  }

  const amount =
    parsed.amount && typeof parsed.amount === "object"
      ? (parsed.amount as Record<string, unknown>)
      : null;
  const amountTotal =
    typeof amount?.total === "number" ? amount.total : Number.NaN;
  const currency =
    typeof amount?.currency === "string" ? amount.currency.trim() : null;

  const outTradeNoResp =
    typeof parsed.out_trade_no === "string" ? parsed.out_trade_no.trim() : "";
  const transactionId =
    typeof parsed.transaction_id === "string"
      ? parsed.transaction_id.trim()
      : "";
  const tradeState =
    typeof parsed.trade_state === "string"
      ? parsed.trade_state.trim().toUpperCase()
      : "";
  const mchid = typeof parsed.mchid === "string" ? parsed.mchid.trim() : "";
  const appid = typeof parsed.appid === "string" ? parsed.appid.trim() : undefined;

  if (!outTradeNoResp || !transactionId || !tradeState || !mchid) {
    throw new Error("WECHAT_QUERY_INVALID_RESPONSE: missing required fields");
  }
  if (!Number.isInteger(amountTotal) || amountTotal <= 0) {
    throw new Error("WECHAT_QUERY_INVALID_RESPONSE: invalid amount.total");
  }

  return {
    outTradeNo: outTradeNoResp,
    transactionId,
    tradeState,
    mchid,
    appid: appid || undefined,
    amountTotal,
    currency,
  };
}

/**
 * POST /v3/pay/transactions/native — returns code_url for QR/native pay.
 */
export async function createWechatNativePrepay(
  input: WechatNativePrepayInput,
): Promise<WechatNativePrepayResult> {
  const config = loadWechatNativeConfig();
  // Ensure API_V3_KEY is present for production readiness (used by future webhook decrypt).
  readRequiredEnv("WECHAT_PAY_API_V3_KEY");

  if (!Number.isInteger(input.amountTotalFen) || input.amountTotalFen <= 0) {
    throw new Error("INVALID_AMOUNT: amount.total must be a positive integer (fen)");
  }

  const bodyObj = {
    appid: config.appId,
    mchid: config.mchId,
    description: input.description.slice(0, 127),
    out_trade_no: input.outTradeNo,
    notify_url: input.notifyUrl,
    amount: {
      total: input.amountTotalFen,
      currency: "CNY",
    },
  };
  const body = JSON.stringify(bodyObj);
  const authorization = buildAuthorizationHeader({
    mchId: config.mchId,
    serialNo: config.serialNo,
    privateKeyPem: config.privateKeyPem,
    method: "POST",
    urlPath: WECHAT_NATIVE_PATH,
    body,
  });

  const res = await fetch(`${WECHAT_API_HOST}${WECHAT_NATIVE_PATH}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: authorization,
    },
    body,
  });

  const rawText = await res.text().catch(() => "");
  let parsed: { code_url?: unknown; code?: unknown; message?: unknown } = {};
  try {
    parsed = rawText ? (JSON.parse(rawText) as typeof parsed) : {};
  } catch {
    parsed = {};
  }

  if (!res.ok) {
    const code = typeof parsed.code === "string" ? parsed.code : "";
    const message =
      typeof parsed.message === "string" && parsed.message.trim()
        ? parsed.message.trim()
        : `WeChat Pay Native failed with HTTP ${res.status}`;
    // Do not include response body secrets; WeChat error payloads are safe to surface briefly.
    throw new Error(
      `WECHAT_NATIVE_FAILED: ${code ? `${code}: ` : ""}${message}`,
    );
  }

  const codeUrl =
    typeof parsed.code_url === "string" ? parsed.code_url.trim() : "";
  if (!codeUrl) {
    throw new Error("WECHAT_NATIVE_INVALID_RESPONSE: missing code_url");
  }

  return { codeUrl };
}

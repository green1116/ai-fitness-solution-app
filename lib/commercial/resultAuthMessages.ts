/**
 * /result 页「付费授权」相关文案：生产与开发区分，避免向普通用户暴露开发态提示。
 */

export function isClientDevBuild(): boolean {
  return process.env.NODE_ENV !== "production";
}

/** 本地已有持久化 License Key，可作为客户端侧的「已激活」信号（最终权限以后端校验为准）。 */
export function paidDownloadBlockedHint(): string {
  return isClientDevBuild()
    ? "开发：本机未检测到已保存的 License。请走支付发证流程，或在下方开发面板手动写入。"
    : "尚未完成付费授权。请先完成支付，系统将自动激活本设备后再下载。";
}

export function paidDownloadHeaderMissingMessage(): string {
  return isClientDevBuild()
    ? "开发调试：请求缺少有效 License，请在下方开发面板保存或通过支付链路发证。"
    : "授权未完成或已失效，请重新完成支付后再试。";
}

export function licenseRequiredFromApiMessage(): string {
  return isClientDevBuild()
    ? "服务端未收到有效 License（开发：请在面板保存或通过支付发证）。"
    : "授权无效或未生效，请完成支付后稍候再试或刷新页面。";
}

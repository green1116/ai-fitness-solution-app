/** 浏览器即将跳转至第三方收银台时抛出，调用方应静默处理（不当作失败提示） */
export class CheckoutRedirectError extends Error {
  readonly url: string;

  constructor(url: string) {
    super("CHECKOUT_REDIRECT");
    this.name = "CheckoutRedirectError";
    this.url = url;
  }
}

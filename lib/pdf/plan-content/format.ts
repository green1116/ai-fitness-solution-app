export function formatTokens(text: string, data: Record<string, any>) {
    return text.replace(/\{(\w+)\}/g, (_, key) => {
      if (data[key] === undefined) return `{${key}}`;
      return String(data[key]);
    });
  }
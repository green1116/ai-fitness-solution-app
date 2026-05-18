export function pickVariant(key: string): "A" | "B" {
  const hash = Array.from(key).reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return hash % 2 === 0 ? "A" : "B";
}

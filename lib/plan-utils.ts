// lib/plan-utils.ts
function isPlainObject(v: any) {
  return Object.prototype.toString.call(v) === "[object Object]";
}

export function deepSnakeToCamel(obj: any): any {
  if (Array.isArray(obj)) return obj.map(deepSnakeToCamel);
  if (!isPlainObject(obj)) return obj;
  const out: any = {};
  for (const key of Object.keys(obj)) {
    const camel = key.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
    out[camel] = deepSnakeToCamel(obj[key]);
  }
  return out;
}


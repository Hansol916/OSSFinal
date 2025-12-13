// 숫자로 안전하게 변환. 실패 시 defaultValue 반환
export function toNumber(value: any, defaultValue = 0): number {
  const n = Number(value);
  return isNaN(n) ? defaultValue : n;
}

// 소수점 2자리 반올림
export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

//배열을 key 값 기준으로 그룹핑
export function groupBy<T>(arr: T[], key: keyof T): Record<string, T[]> {
  return arr.reduce((result, item) => {
    const group = String(item[key]);
    if (!result[group]) result[group] = [];
    result[group].push(item);
    return result;
  }, {} as Record<string, T[]>);
}

/**
 * 객체에서 null/undefined 제거
 * Supabase 업데이트 시 null 들어가면 문제될 수 있어서 사용
 */
export function removeNulls<T extends object>(obj: T): Partial<T> {
  const newObj: Partial<T> = {};
  Object.entries(obj).forEach(([k, v]) => {
    if (v !== undefined && v !== null) newObj[k as keyof T] = v as any;
  });
  return newObj;
}

// 등수 계산 (동점 처리) -> 동점일경우 같은 index 부여
export function rankArray(values: number[]): number[] {
  const sorted = [...values].sort((a, b) => b - a);
  return values.map((v) => sorted.indexOf(v));
}

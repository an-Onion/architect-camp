export function response_avg(arr: number[]): number {
  return arr.reduce((p, c) => p + c, 0) / arr.length;
}

export function response_95(arr: number[]): number {
  arr.sort((a, b) => a - b);
  console.log(arr);
  const idx: number = (arr.length * 0.95) | 0;
  return arr[idx];
}

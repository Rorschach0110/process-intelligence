export function kg(value: number | undefined): string {
  return `${Number(value || 0).toFixed(1)} kg`;
}

export function pct(value: number | undefined): string {
  return `${Math.round(Number(value || 0) * 100)}%`;
}

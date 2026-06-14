export function getPrevIndex(current: number, total: number): number {
  if (total <= 1) return 0;
  return current === 0 ? total - 1 : current - 1;
}

export function getNextIndex(current: number, total: number): number {
  if (total <= 1) return 0;
  return current === total - 1 ? 0 : current + 1;
}

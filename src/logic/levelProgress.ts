/** Índice da próxima fase, ou null se a fase atual for a última. */
export function nextLevelIndex(current: number, levelCount: number): number | null {
  const next = current + 1;
  return next < levelCount ? next : null;
}

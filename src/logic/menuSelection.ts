/**
 * Move a seleção de um menu, dando a volta nas pontas
 * (da última opção vai para a primeira e vice-versa).
 */
export function moveSelection(current: number, delta: number, count: number): number {
  if (count <= 0) throw new Error('O menu precisa de pelo menos uma opção.');
  return (((current + delta) % count) + count) % count;
}

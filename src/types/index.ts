/** Ações do jogador. As entidades perguntam por ações, nunca por teclas. */
export type Action = 'left' | 'right' | 'jump';

/** Retângulo medido em blocos (TILE_SIZE), com origem no canto superior esquerdo. */
export interface TileRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

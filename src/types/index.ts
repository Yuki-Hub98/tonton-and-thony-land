/** Ações do jogador. As entidades e menus perguntam por ações, nunca por teclas. */
export type Action = 'left' | 'right' | 'jump' | 'confirm';

/** Retângulo medido em blocos (TILE_SIZE), com origem no canto superior esquerdo. */
export interface TileRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

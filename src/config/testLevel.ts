import type { TileRect } from '../types';

// Fase de teste da Etapa 1, desenhada em código. Na Etapa 4 ela é substituída
// pelas fases do Tiled. Todas as medidas estão em blocos (TILE_SIZE).

export interface TestLevelDef {
  /** Largura e altura do mundo, em blocos. */
  width: number;
  height: number;
  /** Onde o jogador nasce (pés no bloco indicado). */
  spawn: { x: number; y: number };
  platforms: TileRect[];
}

export const TEST_LEVEL: TestLevelDef = {
  width: 150,
  height: 17,
  spawn: { x: 3, y: 15 },
  platforms: [
    // Chão em toda a largura (2 blocos de altura).
    { x: 0, y: 15, width: 150, height: 2 },
    // Degraus baixos para aprender a pular.
    { x: 14, y: 13, width: 2, height: 2 },
    { x: 20, y: 12, width: 2, height: 3 },
    // Plataformas suspensas.
    { x: 28, y: 11, width: 5, height: 1 },
    { x: 36, y: 9, width: 5, height: 1 },
    { x: 44, y: 11, width: 4, height: 1 },
    // Escada de plataformas.
    { x: 56, y: 12, width: 3, height: 1 },
    { x: 61, y: 10, width: 3, height: 1 },
    { x: 66, y: 8, width: 3, height: 1 },
    { x: 71, y: 10, width: 6, height: 1 },
    // Muro que pede pulo alto (segurar o botão).
    { x: 84, y: 11, width: 2, height: 4 },
    { x: 95, y: 12, width: 8, height: 1 },
    { x: 108, y: 13, width: 2, height: 2 },
    { x: 112, y: 11, width: 2, height: 4 },
    { x: 125, y: 10, width: 6, height: 1 },
  ],
};

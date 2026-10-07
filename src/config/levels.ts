// Lista e ordem das fases. Para adicionar uma fase: desenhe no Tiled,
// exporte para public/assets/levels/ e acrescente uma linha aqui.

import type { BackgroundId } from './backgrounds';

export interface LevelDef {
  /** Chave do mapa no cache do Phaser. */
  key: string;
  /** Caminho relativo a public/. */
  path: string;
  /** Nome exibido na tela de fim de fase. */
  name: string;
  /** Fundo com parallax (ver backgrounds.ts). */
  background: BackgroundId;
}

export const LEVELS: readonly LevelDef[] = [
  { key: 'level-1', path: 'assets/levels/level-1.json', name: 'Fase 1', background: 'meadow' },
  { key: 'level-2', path: 'assets/levels/level-2.json', name: 'Fase 2', background: 'forest' },
  { key: 'level-3', path: 'assets/levels/level-3.json', name: 'Fase 3', background: 'night' },
];

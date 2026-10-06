// Lista e ordem das fases. Para adicionar uma fase: desenhe no Tiled,
// exporte para public/assets/levels/ e acrescente uma linha aqui.

export interface LevelDef {
  /** Chave do mapa no cache do Phaser. */
  key: string;
  /** Caminho relativo a public/. */
  path: string;
  /** Nome exibido na tela de fim de fase. */
  name: string;
}

export const LEVELS: readonly LevelDef[] = [
  { key: 'level-1', path: 'assets/levels/level-1.json', name: 'Fase 1' },
  { key: 'level-2', path: 'assets/levels/level-2.json', name: 'Fase 2' },
  { key: 'level-3', path: 'assets/levels/level-3.json', name: 'Fase 3' },
];

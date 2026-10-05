// Chaves usadas pelo Phaser para achar cenas e texturas. Nada de string solta no código.

export const SceneKeys = {
  Boot: 'boot',
  Preload: 'preload',
  Title: 'title',
  Select: 'select',
  Game: 'game',
  LevelComplete: 'level-complete',
} as const;

export const TextureKeys = {
  Body: 'body',
  Flag: 'flag',
  Tileset: 'tileset',
} as const;

export type TextureKey = (typeof TextureKeys)[keyof typeof TextureKeys];

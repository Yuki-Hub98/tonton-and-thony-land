// Chaves usadas pelo Phaser para achar cenas e texturas. Nada de string solta no código.

export const SceneKeys = {
  Boot: 'boot',
  Preload: 'preload',
  Game: 'game',
} as const;

export const TextureKeys = {
  Body: 'body',
  Flag: 'flag',
  Ground: 'ground',
} as const;

export type TextureKey = (typeof TextureKeys)[keyof typeof TextureKeys];

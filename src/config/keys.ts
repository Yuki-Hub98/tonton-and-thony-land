// Chaves usadas pelo Phaser para achar cenas e texturas. Nada de string solta no código.

export const SceneKeys = {
  Boot: 'boot',
  Preload: 'preload',
} as const;

export const TextureKeys = {
  Body: 'body',
  Flag: 'flag',
} as const;

export type TextureKey = (typeof TextureKeys)[keyof typeof TextureKeys];

// Chaves usadas pelo Phaser para achar cenas e texturas. Nada de string solta no código.

export const SceneKeys = {
  Boot: 'boot',
  Preload: 'preload',
  Title: 'title',
  Select: 'select',
  Game: 'game',
  LevelComplete: 'level-complete',
  HUD: 'hud',
  GameOver: 'game-over',
} as const;

export const TextureKeys = {
  Body: 'body',
  Flag: 'flag',
  Tileset: 'tileset',
  Enemy: 'enemy',
  Checkpoint: 'checkpoint',
  CheckpointActive: 'checkpoint-active',
} as const;

export type TextureKey = (typeof TextureKeys)[keyof typeof TextureKeys];

/** Eventos globais (this.game.events) usados para as cenas conversarem sem se conhecer. */
export const EventKeys = {
  /** Mudou o número de vidas. Valor: vidas restantes. */
  LivesChanged: 'lives:changed',
} as const;

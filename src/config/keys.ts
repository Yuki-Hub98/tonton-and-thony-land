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
  Broom: 'broom',
  Shovel: 'shovel',
} as const;

export type TextureKey = (typeof TextureKeys)[keyof typeof TextureKeys];

/** Eventos globais (this.game.events) usados para as cenas conversarem sem se conhecer. */
export const EventKeys = {
  /** Mudou o número de vidas. Valor: vidas restantes. */
  LivesChanged: 'lives:changed',
  /** Pegou (true) ou perdeu (false) o equipamento. */
  PlayerEquipped: 'player:equipped',
} as const;

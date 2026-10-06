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
  Continue: 'continue',
  Victory: 'victory',
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
  Car: 'car',
  TitleBackground: 'title-background',
} as const;

export type TextureKey = (typeof TextureKeys)[keyof typeof TextureKeys];

/** Dados guardados no registry (this.registry), compartilhado por todas as cenas. */
export const RegistryKeys = {
  /** Chaves de textura que não tinham arquivo e viraram placeholder. Valor: string[]. */
  MissingArt: 'missing-art',
} as const;

/** Eventos globais (this.game.events) usados para as cenas conversarem sem se conhecer. */
export const EventKeys = {
  /** Mudou o número de vidas. Valor: vidas restantes. */
  LivesChanged: 'lives:changed',
  /** Pegou (true) ou perdeu (false) o equipamento. */
  PlayerEquipped: 'player:equipped',
} as const;

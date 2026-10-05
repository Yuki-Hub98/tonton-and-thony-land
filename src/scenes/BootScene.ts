import Phaser from 'phaser';
import { SceneKeys } from '../config/keys';

/**
 * Primeira cena. Fica com o mínimo necessário antes de carregar os assets
 * e passa a vez para a PreloadScene.
 */
export class BootScene extends Phaser.Scene {
  constructor() {
    super(SceneKeys.Boot);
  }

  create(): void {
    this.scene.start(SceneKeys.Preload);
  }
}

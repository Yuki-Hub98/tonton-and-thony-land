import Phaser from 'phaser';
import { TextureKeys } from '../config/keys';
import type { LevelObject } from '../logic/levelSchema';

/** Bandeira do fim da fase: ocupa o retângulo desenhado no Tiled e não se move. */
export class Flag extends Phaser.Physics.Arcade.Image {
  constructor(scene: Phaser.Scene, area: LevelObject) {
    super(scene, area.x + area.width / 2, area.y + area.height, TextureKeys.Flag);
    scene.add.existing(this);
    this.setOrigin(0.5, 1).setDisplaySize(area.width, area.height);
    // true = corpo estático (não cai nem é empurrado), só detecta quem encosta.
    scene.physics.add.existing(this, true);
  }
}

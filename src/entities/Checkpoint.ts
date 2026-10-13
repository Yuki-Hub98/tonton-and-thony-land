import Phaser from 'phaser';
import { TextureKeys } from '../config/keys';
import { bottomCenter, type LevelObject } from '../logic/levelSchema';
import type { Point } from '../logic/respawnPoint';

/** Ponto de controle: depois de tocado, o jogador volta aqui quando morre. */
export class Checkpoint extends Phaser.Physics.Arcade.Image {
  /** Onde os pés do jogador ficam ao voltar. */
  readonly respawnPoint: Point;
  // "active" já existe em todo GameObject do Phaser (liga/desliga o update), por isso outro nome.
  private activated = false;

  constructor(scene: Phaser.Scene, area: LevelObject) {
    const feet = bottomCenter(area);
    super(scene, feet.x, feet.y, TextureKeys.Checkpoint);
    this.respawnPoint = feet;
    scene.add.existing(this);
    this.setOrigin(0.5, 1).setDisplaySize(area.width, area.height);
    scene.physics.add.existing(this, true);
  }

  get isActivated(): boolean {
    return this.activated;
  }

  /** Acende o checkpoint (troca a cor). Chamar mais de uma vez não faz nada. */
  activate(): void {
    if (this.activated) return;
    this.activated = true;
    const { displayWidth, displayHeight } = this;
    this.setTexture(TextureKeys.CheckpointActive).setDisplaySize(displayWidth, displayHeight);
  }
}

import Phaser from 'phaser';
import {
  PICKUP_BOB_HEIGHT,
  PICKUP_BOB_MS,
  PICKUP_COLLECT_MS,
  PICKUP_COLLECT_RISE,
} from '../config/constants';
import { bottomCenter, type LevelObject } from '../logic/levelSchema';

/**
 * Base dos itens coletáveis: fica parado no ponto do Tiled, balançando para cima e para baixo
 * para chamar a atenção, e some subindo quando o jogador pega.
 */
export class Pickup extends Phaser.Physics.Arcade.Image {
  declare body: Phaser.Physics.Arcade.StaticBody;

  private collected = false;

  constructor(scene: Phaser.Scene, area: LevelObject, texture: string) {
    const feet = bottomCenter(area);
    super(scene, feet.x, feet.y, texture);
    scene.add.existing(this);
    this.setOrigin(0.5, 1);
    // Corpo estático: não cai, só detecta quem encosta. O balanço é só visual (o corpo fica parado).
    scene.physics.add.existing(this, true);

    scene.tweens.add({
      targets: this,
      y: feet.y - PICKUP_BOB_HEIGHT,
      duration: PICKUP_BOB_MS,
      yoyo: true,
      repeat: -1,
      ease: Phaser.Math.Easing.Sine.InOut,
    });
    // O balanço repete para sempre: se o item for destruído (ex.: no respawn), a tween para junto.
    this.once(Phaser.GameObjects.Events.DESTROY, () => scene.tweens.killTweensOf(this));
  }

  get isCollected(): boolean {
    return this.collected;
  }

  /** Foi pego: desliga a física e some subindo. Chamar mais de uma vez não faz nada. */
  collect(): void {
    if (this.collected) return;
    this.collected = true;
    this.body.enable = false;
    this.scene.tweens.killTweensOf(this);
    this.scene.tweens.add({
      targets: this,
      y: this.y - PICKUP_COLLECT_RISE,
      alpha: 0,
      duration: PICKUP_COLLECT_MS,
      onComplete: () => this.destroy(),
    });
  }
}

import Phaser from 'phaser';
import { ENEMY_SPEED, ENEMY_SQUASH_MS } from '../config/constants';
import { TextureKeys } from '../config/keys';
import { hasFallenOut } from '../logic/collisionRules';
import { nextPatrolDirection, type Direction } from '../logic/enemyPatrol';

/**
 * Inimigo básico: anda para um lado e vira ao bater na parede ou chegar na beirada.
 * Pisar em cima derrota; encostar de lado machuca o jogador.
 */
export class Enemy extends Phaser.Physics.Arcade.Sprite {
  declare body: Phaser.Physics.Arcade.Body;

  private direction: Direction = -1;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    private readonly ground: Phaser.Tilemaps.TilemapLayer,
  ) {
    super(scene, x, y, TextureKeys.Enemy);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    // Origem nos pés, como o jogador: o ponto do Tiled é onde ele pisa.
    this.setOrigin(0.5, 1);
  }

  /** Chamado a cada frame pelo grupo de inimigos (runChildUpdate). */
  override update(): void {
    if (!this.body.enable) return;
    if (hasFallenOut(this.body.top, this.scene.physics.world.bounds.bottom)) {
      this.destroy();
      return;
    }

    this.direction = nextPatrolDirection(this.direction, {
      blockedLeft: this.body.blocked.left,
      blockedRight: this.body.blocked.right,
      onGround: this.body.blocked.down,
      groundAhead: this.hasGroundAhead(),
    });
    this.setVelocityX(this.direction * ENEMY_SPEED);
    // A arte olha para a esquerda; espelha quando anda para a direita.
    this.setFlipX(this.direction > 0);
  }

  /** Foi pisado: desliga a física, achata e some. */
  squash(): void {
    this.body.enable = false;
    this.scene.tweens.add({
      targets: this,
      scaleY: 0.3,
      duration: ENEMY_SQUASH_MS,
      onComplete: () => this.destroy(),
    });
  }

  /** Olha o tile logo à frente do pé: se não for sólido, é uma beirada. */
  private hasGroundAhead(): boolean {
    const frontX = this.direction > 0 ? this.body.right + 1 : this.body.left - 1;
    const tile = this.ground.getTileAtWorldXY(frontX, this.body.bottom + 1);
    return tile?.collides ?? false;
  }
}

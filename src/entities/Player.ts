import Phaser from 'phaser';
import { JUMP_CUT_FACTOR, PLAYER_JUMP_VELOCITY, PLAYER_SPEED } from '../config/constants';
import { TextureKeys } from '../config/keys';
import { canJump, cutJumpVelocity, horizontalVelocity } from '../logic/movement';
import type { InputManager } from '../systems/InputManager';

/**
 * Jogador da Etapa 1: um retângulo com física arcade.
 * Na Etapa 2 ganha cabeça (fotos) em cima do corpo.
 */
export class Player extends Phaser.Physics.Arcade.Sprite {
  declare body: Phaser.Physics.Arcade.Body;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, TextureKeys.Body);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Origem nos pés: facilita posicionar o jogador em cima de um bloco.
    this.setOrigin(0.5, 1);
    this.setCollideWorldBounds(true);
  }

  /** Lê o input e aplica velocidade. Chamado pela cena a cada frame. */
  updateMovement(input: InputManager): void {
    const velocityX = horizontalVelocity(
      { left: input.isDown('left'), right: input.isDown('right') },
      PLAYER_SPEED,
    );
    this.setVelocityX(velocityX);
    if (velocityX !== 0) this.setFlipX(velocityX < 0);

    const onGround = this.body.blocked.down;
    if (canJump(input.justPressed('jump'), onGround)) {
      this.setVelocityY(PLAYER_JUMP_VELOCITY);
    }
    this.setVelocityY(
      cutJumpVelocity(this.body.velocity.y, input.justReleased('jump'), JUMP_CUT_FACTOR),
    );
  }
}

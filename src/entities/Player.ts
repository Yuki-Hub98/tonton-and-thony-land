import Phaser from 'phaser';
import type { CharacterDef } from '../config/characters';
import {
  HEAD_OVERLAP_Y,
  JUMP_CUT_FACTOR,
  PLAYER_JUMP_VELOCITY,
  PLAYER_SPEED,
} from '../config/constants';
import { TextureKeys } from '../config/keys';
import { HeadController } from '../components/HeadController';
import { canJump, cutJumpVelocity, horizontalVelocity } from '../logic/movement';
import type { InputManager } from '../systems/InputManager';

/**
 * Jogador: o sprite do corpo tem a física (o hitbox é só o corpo)
 * e a cabeça é uma imagem separada que segue o corpo a cada frame.
 */
export class Player extends Phaser.Physics.Arcade.Sprite {
  declare body: Phaser.Physics.Arcade.Body;

  private readonly head: Phaser.GameObjects.Image;
  private readonly headController: HeadController;

  constructor(scene: Phaser.Scene, x: number, y: number, character: CharacterDef) {
    super(scene, x, y, TextureKeys.Body);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Origem nos pés: facilita posicionar o jogador em cima de um bloco.
    this.setOrigin(0.5, 1);
    this.setCollideWorldBounds(true);

    // Origem da cabeça no queixo, para encaixar no topo do corpo.
    this.head = scene.add
      .image(x, y, character.heads.idle[0] ?? TextureKeys.Body)
      .setOrigin(0.5, 1);
    this.headController = new HeadController(this.head, character.heads, scene.time.now);
    this.syncHead();

    // POST_UPDATE roda depois de a física mover o corpo: a cabeça acompanha sem atraso de 1 frame.
    scene.events.on(Phaser.Scenes.Events.POST_UPDATE, this.syncHead, this);
    this.once(Phaser.GameObjects.Events.DESTROY, () => {
      scene.events.off(Phaser.Scenes.Events.POST_UPDATE, this.syncHead, this);
      this.head.destroy();
    });
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

  /** Atualiza a foto da cabeça (slide idle, feliz, triste). */
  updateHead(time: number): void {
    this.headController.update(time);
  }

  private syncHead(): void {
    this.head.setPosition(this.x, this.y - this.displayHeight + HEAD_OVERLAP_Y);
    this.head.setFlipX(this.flipX);
  }
}

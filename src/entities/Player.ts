import Phaser from 'phaser';
import type { CharacterDef } from '../config/characters';
import {
  CAR_HEAD_OFFSET_X,
  CAR_HEAD_OVERLAP_Y,
  CAR_SPEED,
  DEATH_JUMP_VELOCITY,
  HAND_HEIGHT_RATIO,
  HAND_ITEM_HEIGHT,
  HAND_ITEM_REST_ANGLE,
  HAND_ITEM_SWING_ANGLE,
  HAND_ITEM_SWING_MS,
  HEAD_OVERLAP_Y,
  JUMP_CUT_FACTOR,
  PLAYER_JUMP_VELOCITY,
  PLAYER_SPEED,
  STOMP_BOUNCE_VELOCITY,
} from '../config/constants';
import { TextureKeys } from '../config/keys';
import { HeadController } from '../components/HeadController';
import { shouldAutoJump } from '../logic/autoDrive';
import type { Direction } from '../logic/enemyPatrol';
import { canJump, cutJumpVelocity, horizontalVelocity } from '../logic/movement';
import type { Point } from '../logic/respawnPoint';
import type { InputManager } from '../systems/InputManager';

/** Item segurado: a mão da frente fica na frente do corpo; a de trás, atrás. */
interface HandItem {
  image: Phaser.GameObjects.Image;
  front: boolean;
}

/**
 * Jogador: o sprite do corpo tem a física (o hitbox é só o corpo).
 * A cabeça e os itens na mão são imagens separadas que seguem o corpo a cada frame.
 * Ao pegar o carro, o mesmo sprite troca de textura e vira o carrinho, com a cabeça dentro.
 */
export class Player extends Phaser.Physics.Arcade.Sprite {
  declare body: Phaser.Physics.Arcade.Body;

  private readonly head: Phaser.GameObjects.Image;
  private readonly headController: HeadController;
  private readonly handItems: HandItem[];
  private swinging = false;
  private inCar = false;

  constructor(scene: Phaser.Scene, x: number, y: number, character: CharacterDef) {
    super(scene, x, y, TextureKeys.Body);

    // Quem é adicionado antes é desenhado antes (fica atrás): item de trás, corpo, cabeça, item da frente.
    const [frontTexture, ...backTextures] = character.equipment.textures;
    const backItems = backTextures.map((texture) => this.createHandItem(texture, false));
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

    const frontItems = frontTexture === undefined ? [] : [this.createHandItem(frontTexture, true)];
    this.handItems = [...backItems, ...frontItems];
    this.syncAttachments();

    // POST_UPDATE roda depois de a física mover o corpo: cabeça e itens acompanham sem atraso.
    scene.events.on(Phaser.Scenes.Events.POST_UPDATE, this.syncAttachments, this);
    this.once(Phaser.GameObjects.Events.DESTROY, () => {
      scene.events.off(Phaser.Scenes.Events.POST_UPDATE, this.syncAttachments, this);
      this.head.destroy();
      for (const item of this.handItems) item.image.destroy();
    });
  }

  /** Para onde o jogador está olhando: 1 direita, -1 esquerda. */
  get facing(): Direction {
    return this.flipX ? -1 : 1;
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

  /** Pegou o equipamento: aparece na mão e a cabeça fica feliz. */
  equip(now: number): void {
    this.setItemsVisible(true);
    this.headController.notify('pickedItem', now);
  }

  /** Levou dano armado: o equipamento some e a cabeça fica triste por um tempo. */
  loseEquipment(now: number): void {
    this.setItemsVisible(false);
    this.headController.notify('damaged', now);
  }

  /** Animação do golpe: os itens giram para a frente e voltam. */
  swing(): void {
    if (this.swinging) return;
    this.swinging = true;
    this.scene.tweens.add({
      targets: this.handItems.map((item) => item.image),
      // Mesmo sentido do ângulo parado: a ponta varre para a frente.
      angle: -this.facing * HAND_ITEM_SWING_ANGLE,
      duration: HAND_ITEM_SWING_MS,
      yoyo: true,
      onComplete: () => {
        this.swinging = false;
      },
    });
  }

  /** Pegou o carro: o corpo vira carrinho, os itens somem e a cabeça fica feliz. */
  becomeCar(now: number): void {
    this.inCar = true;
    this.setItemsVisible(false);
    this.setAlpha(1);
    this.setFlipX(false);
    this.setTexture(TextureKeys.Car);
    // Sem argumentos, o hitbox passa a ter o tamanho da nova textura (o carro é mais largo e baixo).
    this.body.setSize();
    this.headController.notify('pickedItem', now);
  }

  /** Ponto logo à frente do para-choque, embaixo das rodas: onde a cena procura chão. */
  get groundProbe(): Point {
    return { x: this.body.right + 1, y: this.body.bottom + 1 };
  }

  /** Dirige sozinho para a direita, pulando paredes e buracos. Chamado a cada frame no carro. */
  drive(groundAhead: boolean): void {
    this.setVelocityX(CAR_SPEED);
    const jump = shouldAutoJump({
      onGround: this.body.blocked.down,
      blockedAhead: this.body.blocked.right,
      groundAhead,
    });
    if (jump) this.setVelocityY(PLAYER_JUMP_VELOCITY);
  }

  /** Pulinho depois de pisar num inimigo. */
  bounce(): void {
    this.setVelocityY(STOMP_BOUNCE_VELOCITY);
  }

  /** Visível ou apagado (pisca-pisca da invencibilidade). Cabeça e itens copiam no sync. */
  setBlinkVisible(visible: boolean): void {
    this.setAlpha(visible ? 1 : 0.25);
  }

  /**
   * Morte estilo Mario: cara triste, pulinho e cai atravessando o chão.
   * Se caiu no buraco, só continua caindo. O equipamento é perdido.
   */
  die(fell: boolean, now: number): void {
    this.headController.notify('died', now);
    this.setItemsVisible(false);
    this.setAlpha(1);
    // Sem colisão: atravessa o chão e não encosta mais em inimigos nem na bandeira.
    this.body.checkCollision.none = true;
    this.setVelocityX(0);
    if (!fell) this.setVelocityY(DEATH_JUMP_VELOCITY);
  }

  /** Volta à fase em pé no ponto indicado (início ou checkpoint). */
  respawnAt(point: Point, now: number): void {
    this.body.checkCollision.none = false;
    this.body.reset(point.x, point.y);
    this.headController.notify('respawned', now);
  }

  private createHandItem(texture: string, front: boolean): HandItem {
    const image = this.scene.add
      .image(this.x, this.y, texture)
      // Segura perto da ponta de cima do cabo; a vassoura/pá fica pendurada para baixo.
      .setOrigin(0.5, 0.15)
      .setVisible(false);
    // Arte de qualquer tamanho aparece com a mesma altura, sem distorcer.
    image.setScale(HAND_ITEM_HEIGHT / image.height);
    return { image, front };
  }

  private setItemsVisible(visible: boolean): void {
    for (const item of this.handItems) item.image.setVisible(visible);
  }

  private syncAttachments(): void {
    // No carro, a cabeça afunda no banco do motorista, um pouco para trás.
    const headOverlap = this.inCar ? CAR_HEAD_OVERLAP_Y : HEAD_OVERLAP_Y;
    const headOffsetX = this.inCar ? CAR_HEAD_OFFSET_X : 0;
    this.head.setPosition(this.x + headOffsetX, this.y - this.displayHeight + headOverlap);
    this.head.setFlipX(this.flipX);
    this.head.setAlpha(this.alpha);

    const facing = this.facing;
    const handY = this.y - this.displayHeight * HAND_HEIGHT_RATIO;
    for (const { image, front } of this.handItems) {
      // Mão da frente no lado para onde olha; mão de trás no outro lado.
      const side = front ? facing : -facing;
      image.setPosition(this.x + (side * this.displayWidth) / 2, handY);
      image.setFlipX(this.flipX);
      image.setAlpha(this.alpha);
      // Parado, a ponta vai um pouco para a frente (ângulo negativo gira para a esquerda).
      if (!this.swinging) image.setAngle(-facing * HAND_ITEM_REST_ANGLE);
    }
  }
}

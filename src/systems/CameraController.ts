import type Phaser from 'phaser';
import { minPlayerX, nextCameraScrollX } from '../logic/forwardCamera';

/** Câmera que só anda para a frente e funciona como parede na borda esquerda da tela. */
export class CameraController {
  constructor(
    private readonly camera: Phaser.Cameras.Scene2D.Camera,
    private readonly worldWidth: number,
    private readonly leadRatio: number,
  ) {}

  /**
   * Reposiciona a câmera para mostrar o ponto x (ex.: respawn no início ou no checkpoint).
   * É o único momento em que a câmera pode voltar para trás.
   */
  snapTo(x: number): void {
    this.camera.scrollX = nextCameraScrollX({
      currentScrollX: 0,
      targetX: x,
      viewportWidth: this.camera.width,
      worldWidth: this.worldWidth,
      leadRatio: this.leadRatio,
    });
  }

  /** Chamar a cada frame, depois de o jogador se mover. */
  update(player: Phaser.Physics.Arcade.Sprite): void {
    this.camera.scrollX = nextCameraScrollX({
      currentScrollX: this.camera.scrollX,
      targetX: player.x,
      viewportWidth: this.camera.width,
      worldWidth: this.worldWidth,
      leadRatio: this.leadRatio,
    });

    const minX = minPlayerX(this.camera.scrollX, player.displayWidth / 2);
    const body = player.body as Phaser.Physics.Arcade.Body;
    if (player.x < minX) {
      player.x = minX;
      body.updateFromGameObject();
      body.setVelocityX(Math.max(0, body.velocity.x));
    }
  }
}

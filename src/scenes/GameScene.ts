import Phaser from 'phaser';
import { CAMERA_LEAD_RATIO, TILE_SIZE } from '../config/constants';
import { SceneKeys, TextureKeys } from '../config/keys';
import { TEST_LEVEL } from '../config/testLevel';
import { Player } from '../entities/Player';
import { CameraController } from '../systems/CameraController';
import { InputManager } from '../systems/InputManager';

/** A fase em si. Na Etapa 1 monta a fase de teste desenhada em código. */
export class GameScene extends Phaser.Scene {
  private player!: Player;
  private inputManager!: InputManager;
  private cameraController!: CameraController;

  constructor() {
    super(SceneKeys.Game);
  }

  create(): void {
    const worldWidth = TEST_LEVEL.width * TILE_SIZE;
    const worldHeight = TEST_LEVEL.height * TILE_SIZE;
    this.physics.world.setBounds(0, 0, worldWidth, worldHeight);

    const platforms = this.createPlatforms();

    this.player = new Player(
      this,
      (TEST_LEVEL.spawn.x + 0.5) * TILE_SIZE,
      TEST_LEVEL.spawn.y * TILE_SIZE,
    );
    this.physics.add.collider(this.player, platforms);

    this.inputManager = new InputManager(this);
    this.cameraController = new CameraController(this.cameras.main, worldWidth, CAMERA_LEAD_RATIO);
  }

  /** Roda a cada frame (o "game loop"). */
  update(): void {
    this.player.updateMovement(this.inputManager);
    this.cameraController.update(this.player);
  }

  private createPlatforms(): Phaser.Physics.Arcade.StaticGroup {
    const platforms = this.physics.add.staticGroup();
    for (const rect of TEST_LEVEL.platforms) {
      // TileSprite repete a textura do bloco para preencher o retângulo inteiro.
      const tiles = this.add
        .tileSprite(
          rect.x * TILE_SIZE,
          rect.y * TILE_SIZE,
          rect.width * TILE_SIZE,
          rect.height * TILE_SIZE,
          TextureKeys.Ground,
        )
        .setOrigin(0);
      platforms.add(tiles);
    }
    return platforms;
  }
}

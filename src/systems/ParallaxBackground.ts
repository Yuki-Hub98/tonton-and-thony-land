import Phaser from 'phaser';
import { backgroundLayerKey, celestialKey, type BackgroundDef } from '../config/backgrounds';
import { BACKGROUND_DEPTH, BACKGROUND_TEXTURE_HEIGHT } from '../config/constants';
import { layerTilePositionX, layerTileScale, nextDrift } from '../logic/parallax';

interface ActiveLayer {
  sprite: Phaser.GameObjects.TileSprite;
  scrollFactor: number;
  windSpeed: number;
  /** Quanto o vento já empurrou, em pixels da tela. */
  drift: number;
  textureWidth: number;
  textureHeight: number;
  tileScale: number;
}

/**
 * Fundo em camadas com parallax.
 * Cada camada é um TileSprite do tamanho da tela, preso nela (scrollFactor 0): quem anda é a
 * textura dentro dele, mais devagar nas camadas distantes. Camada sem imagem é pulada.
 *
 * Uso na GameScene: criar no create() e chamar update(delta) a cada frame.
 */
export class ParallaxBackground {
  private readonly layers: ActiveLayer[] = [];
  private celestial?: Phaser.GameObjects.Image;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly background: BackgroundDef,
  ) {
    const { width, height } = scene.scale;

    background.layers.forEach((layer, index) => {
      const key = backgroundLayerKey(background.id, layer.name);
      if (!scene.textures.exists(key)) return;

      const source = scene.textures.get(key).getSourceImage();
      const tileScale = layerTileScale(height, source.height);
      const sprite = scene.add
        .tileSprite(0, 0, width, height, key)
        .setOrigin(0, 0)
        .setScrollFactor(0)
        .setDepth(BACKGROUND_DEPTH + index * 2)
        .setTileScale(tileScale, tileScale);
      this.layers.push({
        sprite,
        scrollFactor: layer.scrollFactor,
        windSpeed: layer.windSpeed,
        drift: 0,
        textureWidth: source.width,
        textureHeight: source.height,
        tileScale,
      });
    });

    const key = celestialKey(background.id);
    if (scene.textures.exists(key)) {
      // Entre o céu (BACKGROUND_DEPTH) e as nuvens (BACKGROUND_DEPTH + 2).
      this.celestial = scene.add
        .image(0, 0, key)
        .setScrollFactor(0)
        .setDepth(BACKGROUND_DEPTH + 1);
      this.placeCelestial(width, height);
    }

    // A largura do jogo muda ao girar o celular ou redimensionar a janela (ver main.ts).
    scene.scale.on(Phaser.Scale.Events.RESIZE, this.resize, this);
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      scene.scale.off(Phaser.Scale.Events.RESIZE, this.resize, this);
    });
  }

  /** Chamar a cada frame, depois de a câmera se mover. */
  update(deltaMs: number): void {
    const { scrollX } = this.scene.cameras.main;
    for (const layer of this.layers) {
      layer.drift = nextDrift(
        layer.drift,
        layer.windSpeed,
        deltaMs,
        layer.textureWidth * layer.tileScale,
      );
      layer.sprite.tilePositionX = layerTilePositionX(
        scrollX,
        layer.scrollFactor,
        layer.drift,
        layer.tileScale,
      );
    }
  }

  private resize(gameSize: Phaser.Structs.Size): void {
    const { width, height } = gameSize;
    for (const layer of this.layers) {
      layer.tileScale = layerTileScale(height, layer.textureHeight);
      layer.sprite.setSize(width, height).setTileScale(layer.tileScale, layer.tileScale);
    }
    this.placeCelestial(width, height);
  }

  private placeCelestial(width: number, height: number): void {
    const { x, y } = this.background.celestial;
    this.celestial
      ?.setPosition(width * x, height * y)
      .setScale(layerTileScale(height, BACKGROUND_TEXTURE_HEIGHT));
  }
}

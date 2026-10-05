import Phaser from 'phaser';
import { IMAGE_ASSETS, type FaceSpec, type PlaceholderSpec } from '../config/assets';
import {
  GAME_HEIGHT,
  GAME_WIDTH,
  PRELOAD_BAR_HEIGHT,
  PRELOAD_BAR_WIDTH,
} from '../config/constants';
import { SceneKeys } from '../config/keys';
import { LEVELS } from '../config/levels';

/**
 * Carrega todos os assets mostrando uma barra de progresso.
 * Imagem que não existir (ou falhar) vira um placeholder colorido com a mesma chave,
 * então o jogo roda mesmo sem nenhuma arte real.
 */
export class PreloadScene extends Phaser.Scene {
  constructor() {
    super(SceneKeys.Preload);
  }

  preload(): void {
    this.createProgressBar();

    // Prefixa todo caminho com o base do Vite (/tonton-and-thony-land/ no GitHub Pages).
    this.load.setBaseURL(import.meta.env.BASE_URL);
    for (const asset of IMAGE_ASSETS) {
      this.load.image(asset.key, asset.path);
    }
    for (const level of LEVELS) {
      this.load.tilemapTiledJSON(level.key, level.path);
    }
  }

  create(): void {
    for (const asset of IMAGE_ASSETS) {
      if (!this.textures.exists(asset.key)) {
        this.generatePlaceholder(asset.key, asset.placeholder);
      }
    }

    this.scene.start(SceneKeys.Title);
  }

  private createProgressBar(): void {
    const x = (GAME_WIDTH - PRELOAD_BAR_WIDTH) / 2;
    const y = (GAME_HEIGHT - PRELOAD_BAR_HEIGHT) / 2;

    this.add
      .rectangle(x, y, PRELOAD_BAR_WIDTH, PRELOAD_BAR_HEIGHT)
      .setOrigin(0)
      .setStrokeStyle(2, 0xffffff);
    const fill = this.add.rectangle(x, y, 0, PRELOAD_BAR_HEIGHT, 0xffffff).setOrigin(0);

    // value vai de 0 a 1 conforme os arquivos terminam de carregar.
    this.load.on(Phaser.Loader.Events.PROGRESS, (value: number) => {
      fill.width = PRELOAD_BAR_WIDTH * value;
    });
  }

  private generatePlaceholder(key: string, spec: PlaceholderSpec): void {
    const { width, height, color, face, tiles } = spec;
    const graphics = this.add.graphics();
    if (face) {
      this.drawFace(graphics, width, color, face);
    } else if (tiles) {
      tiles.forEach((tileColor, i) => {
        graphics.fillStyle(tileColor);
        graphics.fillRect(i * height, 0, height, height);
      });
    } else {
      graphics.fillStyle(color);
      graphics.fillRect(0, 0, width, height);
      graphics.lineStyle(2, 0x000000);
      graphics.strokeRect(0, 0, width, height);
    }
    // Desenha os Graphics numa textura com a chave pedida e descarta o desenho.
    graphics.generateTexture(key, width, height);
    graphics.destroy();
  }

  /** Rostinho redondo usado no lugar das fotos. As medidas são proporções do tamanho. */
  private drawFace(
    graphics: Phaser.GameObjects.Graphics,
    size: number,
    color: number,
    { expression, lookX }: FaceSpec,
  ): void {
    const center = size / 2;
    const eyeY = size * 0.42;
    const eyeOffsetX = size * 0.15;
    const pupilShift = lookX * size * 0.06;

    graphics.fillStyle(color);
    graphics.fillCircle(center, center, center - 2);
    graphics.lineStyle(2, 0x000000);
    graphics.strokeCircle(center, center, center - 2);

    graphics.fillStyle(0x000000);
    graphics.fillCircle(center - eyeOffsetX + pupilShift, eyeY, size * 0.06);
    graphics.fillCircle(center + eyeOffsetX + pupilShift, eyeY, size * 0.06);

    graphics.lineStyle(3, 0x000000);
    graphics.beginPath();
    if (expression === 'happy') {
      graphics.arc(center, size * 0.56, size * 0.2, 0.15 * Math.PI, 0.85 * Math.PI);
    } else if (expression === 'sad') {
      graphics.arc(center, size * 0.84, size * 0.18, 1.2 * Math.PI, 1.8 * Math.PI);
    } else {
      graphics.moveTo(center - size * 0.12, size * 0.7);
      graphics.lineTo(center + size * 0.12, size * 0.7);
    }
    graphics.strokePath();

    if (expression === 'sad') {
      // Lágrima embaixo do olho.
      graphics.fillStyle(0x29adff);
      graphics.fillCircle(center + eyeOffsetX, eyeY + size * 0.14, size * 0.05);
    }
  }
}

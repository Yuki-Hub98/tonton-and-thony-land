import Phaser from 'phaser';
import { IMAGE_ASSETS, type PlaceholderSpec } from '../config/assets';
import {
  GAME_HEIGHT,
  GAME_WIDTH,
  PRELOAD_BAR_HEIGHT,
  PRELOAD_BAR_WIDTH,
} from '../config/constants';
import { SceneKeys } from '../config/keys';

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
  }

  create(): void {
    for (const asset of IMAGE_ASSETS) {
      if (!this.textures.exists(asset.key)) {
        this.generatePlaceholder(asset.key, asset.placeholder);
      }
    }

    this.scene.start(SceneKeys.Game);
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

  private generatePlaceholder(key: string, { width, height, color }: PlaceholderSpec): void {
    const graphics = this.add.graphics();
    graphics.fillStyle(color);
    graphics.fillRect(0, 0, width, height);
    graphics.lineStyle(2, 0x000000);
    graphics.strokeRect(0, 0, width, height);
    // Desenha os Graphics numa textura com a chave pedida e descarta o desenho.
    graphics.generateTexture(key, width, height);
    graphics.destroy();
  }
}

import Phaser from 'phaser';
import {
  IMAGE_ASSETS,
  type FaceSpec,
  type ImageAsset,
  type SpritesheetFrames,
  type ToolSpec,
} from '../config/assets';
import { BACKGROUND_ASSETS } from '../config/backgrounds';
import {
  BODY_ANIMATION_FRAMES,
  BODY_ANIMATIONS,
  BODY_NECK_FALLBACK,
  bodyAnimationKey,
} from '../config/bodySprite';
import { CHARACTER_IDS, CHARACTERS } from '../config/characters';
import {
  BODY_WALK_FPS,
  GAME_HEIGHT,
  PRELOAD_BAR_HEIGHT,
  PRELOAD_BAR_WIDTH,
} from '../config/constants';
import { RegistryKeys, SceneKeys } from '../config/keys';
import { LEVELS } from '../config/levels';
import { neckFor, type NeckPoint } from '../logic/bodyAnimation';

/**
 * Carrega todos os assets mostrando uma barra de progresso.
 * Imagem que não existir (ou falhar) vira um placeholder colorido com a mesma chave,
 * então o jogo roda mesmo sem nenhuma arte real. Também cria as animações dos corpos.
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
      if (asset.frames) {
        // Spritesheet: o Phaser corta a imagem em quadros iguais, numerados a partir de 0.
        this.load.spritesheet(asset.key, asset.path, {
          frameWidth: asset.frames.frameWidth,
          frameHeight: asset.frames.frameHeight,
        });
      } else {
        this.load.image(asset.key, asset.path);
      }
    }
    // Fundos das fases: sem placeholder; se faltar a imagem, a camada não aparece.
    for (const asset of BACKGROUND_ASSETS) {
      this.load.image(asset.key, asset.path);
    }
    for (const level of LEVELS) {
      this.load.tilemapTiledJSON(level.key, level.path);
    }
  }

  create(): void {
    const missingArt: string[] = [];
    for (const asset of IMAGE_ASSETS) {
      if (!this.textures.exists(asset.key)) {
        this.generatePlaceholder(asset);
        missingArt.push(asset.key);
      }
    }
    // As cenas consultam isto para saber se estão com a arte de verdade ou com o placeholder.
    this.registry.set(RegistryKeys.MissingArt, missingArt);
    this.createBodyAnimations();

    this.scene.start(SceneKeys.Title);
  }

  private createProgressBar(): void {
    const x = (this.scale.width - PRELOAD_BAR_WIDTH) / 2;
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

  /**
   * Animação = sequência de quadros com uma velocidade. Criadas uma vez aqui, ficam
   * disponíveis para todas as cenas (o gerenciador de animações é do jogo, não da cena).
   */
  private createBodyAnimations(): void {
    for (const id of CHARACTER_IDS) {
      const { texture } = CHARACTERS[id].body;
      for (const animation of BODY_ANIMATIONS) {
        const key = bodyAnimationKey(texture, animation);
        if (this.anims.exists(key)) continue;
        this.anims.create({
          key,
          frames: this.anims.generateFrameNumbers(texture, {
            frames: [...BODY_ANIMATION_FRAMES[animation]],
          }),
          frameRate: BODY_WALK_FPS,
          // Só a caminhada repete; parado e pulo são um quadro só.
          repeat: animation === 'walk' ? -1 : 0,
        });
      }
    }
  }

  private generatePlaceholder({ key, placeholder, frames }: ImageAsset): void {
    const { width, height, color, face, tiles, tool, vehicle, figure } = placeholder;
    const graphics = this.add.graphics();
    if (figure && frames) {
      this.drawFigures(graphics, frames, color, figure.neck);
    } else if (face) {
      this.drawFace(graphics, width, color, face);
    } else if (tool) {
      this.drawTool(graphics, width, height, color, tool);
    } else if (vehicle) {
      this.drawVehicle(graphics, width, height, color, vehicle.wheelColor);
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

    // Recorta a textura em quadros numerados, igual ao que o load.spritesheet faria.
    if (frames) {
      const texture = this.textures.get(key);
      for (let i = 0; i < frames.count; i++) {
        texture.add(i, 0, i * frames.frameWidth, 0, frames.frameWidth, frames.frameHeight);
      }
    }
  }

  /**
   * Boneco sem cabeça em cada quadro: parado, caminhada (pernas sobem alternadas e braços
   * balançam ao contrário) e pulo (pernas encolhidas). O tronco fica embaixo do pescoço
   * (à direita do meio, como na arte meio de lado) e desce junto com ele.
   */
  private drawFigures(
    graphics: Phaser.GameObjects.Graphics,
    { frameWidth, frameHeight, count }: SpritesheetFrames,
    clothesColor: number,
    neckPoints: readonly NeckPoint[],
  ): void {
    const walk = BODY_ANIMATION_FRAMES.walk;
    const jump = BODY_ANIMATION_FRAMES.jump;
    const unit = frameHeight / 160; // medidas abaixo pensadas para um quadro de 160 de altura

    for (let frame = 0; frame < count; frame++) {
      const neckPoint = neckFor(frame, neckPoints, BODY_NECK_FALLBACK);
      const centerX = frame * frameWidth + neckPoint.x;
      const neck = neckPoint.y;
      let leftLift = 0;
      let rightLift = 0;
      let armSwing = 0;
      const walkIndex = walk.indexOf(frame);
      if (walkIndex >= 0) {
        const phase = (walkIndex / walk.length) * Math.PI * 2;
        leftLift = Math.max(0, Math.sin(phase)) * 24 * unit;
        rightLift = Math.max(0, -Math.sin(phase)) * 24 * unit;
        armSwing = Math.sin(phase) * 14 * unit;
      } else if (jump.includes(frame)) {
        leftLift = 20 * unit;
        rightLift = 20 * unit;
        armSwing = -18 * unit;
      }

      const torsoTop = 6 * unit + neck;
      const hipY = 84 * unit + neck;
      const shoe = 14 * unit;

      // Pernas (calça escura) e sapatos; a perna levantada termina mais alto.
      for (const [legX, lift] of [
        [centerX - 26 * unit, leftLift],
        [centerX + 6 * unit, rightLift],
      ] as const) {
        const footY = frameHeight - lift;
        graphics.fillStyle(0x1d2b53);
        graphics.fillRect(legX, hipY, 20 * unit, footY - shoe - hipY);
        graphics.fillStyle(0x5f574f);
        graphics.fillRect(legX - 4 * unit, footY - shoe, 28 * unit, shoe);
      }

      // Braços abertos, balançando ao contrário das pernas, com mãos cor de pele.
      graphics.fillStyle(clothesColor);
      graphics.fillRect(centerX - 68 * unit, 18 * unit + neck + armSwing, 38 * unit, 16 * unit);
      graphics.fillRect(centerX + 30 * unit, 18 * unit + neck - armSwing, 38 * unit, 16 * unit);
      graphics.fillStyle(0xffccaa);
      graphics.fillCircle(centerX - 70 * unit, 26 * unit + neck + armSwing, 9 * unit);
      graphics.fillCircle(centerX + 70 * unit, 26 * unit + neck - armSwing, 9 * unit);

      // Tronco com a roupa do personagem e um pescocinho em cima.
      graphics.fillStyle(0xffccaa);
      graphics.fillRect(centerX - 8 * unit, neck, 16 * unit, 10 * unit);
      graphics.fillStyle(clothesColor);
      graphics.fillRoundedRect(
        centerX - 30 * unit,
        torsoTop,
        60 * unit,
        hipY - torsoTop + 6 * unit,
        14 * unit,
      );
      graphics.lineStyle(3 * unit, 0x000000);
      graphics.strokeRoundedRect(
        centerX - 30 * unit,
        torsoTop,
        60 * unit,
        hipY - torsoTop + 6 * unit,
        14 * unit,
      );
      // Botão do lado da frente (direita): mostra para onde o boneco olha.
      graphics.fillStyle(0xffec27);
      graphics.fillCircle(centerX + 16 * unit, torsoTop + 22 * unit, 6 * unit);
    }
  }

  /** Ferramenta (vassoura, pá): cabo fino no meio e a ponta mais larga embaixo. */
  private drawTool(
    graphics: Phaser.GameObjects.Graphics,
    width: number,
    height: number,
    handleColor: number,
    { headColor, headHeight }: ToolSpec,
  ): void {
    const handleWidth = Math.max(2, Math.round(width * 0.3));
    const handleHeight = height - headHeight;
    graphics.fillStyle(handleColor);
    graphics.fillRect((width - handleWidth) / 2, 0, handleWidth, handleHeight);

    graphics.fillStyle(headColor);
    graphics.fillRect(0, handleHeight, width, headHeight);
    graphics.lineStyle(1, 0x000000);
    graphics.strokeRect(0, handleHeight, width, headHeight);
  }

  /** Carrinho de lado: lataria arredondada embaixo, para-brisa na frente e duas rodas. */
  private drawVehicle(
    graphics: Phaser.GameObjects.Graphics,
    width: number,
    height: number,
    bodyColor: number,
    wheelColor: number,
  ): void {
    const wheelRadius = height * 0.2;
    const bodyTop = height * 0.4;
    const bodyHeight = height - bodyTop - wheelRadius;

    graphics.fillStyle(bodyColor);
    graphics.fillRoundedRect(0, bodyTop, width, bodyHeight, 6);
    graphics.lineStyle(2, 0x000000);
    graphics.strokeRoundedRect(0, bodyTop, width, bodyHeight, 6);

    // Para-brisa na frente (lado direito), um pouco acima da lataria.
    graphics.fillStyle(0x29adff);
    graphics.fillRect(width * 0.62, height * 0.12, width * 0.08, bodyTop - height * 0.12);

    graphics.fillStyle(wheelColor);
    for (const wheelX of [width * 0.22, width * 0.78]) {
      graphics.fillCircle(wheelX, height - wheelRadius, wheelRadius);
    }
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
    if (expression === 'grumpy') {
      // Sobrancelhas inclinadas para o meio: cara de bravo.
      const browY = eyeY - size * 0.14;
      graphics.lineBetween(
        center - eyeOffsetX * 1.8,
        browY - size * 0.06,
        center - size * 0.04,
        browY + size * 0.04,
      );
      graphics.lineBetween(
        center + eyeOffsetX * 1.8,
        browY - size * 0.06,
        center + size * 0.04,
        browY + size * 0.04,
      );
    }

    graphics.beginPath();
    if (expression === 'happy') {
      graphics.arc(center, size * 0.56, size * 0.2, 0.15 * Math.PI, 0.85 * Math.PI);
    } else if (expression === 'sad' || expression === 'grumpy') {
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

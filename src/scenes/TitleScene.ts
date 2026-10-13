import Phaser from 'phaser';
import { BlinkingPrompt } from '../components/BlinkingPrompt';
import {
  GAME_HEIGHT,
  TITLE_PROMPT_Y_RATIO,
  TITLE_PROMPT_Y_RATIO_WITH_ART,
} from '../config/constants';
import { RegistryKeys, SceneKeys, TextureKeys } from '../config/keys';
import { enterFullscreenOnTouch } from '../config/screen';
import { TextStyles } from '../config/textStyles';
import { TEXTS } from '../config/texts';
import { coverScale } from '../logic/coverScale';
import { InputManager } from '../systems/InputManager';

/** Tela de abertura: arte com o nome do jogo e "toque para começar". */
export class TitleScene extends Phaser.Scene {
  private inputManager!: InputManager;
  private leaving = false;
  private background?: Phaser.GameObjects.Image;
  private title?: Phaser.GameObjects.Text;
  private prompt!: BlinkingPrompt;

  constructor() {
    super(SceneKeys.Title);
  }

  create(): void {
    this.leaving = false;
    this.background = undefined;
    this.title = undefined;

    const missingArt = (this.registry.get(RegistryKeys.MissingArt) as string[] | undefined) ?? [];
    const hasArt = !missingArt.includes(TextureKeys.TitleBackground);

    if (hasArt) {
      this.background = this.add.image(0, 0, TextureKeys.TitleBackground);
    } else {
      // Sem a arte, o nome do jogo aparece em texto.
      this.title = this.add.text(0, 0, TEXTS.gameTitle, TextStyles.title).setOrigin(0.5);
    }

    const promptY = GAME_HEIGHT * (hasArt ? TITLE_PROMPT_Y_RATIO_WITH_ART : TITLE_PROMPT_Y_RATIO);
    this.prompt = new BlinkingPrompt(this, 0, promptY, TEXTS.pressStart);
    this.layout();

    // A largura do jogo muda se a tela mudar (girar o celular, redimensionar a janela).
    this.scale.on(Phaser.Scale.Events.RESIZE, this.layout, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.scale.off(Phaser.Scale.Events.RESIZE, this.layout, this);
    });

    this.inputManager = new InputManager(this);
    // POINTER_UP (e não DOWN): o navegador só libera a tela cheia ao terminar o toque.
    this.input.once(Phaser.Input.Events.POINTER_UP, () => {
      enterFullscreenOnTouch(this);
      this.goToSelect();
    });
  }

  update(): void {
    if (this.inputManager.justPressed('confirm')) this.goToSelect();
  }

  /** Centraliza tudo na largura atual; a arte cobre a tela inteira sem distorcer. */
  private layout(): void {
    const { width } = this.scale;
    const centerX = width / 2;

    if (this.background) {
      const { width: imageWidth, height: imageHeight } = this.background;
      this.background
        .setPosition(centerX, GAME_HEIGHT / 2)
        .setScale(coverScale(imageWidth, imageHeight, width, GAME_HEIGHT));
    }
    this.title?.setPosition(centerX, GAME_HEIGHT * 0.38);
    this.prompt.text.setX(centerX);
  }

  private goToSelect(): void {
    // Evita trocar de cena duas vezes se o toque e a tecla acontecerem juntos.
    if (this.leaving) return;
    this.leaving = true;
    this.scene.start(SceneKeys.Select);
  }
}

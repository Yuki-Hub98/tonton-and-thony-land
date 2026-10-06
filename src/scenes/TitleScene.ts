import Phaser from 'phaser';
import { BlinkingPrompt } from '../components/BlinkingPrompt';
import {
  GAME_HEIGHT,
  GAME_WIDTH,
  TITLE_PROMPT_Y_RATIO,
  TITLE_PROMPT_Y_RATIO_WITH_ART,
} from '../config/constants';
import { RegistryKeys, SceneKeys, TextureKeys } from '../config/keys';
import { TextStyles } from '../config/textStyles';
import { TEXTS } from '../config/texts';
import { coverScale } from '../logic/coverScale';
import { InputManager } from '../systems/InputManager';

/** Tela de abertura: arte com o nome do jogo e "toque para começar". */
export class TitleScene extends Phaser.Scene {
  private inputManager!: InputManager;
  private leaving = false;

  constructor() {
    super(SceneKeys.Title);
  }

  create(): void {
    this.leaving = false;
    const centerX = GAME_WIDTH / 2;

    const missingArt = (this.registry.get(RegistryKeys.MissingArt) as string[] | undefined) ?? [];
    const hasArt = !missingArt.includes(TextureKeys.TitleBackground);

    if (hasArt) {
      // A arte cobre a tela toda; se a proporção for diferente, as sobras das bordas ficam de fora.
      const background = this.add.image(centerX, GAME_HEIGHT / 2, TextureKeys.TitleBackground);
      background.setScale(coverScale(background.width, background.height, GAME_WIDTH, GAME_HEIGHT));
    } else {
      // Sem a arte, o nome do jogo aparece em texto.
      this.add.text(centerX, GAME_HEIGHT * 0.38, TEXTS.gameTitle, TextStyles.title).setOrigin(0.5);
    }

    const promptY = GAME_HEIGHT * (hasArt ? TITLE_PROMPT_Y_RATIO_WITH_ART : TITLE_PROMPT_Y_RATIO);
    new BlinkingPrompt(this, centerX, promptY, TEXTS.pressStart);

    this.inputManager = new InputManager(this);
    this.input.once(Phaser.Input.Events.POINTER_DOWN, () => this.goToSelect());
  }

  update(): void {
    if (this.inputManager.justPressed('confirm')) this.goToSelect();
  }

  private goToSelect(): void {
    // Evita trocar de cena duas vezes se o toque e a tecla acontecerem juntos.
    if (this.leaving) return;
    this.leaving = true;
    this.scene.start(SceneKeys.Select);
  }
}

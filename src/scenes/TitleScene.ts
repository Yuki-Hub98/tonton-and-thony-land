import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH, PROMPT_BLINK_MS } from '../config/constants';
import { SceneKeys } from '../config/keys';
import { TextStyles } from '../config/textStyles';
import { TEXTS } from '../config/texts';
import { InputManager } from '../systems/InputManager';

/** Tela de abertura: nome do jogo e "toque para começar". */
export class TitleScene extends Phaser.Scene {
  private inputManager!: InputManager;
  private leaving = false;

  constructor() {
    super(SceneKeys.Title);
  }

  create(): void {
    this.leaving = false;
    const centerX = GAME_WIDTH / 2;

    this.add.text(centerX, GAME_HEIGHT * 0.38, TEXTS.gameTitle, TextStyles.title).setOrigin(0.5);

    const prompt = this.add
      .text(centerX, GAME_HEIGHT * 0.68, TEXTS.pressStart, TextStyles.prompt)
      .setOrigin(0.5);

    // Tween: o Phaser anima uma propriedade (aqui a transparência) ao longo do tempo.
    // yoyo = vai e volta; repeat -1 = para sempre. Resultado: o texto pisca.
    this.tweens.add({
      targets: prompt,
      alpha: 0.2,
      duration: PROMPT_BLINK_MS,
      yoyo: true,
      repeat: -1,
    });

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

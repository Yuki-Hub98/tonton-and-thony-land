import Phaser from 'phaser';
import { BlinkingPrompt } from '../components/BlinkingPrompt';
import { CHARACTERS, type CharacterId } from '../config/characters';
import {
  CELEBRATE_HOP_HEIGHT,
  CELEBRATE_HOP_MS,
  CONFETTI_COLORS,
  CONFETTI_COUNT,
  CONFETTI_FALL_MS,
  CONFETTI_SIZE,
  GAME_HEIGHT,
  VICTORY_HEAD_SIZE,
} from '../config/constants';
import { SceneKeys } from '../config/keys';
import { TextStyles } from '../config/textStyles';
import { TEXTS } from '../config/texts';
import { InputManager } from '../systems/InputManager';

export interface VictoryData {
  characterId: CharacterId;
}

/** Zerou o jogo: cabeça feliz pulando, chuva de confete e volta ao início. */
export class VictoryScene extends Phaser.Scene {
  private victory!: VictoryData;
  private inputManager!: InputManager;
  private leaving = false;

  constructor() {
    super(SceneKeys.Victory);
  }

  init(data: VictoryData): void {
    this.victory = data;
    this.leaving = false;
  }

  create(): void {
    const centerX = this.scale.width / 2;
    const character = CHARACTERS[this.victory.characterId];

    this.createConfetti();

    this.add.text(centerX, GAME_HEIGHT * 0.15, TEXTS.victory, TextStyles.title).setOrigin(0.5);
    const head = this.add
      .image(centerX, GAME_HEIGHT * 0.52, character.heads.happy)
      .setDisplaySize(VICTORY_HEAD_SIZE, VICTORY_HEAD_SIZE);
    this.tweens.add({
      targets: head,
      y: head.y - CELEBRATE_HOP_HEIGHT,
      duration: CELEBRATE_HOP_MS,
      yoyo: true,
      repeat: -1,
      ease: Phaser.Math.Easing.Quadratic.Out,
    });

    new BlinkingPrompt(this, centerX, GAME_HEIGHT * 0.88, TEXTS.playAgain);

    this.inputManager = new InputManager(this);
    this.input.once(Phaser.Input.Events.POINTER_DOWN, () => this.backToTitle());
  }

  update(): void {
    if (this.inputManager.justPressed('confirm')) this.backToTitle();
  }

  /** Quadradinhos coloridos caindo e girando, cada um com posição e tempo sorteados. */
  private createConfetti(): void {
    const width = this.scale.width;
    for (let i = 0; i < CONFETTI_COUNT; i++) {
      const color = CONFETTI_COLORS[i % CONFETTI_COLORS.length] ?? 0xffffff;
      const piece = this.add.rectangle(
        Phaser.Math.Between(0, width),
        -CONFETTI_SIZE,
        CONFETTI_SIZE,
        CONFETTI_SIZE * 0.6,
        color,
      );
      this.tweens.add({
        targets: piece,
        y: GAME_HEIGHT + CONFETTI_SIZE,
        angle: Phaser.Math.Between(180, 720),
        duration: Phaser.Math.Between(CONFETTI_FALL_MS * 0.6, CONFETTI_FALL_MS * 1.4),
        delay: Phaser.Math.Between(0, CONFETTI_FALL_MS),
        repeat: -1,
      });
    }
  }

  private backToTitle(): void {
    if (this.leaving) return;
    this.leaving = true;
    this.scene.start(SceneKeys.Title);
  }
}

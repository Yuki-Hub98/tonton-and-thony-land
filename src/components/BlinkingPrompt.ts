import type Phaser from 'phaser';
import { PROMPT_BLINK_MS } from '../config/constants';
import { TextStyles } from '../config/textStyles';

/** Texto centralizado que pisca para sempre ("toque para começar"). */
export class BlinkingPrompt {
  readonly text: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, x: number, y: number, message: string) {
    this.text = scene.add.text(x, y, message, TextStyles.prompt).setOrigin(0.5);

    // Tween: o Phaser anima uma propriedade (aqui a transparência) ao longo do tempo.
    // yoyo = vai e volta; repeat -1 = para sempre. Resultado: o texto pisca.
    scene.tweens.add({
      targets: this.text,
      alpha: 0.2,
      duration: PROMPT_BLINK_MS,
      yoyo: true,
      repeat: -1,
    });
  }
}

import type Phaser from 'phaser';
import { BACKGROUNDS, type BackgroundId } from '../config/backgrounds';
import { BACKGROUND_DEPTH, MENU_BG_SCROLL_SPEED } from '../config/constants';
import { backgroundMix } from '../logic/backgroundCycle';
import { ParallaxBackground } from '../systems/ParallaxBackground';

export interface SlideshowTiming {
  /** Quanto tempo cada fundo fica na tela antes de o próximo começar a aparecer. */
  holdMs: number;
  /** Quanto dura a troca. */
  fadeMs: number;
  /** Depois do último, volta ao primeiro (true) ou para nele (false). */
  loop: boolean;
}

/**
 * Fundos das fases atrás de uma tela de menu. O cenário passa sozinho, como uma câmera
 * andando para a direita, e os fundos se revezam: o atual fica embaixo e o próximo aparece
 * por cima dele, aos poucos; os outros ficam escondidos.
 *
 * Uso: criar no create(), antes dos textos, e chamar update(delta) a cada frame.
 */
export class BackgroundSlideshow {
  private readonly backgrounds: ParallaxBackground[];
  private elapsedMs = 0;

  constructor(
    scene: Phaser.Scene,
    ids: readonly BackgroundId[],
    private readonly timing: SlideshowTiming,
  ) {
    this.backgrounds = ids.map((id) => new ParallaxBackground(scene, BACKGROUNDS[id]));
    this.update(0);
  }

  update(deltaMs: number): void {
    this.elapsedMs += deltaMs;
    const scrollX = this.elapsedMs * MENU_BG_SCROLL_SPEED;
    const { holdMs, fadeMs, loop } = this.timing;
    const mix = backgroundMix(this.elapsedMs, this.backgrounds.length, holdMs, fadeMs, loop);

    this.backgrounds.forEach((background, index) => {
      background.update(deltaMs, scrollX);
      if (index === mix.current) {
        // Duas vezes mais fundo que o normal: fica embaixo do próximo.
        background.setDepthBase(BACKGROUND_DEPTH * 2).setAlpha(1);
      } else if (index === mix.next) {
        background.setDepthBase(BACKGROUND_DEPTH).setAlpha(mix.fade);
      } else {
        background.setAlpha(0);
      }
    });
  }
}

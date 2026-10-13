import type Phaser from 'phaser';
import { HAPPY_DURATION_MS, IDLE_SLIDE_MS, SAD_DURATION_MS } from '../config/constants';
import { HeadMood, resolveHeadTexture, type HeadEvent, type HeadPoses } from '../logic/HeadMood';
import type { HeadFit } from './headSizing';

/** Aplica o humor (HeadMood) na imagem da cabeça, trocando a foto quando ele muda. */
export class HeadController {
  private readonly mood: HeadMood;
  private currentTexture = '';

  constructor(
    private readonly head: Phaser.GameObjects.Image,
    private readonly poses: HeadPoses,
    startTime: number,
    /** Tamanho e origem da cabeça (na fase, encaixada no queixo; na seleção, maior e centrada). */
    private readonly fit: HeadFit,
  ) {
    this.mood = new HeadMood(
      {
        idleFrames: poses.idle.length,
        idleSlideMs: IDLE_SLIDE_MS,
        happyDurationMs: HAPPY_DURATION_MS,
        sadDurationMs: SAD_DURATION_MS,
      },
      startTime,
    );
    this.update(startTime);
  }

  notify(event: HeadEvent, now: number): void {
    this.mood.notify(event, now);
    this.update(now);
  }

  /** Chamar a cada frame com o tempo do jogo. */
  update(now: number): void {
    const texture = resolveHeadTexture(this.mood.current(now), this.poses);
    if (texture === this.currentTexture) return;

    // Fotos e placeholders podem ter tamanhos diferentes; o fit recalcula a cada troca.
    this.head.setTexture(texture);
    this.fit(this.head);
    this.currentTexture = texture;
  }
}

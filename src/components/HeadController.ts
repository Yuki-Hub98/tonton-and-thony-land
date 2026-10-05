import type Phaser from 'phaser';
import { HAPPY_DURATION_MS, HEAD_SIZE, IDLE_SLIDE_MS, SAD_DURATION_MS } from '../config/constants';
import { HeadMood, resolveHeadTexture, type HeadEvent, type HeadPoses } from '../logic/HeadMood';

/** Aplica o humor (HeadMood) na imagem da cabeça, trocando a foto quando ele muda. */
export class HeadController {
  private readonly mood: HeadMood;
  private currentTexture = '';

  constructor(
    private readonly head: Phaser.GameObjects.Image,
    private readonly poses: HeadPoses,
    startTime: number,
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

    // Fotos e placeholders podem ter tamanhos diferentes; a cabeça sempre aparece com HEAD_SIZE.
    this.head.setTexture(texture).setDisplaySize(HEAD_SIZE, HEAD_SIZE);
    this.currentTexture = texture;
  }
}

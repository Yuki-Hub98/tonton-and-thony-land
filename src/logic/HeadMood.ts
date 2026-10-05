// Regra de qual foto da cabeça mostrar. Sem Phaser e sem Date.now():
// quem chama passa o tempo atual (em ms), o que deixa tudo testável.

export type HeadFace = { kind: 'idle'; index: number } | { kind: 'sad' } | { kind: 'happy' };

/**
 * Eventos que mudam o humor.
 * - damaged: levou dano e sobreviveu (fica triste por um tempo)
 * - died: morreu (fica triste até o respawn)
 * - respawned: voltou ao início da fase
 * - pickedItem: pegou equipamento ou carro (fica feliz por um tempo)
 */
export type HeadEvent = 'damaged' | 'died' | 'respawned' | 'pickedItem';

export interface HeadMoodTiming {
  /** Quantas fotos idle existem no ciclo. */
  idleFrames: number;
  /** Tempo de cada foto idle no slide. */
  idleSlideMs: number;
  happyDurationMs: number;
  sadDurationMs: number;
}

export interface HeadPoses {
  idle: readonly string[];
  sad: string;
  happy: string;
}

export class HeadMood {
  private mood: 'idle' | 'sad' | 'happy' = 'idle';
  /** Quando o humor temporário (sad/happy) acaba. */
  private moodUntil = 0;
  /** Quando o ciclo idle atual começou (o slide recomeça da primeira foto). */
  private idleSince: number;
  private dead = false;

  constructor(
    private readonly timing: HeadMoodTiming,
    startTime: number,
  ) {
    this.idleSince = startTime;
  }

  notify(event: HeadEvent, now: number): void {
    switch (event) {
      case 'died':
        this.dead = true;
        this.setMood('sad', Number.POSITIVE_INFINITY);
        break;
      case 'respawned':
        this.dead = false;
        this.mood = 'idle';
        this.idleSince = now;
        break;
      case 'damaged':
        if (!this.dead) this.setMood('sad', now + this.timing.sadDurationMs);
        break;
      case 'pickedItem':
        if (!this.dead) this.setMood('happy', now + this.timing.happyDurationMs);
        break;
    }
  }

  current(now: number): HeadFace {
    if (this.mood !== 'idle' && now < this.moodUntil) {
      return { kind: this.mood };
    }

    // Se um humor temporário acabou, o slide idle recomeça a partir do fim dele.
    const idleStart = this.mood === 'idle' ? this.idleSince : this.moodUntil;
    const elapsed = Math.max(0, now - idleStart);
    const index = Math.floor(elapsed / this.timing.idleSlideMs) % this.timing.idleFrames;
    return { kind: 'idle', index };
  }

  private setMood(mood: 'sad' | 'happy', until: number): void {
    this.mood = mood;
    this.moodUntil = until;
  }
}

/** Traduz o humor na chave de textura da foto do personagem. */
export function resolveHeadTexture(face: HeadFace, poses: HeadPoses): string {
  if (face.kind === 'sad') return poses.sad;
  if (face.kind === 'happy') return poses.happy;

  const texture = poses.idle[face.index % poses.idle.length];
  if (texture === undefined) {
    throw new Error('O personagem precisa de pelo menos uma foto idle.');
  }
  return texture;
}

// Ciclo de fundos que se revezam (tela de seleção), sem Phaser.

export interface BackgroundMix {
  /** Fundo que está aparecendo inteiro. */
  current: number;
  /** Próximo fundo, que aparece por cima de `current` durante a troca. */
  next: number;
  /** Quanto o próximo já apareceu: 0 = nada, 1 = inteiro. */
  fade: number;
}

/**
 * Qual fundo mostrar no tempo `elapsedMs`: cada um fica `holdMs` parado na tela e depois
 * o próximo aparece por cima em `fadeMs`. Depois do último, volta ao primeiro.
 */
export function backgroundMix(
  elapsedMs: number,
  count: number,
  holdMs: number,
  fadeMs: number,
): BackgroundMix {
  const period = holdMs + fadeMs;
  if (count <= 1 || period <= 0) return { current: 0, next: 0, fade: 0 };

  const time = Math.max(0, elapsedMs);
  const current = Math.floor(time / period) % count;
  const inPeriod = time % period;
  const fade = inPeriod <= holdMs || fadeMs <= 0 ? 0 : (inPeriod - holdMs) / fadeMs;
  return { current, next: (current + 1) % count, fade };
}

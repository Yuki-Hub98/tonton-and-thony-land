// Fundos que se revezam nas telas de menu (seleção, fase concluída), sem Phaser.

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
 * o próximo aparece por cima em `fadeMs`. Depois do último, volta ao primeiro (`loop`)
 * ou para nele.
 */
export function backgroundMix(
  elapsedMs: number,
  count: number,
  holdMs: number,
  fadeMs: number,
  loop = true,
): BackgroundMix {
  const period = holdMs + fadeMs;
  if (count <= 1 || period <= 0) return { current: 0, next: 0, fade: 0 };

  const time = Math.max(0, elapsedMs);
  const step = Math.floor(time / period);
  if (!loop && step >= count - 1) return { current: count - 1, next: count - 1, fade: 0 };

  const current = step % count;
  const inPeriod = time % period;
  const fade = inPeriod <= holdMs || fadeMs <= 0 ? 0 : (inPeriod - holdMs) / fadeMs;
  return { current, next: (current + 1) % count, fade };
}

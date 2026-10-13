/** Contador de vidas. Chegar a zero é game over. */
export class LivesCounter {
  private remaining: number;

  constructor(initial: number) {
    if (!Number.isInteger(initial) || initial < 1) {
      throw new Error(`O jogo precisa começar com pelo menos 1 vida (recebi ${initial}).`);
    }
    this.remaining = initial;
  }

  get lives(): number {
    return this.remaining;
  }

  get isGameOver(): boolean {
    return this.remaining === 0;
  }

  /** Tira uma vida e devolve quantas sobraram (nunca fica negativo). */
  loseLife(): number {
    this.remaining = Math.max(0, this.remaining - 1);
    return this.remaining;
  }
}

// Estados do jogador e as regras de transição, sem Phaser.
// A cena manda eventos ("levou dano", "chegou na bandeira") e a máquina diz o novo estado.
// ARMED (equipamento) entra na Etapa 6 e CAR (carro) na Etapa 7.

/**
 * - normal: anda e pula
 * - dead: animação de morte; depois vem respawn ou game over
 * - levelComplete / gameOver: estados finais da fase
 */
export type PlayerState = 'normal' | 'dead' | 'levelComplete' | 'gameOver';

/**
 * - damage: encostou em inimigo ou espinho (ignorado enquanto invencível)
 * - fall: caiu no buraco (mata mesmo invencível)
 * - reachFlag: encostou na bandeira
 * - respawn: volta à fase depois de morrer, invencível por alguns instantes
 * - gameOver: morreu sem vidas sobrando
 */
export type PlayerEvent = 'damage' | 'fall' | 'reachFlag' | 'respawn' | 'gameOver';

export class PlayerStateMachine {
  private current: PlayerState = 'normal';
  private invincibleUntilMs = 0;

  /** @param invincibleMs quanto tempo fica invencível depois do respawn */
  constructor(private readonly invincibleMs: number) {}

  get state(): PlayerState {
    return this.current;
  }

  /** Até quando (tempo do jogo, em ms) dura a invencibilidade. */
  get invincibleUntil(): number {
    return this.invincibleUntilMs;
  }

  isInvincible(now: number): boolean {
    return this.current === 'normal' && now < this.invincibleUntilMs;
  }

  /** Aplica o evento e devolve o novo estado. Evento que não vale no estado atual é ignorado. */
  send(event: PlayerEvent, now: number): PlayerState {
    this.current = this.next(event, now);
    return this.current;
  }

  private next(event: PlayerEvent, now: number): PlayerState {
    switch (this.current) {
      case 'normal':
        if (event === 'damage') return this.isInvincible(now) ? 'normal' : 'dead';
        if (event === 'fall') return 'dead';
        if (event === 'reachFlag') return 'levelComplete';
        return 'normal';
      case 'dead':
        if (event === 'respawn') {
          this.invincibleUntilMs = now + this.invincibleMs;
          return 'normal';
        }
        if (event === 'gameOver') return 'gameOver';
        return 'dead';
      case 'levelComplete':
      case 'gameOver':
        return this.current;
    }
  }
}

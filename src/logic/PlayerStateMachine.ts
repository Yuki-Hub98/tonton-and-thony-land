// Estados do jogador e as regras de transição, sem Phaser.
// A cena manda eventos ("levou dano", "chegou na bandeira") e a máquina diz o novo estado.

/**
 * - normal: anda e pula; bater não faz nada
 * - armed: pegou o equipamento; anda, pula e bate
 * - car: virou carrinho; vai sozinho até a bandeira, invencível
 * - dead: animação de morte; depois vem respawn ou game over
 * - levelComplete / gameOver: estados finais da fase
 */
export type PlayerState = 'normal' | 'armed' | 'car' | 'dead' | 'levelComplete' | 'gameOver';

/**
 * - pickupEquipment: encostou no equipamento da fase
 * - pickupCar: encostou no carro (com ou sem equipamento)
 * - damage: encostou em inimigo ou espinho (ignorado enquanto invencível).
 *   Armado, perde o equipamento em vez de morrer.
 * - fall: caiu no buraco (mata mesmo invencível ou armado; no carro, não)
 * - reachFlag: encostou na bandeira
 * - respawn: volta à fase depois de morrer, invencível por alguns instantes
 * - gameOver: morreu sem vidas sobrando
 */
export type PlayerEvent =
  'pickupEquipment' | 'pickupCar' | 'damage' | 'fall' | 'reachFlag' | 'respawn' | 'gameOver';

export class PlayerStateMachine {
  private current: PlayerState = 'normal';
  private invincibleUntilMs = 0;

  /** @param invincibleMs quanto tempo fica invencível depois do respawn ou de perder o equipamento */
  constructor(private readonly invincibleMs: number) {}

  get state(): PlayerState {
    return this.current;
  }

  /** Está jogando a fase: nem morto, nem com a fase encerrada. */
  get isInPlay(): boolean {
    return this.current === 'normal' || this.current === 'armed' || this.current === 'car';
  }

  /** O botão bater só funciona com o equipamento (no carro, o input fica desligado). */
  get canAttack(): boolean {
    return this.current === 'armed';
  }

  /** No carro o jogador não controla nada: ele segue sozinho até a bandeira. */
  get isAutoDriving(): boolean {
    return this.current === 'car';
  }

  /** Até quando (tempo do jogo, em ms) dura a invencibilidade temporária (piscando). */
  get invincibleUntil(): number {
    return this.invincibleUntilMs;
  }

  /** No carro é sempre invencível; fora dele, só no tempo depois do respawn ou do dano armado. */
  isInvincible(now: number): boolean {
    if (this.current === 'car') return true;
    return this.isInPlay && now < this.invincibleUntilMs;
  }

  /** Aplica o evento e devolve o novo estado. Evento que não vale no estado atual é ignorado. */
  send(event: PlayerEvent, now: number): PlayerState {
    this.current = this.next(event, now);
    return this.current;
  }

  private next(event: PlayerEvent, now: number): PlayerState {
    switch (this.current) {
      case 'normal':
        if (event === 'pickupEquipment') return 'armed';
        if (event === 'pickupCar') return 'car';
        if (event === 'damage') return this.isInvincible(now) ? 'normal' : 'dead';
        if (event === 'fall') return 'dead';
        if (event === 'reachFlag') return 'levelComplete';
        return 'normal';
      case 'armed':
        if (event === 'pickupCar') return 'car';
        // Como o Mario perdendo o cogumelo: o dano leva o equipamento, não a vida.
        if (event === 'damage') {
          if (this.isInvincible(now)) return 'armed';
          this.startInvincibility(now);
          return 'normal';
        }
        if (event === 'fall') return 'dead';
        if (event === 'reachFlag') return 'levelComplete';
        return 'armed';
      case 'car':
        // A "estrelinha": nada machuca, e só a bandeira tira do carro.
        return event === 'reachFlag' ? 'levelComplete' : 'car';
      case 'dead':
        if (event === 'respawn') {
          this.startInvincibility(now);
          return 'normal';
        }
        if (event === 'gameOver') return 'gameOver';
        return 'dead';
      case 'levelComplete':
      case 'gameOver':
        return this.current;
    }
  }

  private startInvincibility(now: number): void {
    this.invincibleUntilMs = now + this.invincibleMs;
  }
}

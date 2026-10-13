// Progresso salvo no aparelho (localStorage), sem Phaser.
// Guarda até qual fase cada personagem chegou, para o botão "Continuar".
// Nunca lança erro: sem localStorage (modo anônimo, bloqueado) ou com dado estragado,
// o jogo simplesmente começa do início.
import type { CharacterId } from '../config/characters';

/** O pedaço do localStorage que usamos (facilita trocar por um falso nos testes). */
export interface KeyValueStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

/** Chave no localStorage; o prefixo evita colidir com outro site no mesmo domínio do GitHub Pages. */
export const SAVE_KEY = 'tonton-and-thony-land:save';
const SAVE_VERSION = 1;

interface SaveData {
  version: number;
  /** Índice da fase mais adiante que cada personagem alcançou. */
  reachedLevel: Partial<Record<CharacterId, number>>;
}

export class SaveManager {
  constructor(
    private readonly storage: KeyValueStorage | undefined,
    private readonly levelCount: number,
  ) {}

  /** Usa o localStorage do navegador, se existir e puder ser acessado. */
  static fromBrowser(levelCount: number): SaveManager {
    let storage: KeyValueStorage | undefined;
    try {
      // Só acessar window.localStorage já pode lançar erro (ex.: cookies bloqueados).
      storage = window.localStorage;
    } catch {
      storage = undefined;
    }
    return new SaveManager(storage, levelCount);
  }

  /** Fase de onde o personagem pode continuar (0 = não tem progresso, começa do início). */
  continueLevel(id: CharacterId): number {
    const reached = this.read().reachedLevel[id] ?? 0;
    return Math.min(reached, this.levelCount - 1);
  }

  /** Chegou nesta fase: guarda se for mais adiante do que já estava. */
  recordLevelReached(id: CharacterId, levelIndex: number): void {
    if (!Number.isInteger(levelIndex) || levelIndex < 0 || levelIndex >= this.levelCount) return;
    const data = this.read();
    if (levelIndex <= (data.reachedLevel[id] ?? 0)) return;
    data.reachedLevel[id] = levelIndex;
    this.write(data);
  }

  /** Apaga o progresso do personagem (zerou o jogo ou escolheu começar do início). */
  clearProgress(id: CharacterId): void {
    const data = this.read();
    if (data.reachedLevel[id] === undefined) return;
    // Recria o objeto sem o personagem (em vez de delete com chave variável).
    const reachedLevel = Object.fromEntries(
      Object.entries(data.reachedLevel).filter(([other]) => other !== id),
    );
    this.write({ ...data, reachedLevel });
  }

  private read(): SaveData {
    const empty: SaveData = { version: SAVE_VERSION, reachedLevel: {} };
    let raw: string | null;
    try {
      raw = this.storage?.getItem(SAVE_KEY) ?? null;
    } catch {
      return empty;
    }
    if (raw === null) return empty;

    try {
      const parsed: unknown = JSON.parse(raw);
      if (!isObject(parsed) || parsed.version !== SAVE_VERSION || !isObject(parsed.reachedLevel)) {
        return empty;
      }
      // Copia só valores válidos: dado estragado de um personagem não estraga o do outro.
      const reachedLevel: SaveData['reachedLevel'] = {};
      for (const [id, level] of Object.entries(parsed.reachedLevel)) {
        if (typeof level === 'number' && Number.isInteger(level) && level > 0) {
          reachedLevel[id as CharacterId] = level;
        }
      }
      return { version: SAVE_VERSION, reachedLevel };
    } catch {
      return empty;
    }
  }

  private write(data: SaveData): void {
    try {
      this.storage?.setItem(SAVE_KEY, JSON.stringify(data));
    } catch {
      // Armazenamento cheio ou bloqueado: o jogo segue, só não lembra o progresso.
    }
  }
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

// Definição dos personagens. Tudo que muda entre Anthony e Antonela fica aqui,
// para nenhuma cena precisar de if (personagem === 'anthony').

export type CharacterId = 'anthony' | 'antonela';

/** Fotos de cabeça que todo personagem tem. O nome é também o nome do arquivo .png. */
export const HEAD_POSES = ['idle-1', 'idle-2', 'idle-3', 'sad', 'happy'] as const;
export type HeadPose = (typeof HEAD_POSES)[number];

export interface CharacterDef {
  id: CharacterId;
  displayName: string;
  /** Chaves de textura das fotos (formato `<id>-<pose>`). */
  heads: { idle: string[]; sad: string; happy: string };
  equipment: { name: string; textures: string[] }; // texturas exibidas na mão
  /** Cor da cabeça desenhada enquanto as fotos não existem. */
  placeholderColor: number;
}

export const CHARACTERS: Record<CharacterId, CharacterDef> = {
  anthony: {
    id: 'anthony',
    displayName: 'Anthony',
    heads: {
      idle: ['anthony-idle-1', 'anthony-idle-2', 'anthony-idle-3'],
      sad: 'anthony-sad',
      happy: 'anthony-happy',
    },
    equipment: { name: 'Vassoura e pá', textures: ['broom', 'shovel'] },
    placeholderColor: 0xffa300,
  },
  antonela: {
    id: 'antonela',
    displayName: 'Antonela',
    heads: {
      idle: ['antonela-idle-1', 'antonela-idle-2', 'antonela-idle-3'],
      sad: 'antonela-sad',
      happy: 'antonela-happy',
    },
    equipment: { name: 'A definir', textures: ['equipment-placeholder'] },
    placeholderColor: 0xff77a8,
  },
};

export const CHARACTER_IDS = Object.keys(CHARACTERS) as CharacterId[];

/** Personagem usado enquanto não existe a tela de seleção (Etapa 3). */
export const DEFAULT_CHARACTER_ID: CharacterId = 'anthony';

export function headTextureKey(id: CharacterId, pose: HeadPose): string {
  return `${id}-${pose}`;
}

export function headAssetPath(id: CharacterId, pose: HeadPose): string {
  return `assets/characters/${id}/${pose}.png`;
}

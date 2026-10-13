// Definição dos personagens. Tudo que muda entre Anthony e Antonela fica aqui,
// para nenhuma cena precisar de if (personagem === 'anthony').
import type { ArtPoint } from '../logic/bodyAnimation';
import type { HeadPhoto } from '../logic/headLayout';
import { neckPoints } from './bodySprite';
import { TextureKeys } from './keys';

export type CharacterId = 'anthony' | 'antonela';

/**
 * Fotos de cabeça que todo personagem tem. O nome é também o nome do arquivo .png.
 * Para o slide do humor normal ganhar mais fotos, acrescente 'idle-2', 'idle-3'... aqui e em
 * heads.idle de cada personagem.
 */
export const HEAD_POSES = ['idle-1', 'sad', 'happy'] as const;
export type HeadPose = (typeof HEAD_POSES)[number];

export interface CharacterDef {
  id: CharacterId;
  /**
   * Nome mostrado no jogo. O site é público: use só o apelido, nunca o nome real
   * (o id e as pastas das fotos são internos).
   */
  displayName: string;
  heads: {
    /** Chaves de textura das fotos (formato `<id>-<pose>`). */
    idle: string[];
    sad: string;
    happy: string;
    /** Formato das fotos: quadrada ou com o cabelo comprido abaixo do queixo. */
    photo: HeadPhoto;
  };
  /**
   * Equipamento da fase. A primeira textura vai na mão da frente (e aparece no item a pegar);
   * as outras, na mão de trás.
   */
  equipment: { name: string; textures: string[] };
  /** Corpo animado (spritesheet no formato de bodySprite.ts). */
  body: {
    /** Chave do spritesheet (formato `body-<id>`). */
    texture: string;
    /** Ponto do pescoço em cada quadro, em pixels da imagem (onde a cabeça encaixa). */
    neck: readonly ArtPoint[];
    /** Cor da roupa do boneco desenhado enquanto o spritesheet não existe. */
    placeholderColor: number;
  };
  /** Cor da cabeça desenhada enquanto as fotos não existem. */
  placeholderColor: number;
}

export const CHARACTERS: Record<CharacterId, CharacterDef> = {
  anthony: {
    id: 'anthony',
    displayName: 'Thony',
    heads: {
      idle: ['anthony-idle-1'],
      sad: 'anthony-sad',
      happy: 'anthony-happy',
      photo: { shape: 'square' },
    },
    equipment: { name: 'Vassoura e pá', textures: [TextureKeys.Broom, TextureKeys.Shovel] },
    // Macacão vermelho, como na arte da abertura.
    body: {
      texture: bodyTextureKey('anthony'),
      neck: neckPoints(102.9),
      placeholderColor: 0xff004d,
    },
    placeholderColor: 0xffa300,
  },
  antonela: {
    id: 'antonela',
    displayName: 'Tonton',
    heads: {
      idle: ['antonela-idle-1'],
      sad: 'antonela-sad',
      happy: 'antonela-happy',
      // Fotos de 284 px de largura alinhadas pelos olhos: o queixo fica a 290 px do topo e
      // o cabelo comprido continua abaixo dele.
      photo: { shape: 'withHair', headHeight: 290, chinY: 290 },
    },
    equipment: { name: 'Vassoura', textures: [TextureKeys.Broom] },
    // Vestido rosa, como na arte da abertura.
    body: {
      texture: bodyTextureKey('antonela'),
      neck: neckPoints(103.8),
      placeholderColor: 0xff77a8,
    },
    placeholderColor: 0xff77a8,
  },
};

export const CHARACTER_IDS = Object.keys(CHARACTERS) as CharacterId[];

/** Personagem usado quando a fase é aberta sem passar pela seleção (ex.: testes manuais). */
export const DEFAULT_CHARACTER_ID: CharacterId = 'anthony';

export function headTextureKey(id: CharacterId, pose: HeadPose): string {
  return `${id}-${pose}`;
}

export function headAssetPath(id: CharacterId, pose: HeadPose): string {
  return `assets/characters/${id}/${pose}.png`;
}

export function bodyTextureKey(id: CharacterId): string {
  return `body-${id}`;
}

/** Spritesheet do corpo, na pasta do personagem ("3q" = pose três-quartos, meio de lado). */
export function bodyAssetPath(id: CharacterId): string {
  return `assets/characters/${id}/body-${id}-3q-sheet.png`;
}

import type { ArtPoint } from '../logic/bodyAnimation';
import { BODY_FRAME_COUNT, BODY_FRAME_HEIGHT, BODY_FRAME_WIDTH } from './bodySprite';
import {
  bodyAssetPath,
  CHARACTER_IDS,
  CHARACTERS,
  HEAD_POSES,
  headAssetPath,
  headTextureKey,
  type HeadPose,
} from './characters';
import { HEAD_PLACEHOLDER_SIZE } from './constants';
import { TextureKeys } from './keys';

/** Rostinho desenhado no placeholder da cabeça. */
export interface FaceSpec {
  expression: 'neutral' | 'sad' | 'happy' | 'grumpy';
  /** Para onde os olhos olham: -1 esquerda, 0 centro, 1 direita. */
  lookX: -1 | 0 | 1;
}

/** Forma colorida usada no lugar da imagem enquanto não existe arte real. */
export interface PlaceholderSpec {
  width: number;
  height: number;
  color: number;
  /** Se definido, desenha um rosto redondo em vez de um retângulo. */
  face?: FaceSpec;
  /** Se definido, desenha um tileset: um quadrado de height×height por cor, lado a lado. */
  tiles?: number[];
  /** Se definido, desenha uma ferramenta: cabo fino (color) com a ponta embaixo. */
  tool?: ToolSpec;
  /** Se definido, desenha um carrinho visto de lado (lataria em color) com rodas desta cor. */
  vehicle?: { wheelColor: number };
  /**
   * Se definido, desenha um boneco sem cabeça (roupa em color) em cada quadro do spritesheet,
   * mexendo braços e pernas, com o tronco descendo conforme o pescoço.
   */
  figure?: { neck: readonly ArtPoint[] };
}

/** Imagem dividida em quadros iguais lado a lado (spritesheet), para animação. */
export interface SpritesheetFrames {
  frameWidth: number;
  frameHeight: number;
  count: number;
}

export interface ToolSpec {
  headColor: number;
  /** Altura da ponta (cerdas da vassoura, lâmina da pá), em pixels. */
  headHeight: number;
}

export interface ImageAsset {
  key: string;
  /**
   * Caminho relativo a public/, sem barra no início, para respeitar o base do Vite.
   * PNG para o que precisa de fundo transparente; JPG serve para fundos de tela inteira.
   */
  path: string;
  placeholder: PlaceholderSpec;
  /** Se definido, a imagem é um spritesheet com estes quadros. */
  frames?: SpritesheetFrames;
}

const SPRITE_ASSETS: readonly ImageAsset[] = [
  {
    key: TextureKeys.Flag,
    path: 'assets/sprites/flag.png',
    placeholder: { width: 32, height: 96, color: 0x00e436 },
  },
  {
    key: TextureKeys.Enemy,
    path: 'assets/sprites/enemy-walker.png',
    // Olha para a esquerda: é para lá que ele começa andando.
    placeholder: {
      width: 32,
      height: 32,
      color: 0x7e2553,
      face: { expression: 'grumpy', lookX: -1 },
    },
  },
  {
    key: TextureKeys.Checkpoint,
    path: 'assets/sprites/checkpoint.png',
    placeholder: { width: 32, height: 64, color: 0x83769c },
  },
  {
    key: TextureKeys.CheckpointActive,
    path: 'assets/sprites/checkpoint-active.png',
    placeholder: { width: 32, height: 64, color: 0xffec27 },
  },
  {
    key: TextureKeys.Broom,
    path: 'assets/sprites/broom.png',
    // Cabo marrom com cerdas amarelas embaixo.
    placeholder: {
      width: 16,
      height: 40,
      color: 0xab5236,
      tool: { headColor: 0xffec27, headHeight: 14 },
    },
  },
  {
    key: TextureKeys.Shovel,
    path: 'assets/sprites/shovel.png',
    // Cabo marrom com a lâmina cinza embaixo.
    placeholder: {
      width: 14,
      height: 36,
      color: 0xab5236,
      tool: { headColor: 0xc2c3c7, headHeight: 12 },
    },
  },
  {
    key: TextureKeys.Car,
    path: 'assets/sprites/car.png',
    // Visto de lado, de frente para a direita, em 4× (aparece com BODY_SCALE).
    // A cabeça do personagem entra no banco do motorista (CAR_HEAD_ANCHOR_X/Y).
    placeholder: { width: 224, height: 128, color: 0xff004d, vehicle: { wheelColor: 0x1d2b53 } },
  },
  {
    // Tela de abertura (a arte já traz o nome do jogo). Qualquer tamanho: cobre a tela sem distorcer.
    key: TextureKeys.TitleBackground,
    path: 'assets/ui/title.jpg',
    placeholder: { width: 960, height: 540, color: 0x1d2b53 },
  },
  {
    // Ordem dos tiles: terra, grama, bloco, espinhos (igual ao tileset.png do Tiled).
    key: TextureKeys.Tileset,
    path: 'assets/tiles/tileset.png',
    placeholder: {
      width: 128,
      height: 32,
      color: 0xab5236,
      tiles: [0xab5236, 0x00e436, 0xffa300, 0xc2c3c7],
    },
  },
];

/** Cada foto ganha um rosto diferente, para dar para ver o slide e os humores sem arte real. */
const PLACEHOLDER_FACES: Record<HeadPose, FaceSpec> = {
  'idle-1': { expression: 'neutral', lookX: 0 },
  'idle-2': { expression: 'neutral', lookX: -1 },
  'idle-3': { expression: 'neutral', lookX: 1 },
  sad: { expression: 'sad', lookX: 0 },
  happy: { expression: 'happy', lookX: 0 },
};

const HEAD_ASSETS: readonly ImageAsset[] = CHARACTER_IDS.flatMap((id) =>
  HEAD_POSES.map((pose) => ({
    key: headTextureKey(id, pose),
    path: headAssetPath(id, pose),
    placeholder: {
      width: HEAD_PLACEHOLDER_SIZE,
      height: HEAD_PLACEHOLDER_SIZE,
      color: CHARACTERS[id].placeholderColor,
      face: PLACEHOLDER_FACES[pose],
    },
  })),
);

/** Corpo animado de cada personagem: 10 quadros de 176×160 lado a lado. */
const BODY_ASSETS: readonly ImageAsset[] = CHARACTER_IDS.map((id) => {
  const { body } = CHARACTERS[id];
  return {
    key: body.texture,
    path: bodyAssetPath(id),
    frames: {
      frameWidth: BODY_FRAME_WIDTH,
      frameHeight: BODY_FRAME_HEIGHT,
      count: BODY_FRAME_COUNT,
    },
    placeholder: {
      width: BODY_FRAME_WIDTH * BODY_FRAME_COUNT,
      height: BODY_FRAME_HEIGHT,
      color: body.placeholderColor,
      figure: { neck: body.neck },
    },
  };
});

export const IMAGE_ASSETS: readonly ImageAsset[] = [
  ...SPRITE_ASSETS,
  ...BODY_ASSETS,
  ...HEAD_ASSETS,
];

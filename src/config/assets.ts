import {
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
  expression: 'neutral' | 'sad' | 'happy';
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
}

export interface ImageAsset {
  key: string;
  /** Caminho relativo a public/, sem barra no início, para respeitar o base do Vite. */
  path: string;
  placeholder: PlaceholderSpec;
}

const SPRITE_ASSETS: readonly ImageAsset[] = [
  {
    key: TextureKeys.Body,
    path: 'assets/sprites/body.png',
    placeholder: { width: 32, height: 40, color: 0x29adff },
  },
  {
    key: TextureKeys.Flag,
    path: 'assets/sprites/flag.png',
    placeholder: { width: 32, height: 96, color: 0x00e436 },
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

export const IMAGE_ASSETS: readonly ImageAsset[] = [...SPRITE_ASSETS, ...HEAD_ASSETS];

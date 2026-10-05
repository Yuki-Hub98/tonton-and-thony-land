import { TextureKeys, type TextureKey } from './keys';

/** Forma colorida usada no lugar da imagem enquanto não existe arte real. */
export interface PlaceholderSpec {
  width: number;
  height: number;
  color: number;
}

export interface ImageAsset {
  key: TextureKey;
  /** Caminho relativo a public/, sem barra no início, para respeitar o base do Vite. */
  path: string;
  placeholder: PlaceholderSpec;
}

export const IMAGE_ASSETS: readonly ImageAsset[] = [
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
    key: TextureKeys.Ground,
    path: 'assets/tiles/ground.png',
    placeholder: { width: 32, height: 32, color: 0xab5236 },
  },
];

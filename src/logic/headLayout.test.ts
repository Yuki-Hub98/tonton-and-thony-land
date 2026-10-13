import { describe, expect, it } from 'vitest';
import {
  headCropBelowChin,
  headFaceRegion,
  headLayout,
  headLayoutInBox,
  type HeadPhoto,
} from './headLayout';

const SQUARE: HeadPhoto = { shape: 'square' };
const WITH_HAIR: HeadPhoto = { shape: 'withHair', headHeight: 290, chinY: 290 };
const SQUARE_TEXTURE = { width: 256, height: 256 };
const HAIR_TEXTURE = { width: 284, height: 512 };
/** Placeholder desenhado enquanto a foto não existe. */
const PLACEHOLDER = { width: 64, height: 64 };

describe('headLayout (cabeça na fase)', () => {
  it('quadrada: vira um quadrado do tamanho do rosto, com origem no queixo (embaixo)', () => {
    const layout = headLayout(SQUARE, 44, SQUARE_TEXTURE);
    expect(SQUARE_TEXTURE.width * layout.scaleX).toBeCloseTo(44);
    expect(SQUARE_TEXTURE.height * layout.scaleY).toBeCloseTo(44);
    expect(layout).toMatchObject({ originX: 0.5, originY: 1 });
  });

  it('com cabelo: o rosto (topo até o queixo) fica do tamanho da cabeça quadrada', () => {
    const layout = headLayout(WITH_HAIR, 44, HAIR_TEXTURE);
    expect(290 * layout.scaleY).toBeCloseTo(44);
  });

  it('com cabelo: mantém a proporção da foto (não estica)', () => {
    const layout = headLayout(WITH_HAIR, 44, HAIR_TEXTURE);
    expect(layout.scaleX).toBe(layout.scaleY);
    expect(HAIR_TEXTURE.width * layout.scaleX).toBeCloseTo(43.1, 1);
    expect(HAIR_TEXTURE.height * layout.scaleY).toBeCloseTo(77.7, 1);
  });

  it('com cabelo: a origem fica no queixo, e o cabelo pende abaixo dele', () => {
    const layout = headLayout(WITH_HAIR, 44, HAIR_TEXTURE);
    expect(layout.originX).toBe(0.5);
    expect(layout.originY).toBeCloseTo(290 / 512);
    const hairBelowChin = HAIR_TEXTURE.height * (1 - layout.originY) * layout.scaleY;
    expect(hairBelowChin).toBeCloseTo(33.7, 1);
  });

  it('com cabelo: fotos de alturas diferentes deixam o rosto no mesmo lugar e tamanho', () => {
    // As fotos são alinhadas pelos olhos; uma delas tem mais cabelo embaixo.
    const short = headLayout(WITH_HAIR, 44, HAIR_TEXTURE);
    const tall = headLayout(WITH_HAIR, 44, { width: 284, height: 580 });
    expect(tall.scaleY).toBe(short.scaleY);
    // Distância do queixo até o topo da imagem, na tela.
    expect(580 * tall.originY * tall.scaleY).toBeCloseTo(512 * short.originY * short.scaleY);
  });

  it('com cabelo, mas a imagem é o placeholder pequeno: trata como quadrada', () => {
    expect(headLayout(WITH_HAIR, 44, PLACEHOLDER)).toEqual(headLayout(SQUARE, 44, PLACEHOLDER));
  });
});

describe('headLayoutInBox (cabeça nos menus)', () => {
  it('quadrada: igual a antes, um quadrado de faceSize com origem no centro', () => {
    const layout = headLayoutInBox(SQUARE, 160, 250, SQUARE_TEXTURE);
    expect(SQUARE_TEXTURE.width * layout.scaleX).toBeCloseTo(160);
    expect(SQUARE_TEXTURE.height * layout.scaleY).toBeCloseTo(160);
    expect(layout).toMatchObject({ originX: 0.5, originY: 0.5 });
  });

  it('com cabelo: se couber, o rosto tem o mesmo tamanho da quadrada', () => {
    const layout = headLayoutInBox(WITH_HAIR, 44, 1000, HAIR_TEXTURE);
    expect(290 * layout.scaleY).toBeCloseTo(44);
  });

  it('com cabelo: se não couber, diminui até a foto inteira caber na altura, sem esticar', () => {
    const layout = headLayoutInBox(WITH_HAIR, 160, 250, HAIR_TEXTURE);
    expect(HAIR_TEXTURE.height * layout.scaleY).toBeCloseTo(250);
    expect(layout.scaleX).toBe(layout.scaleY);
  });
});

describe('headCropBelowChin (cabelo dentro do carro)', () => {
  it('com cabelo: corta o que passa do limite abaixo do queixo', () => {
    const scale = 44 / 290;
    const region = headCropBelowChin(WITH_HAIR, HAIR_TEXTURE, scale, 17);
    expect(region).toMatchObject({ x: 0, y: 0, width: 284 });
    expect((region.height - 290) * scale).toBeCloseTo(17);
  });

  it('com cabelo: se o cabelo já cabe, mostra a foto inteira', () => {
    expect(headCropBelowChin(WITH_HAIR, HAIR_TEXTURE, 44 / 290, 500).height).toBe(512);
  });

  it('nunca corta o rosto, mesmo com limite negativo', () => {
    expect(headCropBelowChin(WITH_HAIR, HAIR_TEXTURE, 44 / 290, -10).height).toBe(290);
  });

  it('quadrada: aparece inteira (não há nada abaixo do queixo)', () => {
    expect(headCropBelowChin(SQUARE, SQUARE_TEXTURE, 44 / 256, 0)).toEqual({
      x: 0,
      y: 0,
      width: 256,
      height: 256,
    });
  });
});

describe('headFaceRegion (ícone de vida)', () => {
  it('com cabelo: só do topo até o queixo', () => {
    expect(headFaceRegion(WITH_HAIR, HAIR_TEXTURE)).toEqual({
      x: 0,
      y: 0,
      width: 284,
      height: 290,
    });
  });

  it('quadrada: a foto inteira', () => {
    expect(headFaceRegion(SQUARE, SQUARE_TEXTURE)).toEqual({
      x: 0,
      y: 0,
      width: 256,
      height: 256,
    });
  });

  it('com cabelo, mas a imagem é o placeholder: a imagem inteira', () => {
    expect(headFaceRegion(WITH_HAIR, PLACEHOLDER)).toEqual({ x: 0, y: 0, width: 64, height: 64 });
  });
});

import { describe, expect, it } from 'vitest';
import indexHtml from '../../index.html?raw';
import packageJson from '../../package.json';
import { TEXTS } from './texts';

describe('nome do jogo', () => {
  it('usa exatamente a grafia "Tonton and Thony Land"', () => {
    expect(TEXTS.gameTitle).toBe('Tonton and Thony Land');
  });

  it('é o mesmo no <title> do index.html', () => {
    expect(indexHtml).toContain(`<title>${TEXTS.gameTitle}</title>`);
  });

  it('aparece no name do package.json em kebab-case', () => {
    expect(packageJson.name).toBe('tonton-and-thony-land');
  });

  it('mantém o index.html fora dos buscadores', () => {
    expect(indexHtml).toMatch(/<meta name="robots" content="noindex, nofollow"/);
  });
});

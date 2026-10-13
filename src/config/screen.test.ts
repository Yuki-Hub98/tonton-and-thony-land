import { describe, expect, it } from 'vitest';
import indexHtml from '../../index.html?raw';
import { PORTRAIT_TOUCH_QUERY } from './screen';

describe('aviso "gire o celular"', () => {
  it('o index.html tem o elemento do aviso', () => {
    expect(indexHtml).toContain('id="rotate-warning"');
  });

  it('o CSS usa a mesma regra que o jogo usa para pausar', () => {
    expect(indexHtml).toContain(`@media ${PORTRAIT_TOUCH_QUERY}`);
  });
});

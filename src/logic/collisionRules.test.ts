import { describe, expect, it } from 'vitest';
import { hasFallenOut, isStomp, overlapsWithInset, type Rect } from './collisionRules';

describe('isStomp', () => {
  const base = { playerVelocityY: 300, playerPrevBottom: 400, enemyTop: 400, tolerance: 8 };

  it('caindo com os pés acima da cabeça do inimigo é pisão', () => {
    expect(isStomp(base)).toBe(true);
  });

  it('aceita os pés um pouco abaixo do topo, dentro da folga', () => {
    expect(isStomp({ ...base, playerPrevBottom: 408 })).toBe(true);
  });

  it('encostar de lado (pés abaixo da folga) não é pisão', () => {
    expect(isStomp({ ...base, playerPrevBottom: 409 })).toBe(false);
  });

  it('subindo ou parado não é pisão', () => {
    expect(isStomp({ ...base, playerVelocityY: -200 })).toBe(false);
    expect(isStomp({ ...base, playerVelocityY: 0 })).toBe(false);
  });
});

describe('hasFallenOut', () => {
  it('só conta quando o corpo inteiro passou da base do mundo', () => {
    expect(hasFallenOut(500, 544)).toBe(false);
    expect(hasFallenOut(544, 544)).toBe(false);
    expect(hasFallenOut(545, 544)).toBe(true);
  });
});

describe('overlapsWithInset', () => {
  const tile: Rect = { left: 100, top: 100, right: 132, bottom: 132 };

  it('detecta quem está em cima do tile', () => {
    expect(overlapsWithInset({ left: 105, top: 90, right: 125, bottom: 120 }, tile, 6)).toBe(true);
  });

  it('ignora quem só raspa na beirada', () => {
    expect(overlapsWithInset({ left: 70, top: 100, right: 104, bottom: 132 }, tile, 6)).toBe(false);
    expect(overlapsWithInset({ left: 100, top: 60, right: 132, bottom: 105 }, tile, 6)).toBe(false);
  });

  it('sem folga, encostar já conta', () => {
    expect(overlapsWithInset({ left: 70, top: 100, right: 104, bottom: 132 }, tile, 0)).toBe(true);
  });

  it('retângulos separados não se cruzam', () => {
    expect(overlapsWithInset({ left: 0, top: 0, right: 50, bottom: 50 }, tile, 0)).toBe(false);
  });
});

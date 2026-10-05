import Phaser from 'phaser';
import { BootScene } from '../scenes/BootScene';
import { GameOverScene } from '../scenes/GameOverScene';
import { GameScene } from '../scenes/GameScene';
import { HUDScene } from '../scenes/HUDScene';
import { LevelCompleteScene } from '../scenes/LevelCompleteScene';
import { PreloadScene } from '../scenes/PreloadScene';
import { SelectScene } from '../scenes/SelectScene';
import { TitleScene } from '../scenes/TitleScene';
import { BACKGROUND_COLOR, GAME_HEIGHT, GAME_WIDTH, GRAVITY_Y } from './constants';

export const gameConfig: Phaser.Types.Core.GameConfig = {
  // AUTO usa WebGL quando o navegador suporta e cai para Canvas quando não.
  type: Phaser.AUTO,
  parent: 'game',
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: BACKGROUND_COLOR,
  scale: {
    // FIT aumenta/diminui o jogo mantendo a proporção 16:9; CENTER_BOTH centraliza.
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: GRAVITY_Y },
      debug: false,
    },
  },
  // A primeira cena da lista é a que inicia. A ordem também é a de desenho:
  // HUDScene vem depois da GameScene para aparecer por cima dela.
  scene: [
    BootScene,
    PreloadScene,
    TitleScene,
    SelectScene,
    GameScene,
    HUDScene,
    LevelCompleteScene,
    GameOverScene,
  ],
};

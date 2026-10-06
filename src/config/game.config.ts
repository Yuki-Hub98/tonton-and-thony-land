import Phaser from 'phaser';
import { BootScene } from '../scenes/BootScene';
import { ContinueScene } from '../scenes/ContinueScene';
import { GameOverScene } from '../scenes/GameOverScene';
import { GameScene } from '../scenes/GameScene';
import { HUDScene } from '../scenes/HUDScene';
import { LevelCompleteScene } from '../scenes/LevelCompleteScene';
import { PreloadScene } from '../scenes/PreloadScene';
import { SelectScene } from '../scenes/SelectScene';
import { TitleScene } from '../scenes/TitleScene';
import { VictoryScene } from '../scenes/VictoryScene';
import { BACKGROUND_COLOR, GAME_HEIGHT, GRAVITY_Y, TOUCH_MAX_POINTERS } from './constants';
import { currentGameWidth } from './screen';

export const gameConfig: Phaser.Types.Core.GameConfig = {
  // AUTO usa WebGL quando o navegador suporta e cai para Canvas quando não.
  type: Phaser.AUTO,
  parent: 'game',
  width: currentGameWidth(),
  height: GAME_HEIGHT,
  backgroundColor: BACKGROUND_COLOR,
  scale: {
    // FIT aumenta/diminui o jogo mantendo a proporção; como a largura já segue a tela,
    // o jogo a preenche inteira. CENTER_BOTH centraliza o que sobrar fora do mínimo/máximo.
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  // Por padrão o Phaser acompanha um dedo só; os botões de toque precisam de vários.
  input: { activePointers: TOUCH_MAX_POINTERS },
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
    ContinueScene,
    GameScene,
    HUDScene,
    LevelCompleteScene,
    GameOverScene,
    VictoryScene,
  ],
};

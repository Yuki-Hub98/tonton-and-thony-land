// Textos exibidos na tela. Ficam juntos para facilitar revisar ou trocar.

export const TEXTS = {
  gameTitle: 'Tonton and Thony Land',
  pressStart: 'Toque na tela ou aperte Espaço',
  chooseCharacter: 'Quem vai jogar?',
  selectHint: '← → para escolher  •  Espaço para começar',
  levelComplete: (levelName: string) => `${levelName} concluída!`,
  pressContinue: 'Toque na tela ou aperte Espaço para continuar',
  gameOver: 'Fim de jogo',
  tryAgain: 'Tentar de novo',
  changeCharacter: 'Trocar personagem',
  menuHint: '← → para escolher  •  Espaço para confirmar',
  rotateDevice: 'Gire o celular para jogar',
  continueQuestion: 'Continuar de onde parou?',
  continueFrom: (levelName: string) => `Continuar: ${levelName}`,
  startOver: 'Começar do início',
  victory: 'Você venceu!',
  playAgain: 'Toque ou aperte Espaço para jogar de novo',
} as const;

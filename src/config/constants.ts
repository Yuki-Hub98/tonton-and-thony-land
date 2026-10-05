// Números do jogo. Ajuste a dificuldade e o visual mexendo só aqui.

/** Resolução lógica do jogo. O Phaser escala esse tamanho para caber na tela. */
export const GAME_WIDTH = 960;
export const GAME_HEIGHT = 540;

export const BACKGROUND_COLOR = '#1d2b53';

/** Gravidade da física arcade, em pixels por segundo². */
export const GRAVITY_Y = 1200;

/** Espera entre tocar a bandeira e ir para a tela de fase concluída. */
export const LEVEL_COMPLETE_DELAY_MS = 800;

/** Pulinho da cabeça na tela de fase concluída. */
export const CELEBRATE_HOP_HEIGHT = 20;
export const CELEBRATE_HOP_MS = 350;

/** Barra de progresso da PreloadScene. */
export const PRELOAD_BAR_WIDTH = 400;
export const PRELOAD_BAR_HEIGHT = 24;

/** Tamanho de um bloco de chão/plataforma, em pixels. */
export const TILE_SIZE = 32;

/** Velocidade horizontal do jogador, em pixels por segundo. */
export const PLAYER_SPEED = 220;
/** Impulso do pulo (negativo = para cima), em pixels por segundo. */
export const PLAYER_JUMP_VELOCITY = -620;
/** Ao soltar o pulo ainda subindo, a velocidade é multiplicada por isto (pulo baixo). */
export const JUMP_CUT_FACTOR = 0.45;

/** Vidas no começo do jogo. Elas passam de uma fase para a outra. */
export const STARTING_LIVES = 3;
/** Invencibilidade depois de voltar à fase (o jogador fica piscando). */
export const INVINCIBLE_MS = 2000;
/** Velocidade do pisca-pisca da invencibilidade (meio ciclo). */
export const BLINK_MS = 100;
/** Tempo entre morrer e voltar à fase (ou ir para o game over). */
export const DEATH_DELAY_MS = 1500;
/** Pulinho da morte, antes de cair para fora da tela. */
export const DEATH_JUMP_VELOCITY = -450;

/** Velocidade do inimigo que anda. */
export const ENEMY_SPEED = 60;
/** Pulinho do jogador ao pisar num inimigo. */
export const STOMP_BOUNCE_VELOCITY = -380;
/** Folga (px) para contar como pisão: pés um pouco abaixo do topo do inimigo ainda valem. */
export const STOMP_TOLERANCE = 10;
/** Tempo do inimigo amassado antes de sumir. */
export const ENEMY_SQUASH_MS = 250;
/** Os espinhos machucam só a parte de dentro do tile: raspar na beirada não conta. */
export const HAZARD_INSET = 6;

/** HUD: ícones de vida no canto da tela. */
export const HUD_MARGIN = 16;
export const HUD_LIFE_ICON_SIZE = 36;
export const HUD_LIFE_ICON_GAP = 6;

/** Botões da tela de game over. */
export const MENU_BUTTON_WIDTH = 320;
export const MENU_BUTTON_HEIGHT = 72;
export const MENU_BUTTON_GAP = 40;

/** Posição do jogador na tela quando a câmera anda: 0 = borda esquerda, 1 = direita. */
export const CAMERA_LEAD_RATIO = 0.4;

/** Tamanho da cabeça na tela, em pixels (a foto é redimensionada para isso). */
export const HEAD_SIZE = 44;
/** Quanto a cabeça desce sobre o corpo, para parecer encaixada (pescoço). */
export const HEAD_OVERLAP_Y = 4;
/** Tamanho da cabeça desenhada como placeholder enquanto não há foto. */
export const HEAD_PLACEHOLDER_SIZE = 64;

/** Tempo de cada foto no slide da cabeça normal. */
export const IDLE_SLIDE_MS = 1500;
/** Quanto tempo a cabeça fica feliz depois de pegar um item. */
export const HAPPY_DURATION_MS = 2500;
/** Quanto tempo a cabeça fica triste depois de levar dano (sem morrer). */
export const SAD_DURATION_MS = 1500;

/** Tempo do pisca-pisca do "toque para começar", em ms (meio ciclo). */
export const PROMPT_BLINK_MS = 700;

/** Cartões da tela de seleção de personagem. */
export const SELECT_CARD_WIDTH = 260;
export const SELECT_CARD_HEIGHT = 300;
export const SELECT_CARD_GAP = 80;
export const SELECT_HEAD_SIZE = 160;
/** O cartão escolhido cresce um pouco para destacar. */
export const SELECT_CARD_FOCUS_SCALE = 1.08;
export const SELECT_CARD_TWEEN_MS = 120;

/** Cores da interface. */
export const UI_HIGHLIGHT_COLOR = 0xffec27;
export const UI_DIM_COLOR = 0x5f6b99;
export const UI_CARD_COLOR = 0x29366f;

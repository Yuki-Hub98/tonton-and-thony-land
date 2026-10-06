// Números do jogo. Ajuste a dificuldade e o visual mexendo só aqui.

/**
 * Resolução lógica do jogo. A altura é fixa; a largura acompanha a proporção da tela
 * (ver logic/screenSize.ts), entre o mínimo (tablet 4:3) e o máximo (celular bem comprido).
 * Nas cenas, use this.scale.width para saber a largura atual.
 */
export const GAME_HEIGHT = 540;
export const GAME_MIN_WIDTH = 720;
export const GAME_MAX_WIDTH = 1280;

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
/** Inimigo derrotado pelo golpe: voa de cabeça para baixo e some. */
export const ENEMY_KNOCKOUT_DISTANCE = 48;
export const ENEMY_KNOCKOUT_HEIGHT = 40;
export const ENEMY_KNOCKOUT_MS = 350;

/** Golpe com o equipamento: alcance à frente do corpo (px) e espera entre um golpe e outro. */
export const ATTACK_REACH = 40;
export const ATTACK_COOLDOWN_MS = 300;

/** Item na mão: altura na tela, altura da mão (fração do corpo, a partir dos pés) e ângulos. */
export const HAND_ITEM_HEIGHT = 40;
export const HAND_HEIGHT_RATIO = 0.55;
/** Inclinação do item parado (graus): a ponta vai um pouco para a frente. */
export const HAND_ITEM_REST_ANGLE = 25;
/** Até onde o item gira no golpe (graus) e quanto tempo leva para ir (a volta leva o mesmo). */
export const HAND_ITEM_SWING_ANGLE = 110;
export const HAND_ITEM_SWING_MS = 90;

/** Carrinho: velocidade da direção automática até a bandeira. */
export const CAR_SPEED = 260;
/** Cabeça dentro do carro: quanto desce sobre ele e o deslocamento para trás (banco do motorista). */
export const CAR_HEAD_OVERLAP_Y = 16;
export const CAR_HEAD_OFFSET_X = -6;

/** Item coletável: sobe e desce parado no lugar, e some subindo ao ser pego. */
export const PICKUP_BOB_HEIGHT = 6;
export const PICKUP_BOB_MS = 600;
export const PICKUP_COLLECT_RISE = 24;
export const PICKUP_COLLECT_MS = 250;

/** HUD: ícones de vida no canto da tela. */
export const HUD_MARGIN = 16;
export const HUD_LIFE_ICON_SIZE = 36;
export const HUD_LIFE_ICON_GAP = 6;
/** HUD: altura do ícone do equipamento, no canto superior direito. */
export const HUD_EQUIPMENT_ICON_HEIGHT = 40;

/** Botões de toque (só em aparelho com toque): tamanho, distância da borda e entre eles. */
export const TOUCH_BUTTON_SIZE = 96;
export const TOUCH_BUTTON_MARGIN = 24;
export const TOUCH_BUTTON_GAP = 20;
/** Transparência: solto, apertado e o "bater" antes de pegar o equipamento. */
export const TOUCH_BUTTON_ALPHA = 0.35;
export const TOUCH_BUTTON_PRESSED_ALPHA = 0.7;
export const TOUCH_BUTTON_DISABLED_ALPHA = 0.12;
/** Dedos ao mesmo tempo (ex.: segurar "direita" e tocar "pular"). */
export const TOUCH_MAX_POINTERS = 3;

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

/** Altura (fração da tela) do "toque para começar": no meio sem arte, embaixo com a arte. */
export const TITLE_PROMPT_Y_RATIO = 0.68;
export const TITLE_PROMPT_Y_RATIO_WITH_ART = 0.94;

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

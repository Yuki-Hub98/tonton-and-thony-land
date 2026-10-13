# 🏁 Tonton and Thony Land

Um jogo de plataforma feito em casa, com muito amor e um pouco de birra.

A **Tonton**, a irmã mais velha, e o **Thony**, o caçula, estrearam no seu próprio videogame! Escolha um dos dois irmãos e atravesse três fases cheias de obstáculos, pulos e inimigos até chegar na bandeira.

Pegue o equipamento de combate para poder bater (a Tonton luta de vassoura, e o Thony de vassoura e pá!) e, na última fase, encontre o carrinho mágico: com ele você fica invencível e acelera direto até a bandeira.

Mas cuidado: se levar dano, a carinha muda. E ninguém quer ver a Tonton triste ou o Thony fazendo birra. 😤

## 🎮 Como jogar

| Ação  | Teclado    | Celular/tablet |
| ----- | ---------- | -------------- |
| Andar | ← → ou A D | Botões ◀ ▶     |
| Pular | Espaço     | Botão pular    |
| Bater | J ou X     | Botão bater    |

No celular, jogue com a tela deitada (o jogo pausa e avisa se o celular ficar em pé).

O progresso fica salvo no aparelho: escolha o mesmo personagem de novo para continuar da última fase alcançada.

## 👧👦 Personagens

|             | Tonton            | Thony          |
| ----------- | ----------------- | -------------- |
| Quem é      | A irmã mais velha | O irmão caçula |
| Equipamento | Vassoura          | Vassoura e pá  |

## 🛠️ Feito com

Phaser 3 · TypeScript · Vite · Vitest · GitHub Actions · GitHub Pages

## 💻 Rodando localmente

```bash
npm install
npm run dev
```

Para abrir no celular pela rede de casa: `npm run dev -- --host`.

## 🌿 Fluxo de desenvolvimento

- `main`: versão publicada. Todo merge aqui faz deploy automático no GitHub Pages.
- `develop`: desenvolvimento. Todas as branches de trabalho saem daqui.
- `feature/*`, `fix/*`, `chore/*`: branches de trabalho, com PR para a `develop`.

Todo PR passa por lint, checagem de tipos, testes e build no GitHub Actions antes do merge.

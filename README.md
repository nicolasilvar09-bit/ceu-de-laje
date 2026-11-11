# Céu de Laje

Protótipo de jogo de pipa em mundo aberto, roda no navegador do PC e do celular (Three.js).

Sobe a pipa da laje, cruza com a linha dos outros e puxa pra relar. Pipa cortada cai devagar arrastando a linha: corre pelos telhados, pega a linha (ou usa a vara de bambu) e recolhe até a mão.

## Jogar
- Online: GitHub Pages deste repositório (`index.html`).
- Local: `node serve.js` e abra http://localhost:5178

## Controles
| | PC | Celular |
|---|---|---|
| Comandar o bico da pipa | WASD | joystick (esquerda) |
| Puxar / dar linha / recolher | mouse esq. / mouse dir. / rodinha ou L | ▲ / ▼ / RECOLHER |
| Modo pipa ⇄ andar | C | botão ANDAR/PIPA |
| Câmera (ombro, 1ª, 3ª, longe) | V | botão CÂMERA |
| Bike / carro | F entra e sai, Espaço = grau | botão ENTRAR/SAIR, GRAU |
| Vara de bambu | B | botão VARA |
| Montar pipa nova | R | botão MONTAR |

## Online
Sala única ("praça") pelo Supabase Realtime do projeto paintball (separado do NK), com a chave publicável e canal de broadcast, sem tabelas. Cada jogador manda no máximo 4 atualizações por segundo e só quando algo muda.
O estado enviado inclui posição, veículo e pipa. Cada um é dono da própria pipa: o cruzo é calculado nos dois lados, mas só o dono corta a própria linha e avisa a sala. Quem apara uma pipa avisa a sala, e ela some pros outros.
Salas: "Criar sala" gera um código de 4 letras e um link (`?sala=CODIGO`); os amigos entram pelo código ou pelo link. Quem entrou primeiro é o dono da sala e roda os bots: todos veem os mesmos bots, e se o dono sair o próximo assume. Quanto mais gente na sala, menos vezes cada um manda o estado (de 4 até ~0,8 por segundo), pra caber no limite grátis de ~100 mensagens/s.
Só funciona no link do GitHub Pages; o link do Claude bloqueia conexões externas.

## Sistemas
Cruzo com linhas que se encostam no ponto real, força de corte por linha (10, 24, Pro), desafio Vs, loja (formato, estampa, linha), dinheiro, aparar pela linha, bike com grau, carro, câmeras em 1ª e 3ª pessoa, morros, grafites e murais gerados pelo jogo.

## Arquivos
- `ceu-de-laje.html`: fonte do jogo. `node build.js` gera o `index.html`.
- `assets/web/`: personagens (glTF em JSON) e céu prontos pro navegador.
- `assets/tex/`: texturas (Poly Haven, CC0).
- `assets/people/`, `assets/sky_*.hdr`: originais (Rocketbox FBX, HDRI) pra regerar ou usar na versão Unity.
- `convert.html`: converte os originais pra web (abrir via `serve.js`).

Créditos e licenças em [CREDITOS.md](CREDITOS.md).

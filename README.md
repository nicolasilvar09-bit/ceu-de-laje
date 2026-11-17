# Céu de Laje

## Direção visual 1.2.0

A identidade visual combina proporções e cenários realistas com uma direção de arte própria inspirada na cultura urbana brasileira: paleta azul-petróleo, tons quentes de concreto e pôr do sol, acentos coral e amarelo de pipa. O tratamento de cor e a iluminação foram ajustados para reforçar essa assinatura sem adicionar efeitos pesados ao render.

Jogo de pipa em mundo aberto, feito com Three.js para navegador de computador e celular. Solte a pipa da laje, cruze linhas, dispute o céu, explore o bairro, ande de bicicleta ou carro e participe das salas online.

## Requisitos e execução

- Node.js 18 ou superior para gerar e servir a versão local.
- Não é necessário instalar dependências npm.

```bash
npm test       # auditoria estática dos scripts e assets
npm run build  # gera index.html a partir de ceu-de-laje.html
npm start      # abre o servidor local em http://127.0.0.1:5178
```

O servidor local gera o `index.html` ao iniciar. Para publicar no GitHub Pages, envie `index.html`, `manifest.webmanifest` e a pasta `assets/`.

## Controles

| Ação | PC | Celular |
|---|---|---|
| Comandar o bico da pipa | WASD | Joystick esquerdo |
| Puxar / dar linha / recolher | Mouse esquerdo / direito / rodinha ou L | ▲ / ▼ / RECOLHER |
| Modo pipa ⇄ andar | C | ANDAR/PIPA |
| Câmera | V | CÂMERA |
| Bike / carro | F entra e sai; Espaço = grau/freio | ENTRAR/SAIR; GRAU |
| Vara de bambu | B | VARA |
| Montar pipa nova | R | MONTAR |
| Abrir nível, missões e placar | M ou chip NÍVEL | Chip NÍVEL |

## Sistemas presentes

- Mundo aberto com campo, lajes, morros, grafites, murais e objetos de cenário.
- Pipas com formatos e estampas diferentes, vento, rabiola, linha, cruzo, nó, dibicada, aparada e corte.
- Personagens, NPCs, bicicletas, carros e câmeras.
- Loja, dinheiro, XP, níveis, missões diárias e eventos no céu.
- Salas online com Supabase Realtime, presença, sincronização de jogadores e bots.
- Preferências gráficas Alto, Médio e Baixo, com ajuste automático de resolução.

## Online e salvamento

O multiplayer utiliza Supabase Realtime com chave publicável no navegador. As salas são canais de broadcast/presença, sem tabelas de conta. O modo solo não exige conta, mas a primeira abertura precisa de internet para baixar Three.js e seus módulos pelos CDNs. O multiplayer também depende da conexão e do serviço Supabase.

Dinheiro, pipas, linhas compradas, nível e missões ficam salvos no `localStorage` do aparelho/navegador. O progresso não é compartilhado automaticamente entre dispositivos.

## Arquivos principais

- `ceu-de-laje.html`: fonte principal do jogo.
- `index.html`: página pronta para publicação, gerada por `node build.js`.
- `build.js`: compilação da página completa.
- `serve.js`: servidor local de desenvolvimento e conversão/upload de assets.
- `tools/audit.js`: verificações estáticas automatizadas.
- `assets/web/`: modelos glTF, objetos, céu e ícones usados no navegador.
- `assets/tex/`: texturas em resolução alta e versões 512 px para dispositivos móveis.
- `assets/people/` e `assets/sky_*.hdr`: arquivos originais de personagens e HDRI.
- `CREDITOS.md`: créditos e licenças dos assets.
- `AUDITORIA.md`: resultado, correções, limitações e instruções para repetir a auditoria.

## Créditos

Consulte `CREDITOS.md` para fontes e licenças dos modelos, texturas e imagens.

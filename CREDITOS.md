# Créditos dos assets — Céu de Laje (protótipo)

## Pessoas: Microsoft Rocketbox
- Fonte: https://github.com/microsoft/Microsoft-Rocketbox
- Licença: MIT. Copyright (c) Microsoft Corporation.
  A licença MIT exige manter este aviso de copyright e o texto da licença em cópias e distribuições.
  Antes de lançar o jogo, coloque o texto completo da licença (arquivo LICENSE do repositório) na tela de créditos.
- Usados: Male_Child_01, Male_Child_02, Female_Child_01, Male_Adult_04, Male_Adult_08
  e as animações m_idle_neutral_01, m_walk_neutral e m_run_neutral.
- Originais em `assets/people/` (FBX + texturas reduzidas para 512 px).
  Versão web (glTF em JSON) em `assets/web/`, gerada pela `convert.html`.

- O personagem do jogador (Male_Adult_04) usa texturas de 1024 px com mapa de relevo (normal), em `assets/people/hi/`.
- A `convert.html` reagrupa a malha por material e cria índice antes de exportar. Sem isso, o GLTFExporter (three r128)
  desenha a malha inteira com cada material e a textura da cabeça cobre o corpo todo.

## Texturas e céu: Poly Haven (CC0, sem necessidade de crédito)
- https://polyhaven.com/license
- Texturas: concrete_block_wall, red_brick_plaster_patch_02, rough_plaster_brick, painted_plaster_wall,
  worn_plaster_wall, concrete_floor_worn_001, asphalt_floor (1k, cor e normal), em `assets/tex/`.
- Céu: qwantani_noon_puresky (HDRI 2k), em `assets/sky_2k.hdr`, convertido para `assets/web/sky.jpg`.

## Como regerar a versão web
1. `node serve.js` (dentro de PipaPrototipo).
2. Abra http://localhost:5178/convert.html e espere aparecer "DONE".

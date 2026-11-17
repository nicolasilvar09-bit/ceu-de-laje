# Auditoria técnica — Céu de Laje

**Versão desta revisão:** 1.1.0  
**Data:** 17/11/2026  
**Escopo:** fonte HTML/JavaScript, persistência local, multiplayer, assets 3D, build e servidor local.

## Resultado

A auditoria estática foi concluída sem falhas. O comando `npm test` executa a mesma verificação automatizada.

Verificações aprovadas nesta revisão:

- Sintaxe dos 3 blocos JavaScript inline.
- IDs estáticos sem duplicidade e seletores estáticos `$()` com elemento correspondente.
- 17 arquivos glTF JSON válidos; referências locais a buffers e imagens conferidas.
- Arquivos essenciais do céu, texturas, ícones e manifesto PWA presentes.
- `index.html` reconstruído a partir da fonte atual.
- Verificações de proteção do feed, apelidos e payloads recebidos pela rede.
- Servidor local com validação de caminhos baseada em `path.relative` e conferência de caminho real.

## Correções aplicadas

### Segurança

- O feed de notificações não injeta mais elementos arbitrários: somente a marcação `<em>` sem atributos é preservada. Isso impede que apelidos e nomes remotos sejam interpretados como HTML executável.
- Apelidos são normalizados, limitados a 14 caracteres e têm caracteres de controle e delimitadores HTML removidos.
- Estados de jogadores, posições, veículos, pipas, cortes, aparadas, pedidos de VS e atualizações dos bots passam por validações básicas de tipo, tamanho e faixa numérica.
- Eventos globais e sincronização dos bots aceitam apenas mensagens identificadas como provenientes do host atualmente anunciado pela presença da sala.
- O servidor local bloqueia travessia de diretório, confere o caminho real para impedir escapes por links simbólicos e limita uploads a 50 MB e diretórios/extensões permitidos.

### Estabilidade

- O carregamento de progresso local agora tolera dados ausentes ou malformados, limita quantidades e valida formas, linhas e missões antes de aplicá-los.
- Falhas na inicialização do WebGL ou no carregamento da biblioteca Three.js deixam o botão de iniciar desabilitado e mostram uma mensagem mais clara.
- O servidor local gera `index.html` ao iniciar, evitando testar uma compilação antiga.
- O build escreve o arquivo temporário e o renomeia ao final, reduzindo o risco de deixar um `index.html` incompleto.

### Manutenção

- Adicionado `package.json` com comandos `build`, `start`, `audit` e `test`; não há dependências npm para instalar.
- Adicionado `tools/audit.js` para repetir verificações estáticas sem ferramentas externas.
- Adicionada esta documentação técnica e atualizadas as instruções de execução.

## Limitações que permanecem

1. **Dependências externas:** Three.js e seus módulos são carregados de CDNs; o Supabase JS também é externo. O jogo não é totalmente offline e a indisponibilidade desses serviços pode impedir recursos ou a inicialização. As fontes do Google também dependem de rede, mas são apenas visuais.
2. **Persistência:** dinheiro, inventário, nível e missões são salvos no `localStorage` do navegador. Não existe conta de jogador nem sincronização de progresso entre aparelhos.
3. **Multiplayer:** o Realtime é baseado em mensagens enviadas pelos clientes e o jogo não tem servidor autoritativo. As validações reduzem payloads inválidos e abuso acidental, mas não impedem trapaças deliberadas nem garantem integridade competitiva.
4. **Teste visual:** o ambiente desta auditoria não disponibilizou um contexto WebGL funcional no Chromium headless. Por isso, a renderização, os controles em aparelhos físicos, a física em tempo real e partidas multiplayer com duas contas precisam de teste manual em navegador real.
5. **Arquitetura:** a lógica principal ainda está concentrada em `ceu-de-laje.html`. A modularização deve ser feita em uma etapa própria, com testes de regressão, para não arriscar os sistemas existentes.

## Como repetir

Requer Node.js 18 ou superior.

```bash
npm test
npm run build
npm start
```

Abra `http://127.0.0.1:5178` para testar localmente. Para publicar no GitHub Pages, envie o `index.html` atualizado e a pasta `assets/`.

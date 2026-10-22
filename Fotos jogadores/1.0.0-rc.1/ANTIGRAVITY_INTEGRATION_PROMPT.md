# Prompt de Integração — Pelada PRO (para o agente com acesso ao repositório do app)

Você é um engenheiro sênior integrando o pacote **peladapro-handoff 1.0.0-rc.1**
(cards de jogadores) ao aplicativo **Pelada PRO** (Google Antigravity, deploy Vercel).
Este prompt é autossuficiente. **Inspecione o app real antes de qualquer mudança.**

## Restrições absolutas
- NÃO duplicar jogadores. NÃO apagar dados. NÃO sobrescrever notas/estatísticas.
- NÃO alterar o motor de sorteio/balanceamento.
- NÃO converter a escala 1–5 para 0–99 sem decisão explícita do responsável.
- NÃO fazer deploy. NÃO expor credenciais/segredos.
- NÃO assumir framework/persistência — descubra inspecionando o código.
- A nota é **dinâmica**; nunca embutir na imagem-base.
- `playerId` é a chave estável de associação.

## FASE 1 — Auditoria do aplicativo
Mapeie: framework (Next/React/Vue/…), estrutura de pastas, pasta `public/`,
rotas/telas, sistema de build, testes existentes, como assets são servidos.

## FASE 2 — Descoberta do modelo de dados
Encontre o modelo de **Player** (campos, id, nome), como/onde os jogadores são
persistidos (arquivo, estado, API, storage) e os IDs já existentes. Documente.

## FASE 3 — Backup
Faça backup dos dados/arquivos que serão tocados (cópia versionada local). Registre.

## FASE 4 — Importação dos assets
Copie `public/player-cards/` do pacote para o `/public` do app (ou equivalente).
Confirme que as URLs `/player-cards/v1/...` resolvem. Verifique alpha real (sem
fundo branco/checkerboard). Não recompacte de forma destrutiva.

## FASE 5 — Migração segura de playerId/cardId
- Se o app já tem jogadores: preencha `data/player-mapping-template.csv`
  (`existingAppId → matchedPlayerId`) usando `player-aliases.v1.json`.
- Aliases **ambíguos** (ex.: `thiago`, `faria`) → apresente para revisão humana,
  **não** resolva sozinho. `gabriel` mapeia só para `gabriel`.
- Não crie jogador novo se já existir equivalente. Preserve IDs existentes;
  guarde `cardId = playerId` do pacote como referência de carta.

## FASE 6 — Implementação do PlayerCard
Implemente/reuse um componente de carta:
- use `adapters/vanilla/player-card.js` (qualquer stack) ou `adapters/react/PlayerCard.tsx`;
- posicione a nota pelo `ratingSlot` (percentuais); responsivo; acessível (alt/aria).

## FASE 7 — Média dinâmica
Renderize a nota **por cima** da carta a partir do dado do app (1–5, 1 casa,
vírgula em pt-BR). Ausente → não mostrar o elemento. Nunca regenerar a imagem.

## FASE 8 — Integração nas telas (prioritárias)
- cadastro/lista de jogadores;
- times formados (sorteio);
- perfil/detalhe do jogador;
- estatísticas;
- destaques.
Preserve notas, posições e estatísticas já existentes no app.

## FASE 9 — Testes
Rode os testes do app; adicione testes de: associação por playerId, render da nota,
nota ausente oculta, transparência preservada, sem duplicação de jogadores.

## FASE 10 — Evidências e relatório
Capture screenshots das telas com as cartas, gere um relatório de migração
(o que mudou, mapeamento de IDs, ambiguidades pendentes, testes) e liste
decisões que precisam de aprovação humana (ex.: nomes pendentes, escala 0–99).

## Aceite
Cartas aparecem nas telas prioritárias, associadas corretamente, com nota dinâmica;
nenhum jogador duplicado; nenhuma nota/estatística sobrescrita; nenhum deploy;
relatório + screenshots entregues.

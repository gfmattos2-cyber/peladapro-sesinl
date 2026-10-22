---
name: peladapro-card-integration
description: Integra o pacote de cards peladapro-handoff ao app Pelada PRO, associando por playerId, renderizando a nota dinamicamente e sem duplicar/sobrescrever dados. Use ao importar as cartas dos jogadores para o app.
---

# Skill: Integração de Cards Pelada PRO

Objetivo: incorporar as 18 cartas (PNG/WebP com alpha) e o contrato de dados ao
app **Pelada PRO**, de forma **segura, idempotente e reversível**. Esta skill NÃO
contém credenciais e NUNCA faz deploy.

## Antes de tudo — inspecione o app real
1. Descubra o **framework** e a pasta `public/` (ou equivalente de assets estáticos).
2. Encontre o **modelo de Player** e como os jogadores são **persistidos** (não assuma).
3. Liste os **IDs existentes** de jogadores.

## Passos
1. **Copiar assets**: `public/player-cards/` → `/public` do app. Verifique alpha real
   (sem checkerboard/branco) com `scripts/validate-handoff.py`.
2. **Carregar contrato**: `data/cards-manifest.v1.json` (primário). Associe por `playerId`.
3. **Migração de IDs**: use `data/player-aliases.v1.json` só para casar IDs existentes.
   - **Não** duplique jogadores. **Não** sobrescreva notas/posições/estatísticas.
   - Aliases `ambiguous` (ex.: `thiago`, `faria`) → **revisão humana**.
   - `gabriel` mapeia somente para `gabriel`. Nomes pendentes (`gabriel/custodio/dans/max`)
     → sinalize; não invente.
4. **Componente**: use `adapters/vanilla/player-card.js` ou `adapters/react/PlayerCard.tsx`.
5. **Nota dinâmica**: renderize `technicalRating` (1–5, 1 casa, vírgula) no `ratingSlot`.
   Ausente → não mostrar. **Nunca** converter 1–5 → 0–99. **Nunca** embutir na imagem.
6. **Telas**: lista de jogadores, times formados, perfil, estatísticas, destaques.
7. **Testes + evidências**: rode os testes; capture screenshots; gere relatório de migração.

## Nunca
- Duplicar jogadores; apagar/sobrescrever dados; alterar o motor de sorteio;
  converter escalas sem decisão; fazer deploy; expor credenciais; assumir persistência.

## Referências
- `references/DATA_CONTRACT.md` — formato do manifesto/seed/aliases/slot.
- `references/MIGRATION_GUIDE.md` — como casar IDs sem duplicar.
- `references/RATING_OVERLAY.md` — como posicionar/formatar a nota.

## Validação
`python scripts/validate-handoff.py <pasta-do-pacote>` verifica assets, alpha,
schemas, URLs e checksums (sem dependências externas além do stdlib + Pillow opcional).

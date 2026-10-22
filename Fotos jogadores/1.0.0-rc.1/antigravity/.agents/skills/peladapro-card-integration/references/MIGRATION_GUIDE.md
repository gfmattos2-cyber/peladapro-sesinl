# Guia de Migração (sem duplicar jogadores)

## Objetivo
Associar os jogadores existentes no Pelada PRO aos `playerId` do pacote **sem**
criar duplicatas nem sobrescrever dados.

## Passos
1. Extraia a lista de jogadores do app (id + nome).
2. Para cada jogador, normalize o nome (minúsculo, sem acento) e procure em
   `player-aliases.v1.json`:
   - `status: "unique"` → `matchedPlayerId` direto.
   - `status: "ambiguous"` → **NÃO** decidir; marcar `reviewStatus=needs_human`.
   - sem alias → `reviewStatus=unmatched` (pode ser jogador só do app; **manter**).
3. Preencha `data/player-mapping-template.csv`:
   `existingAppId, existingAppName, normalizedName, matchedPlayerId, matchMethod,
   matchConfidence, reviewStatus, notes`.
4. Só aplique o mapeamento após revisão. **Preserve** IDs e dados existentes do app;
   associe a carta via `cardId = matchedPlayerId`.

## Não faça
- Não renomeie jogadores existentes com base no pacote.
- Não apague jogadores que não casaram.
- Não resolva ambiguidades automaticamente (`thiago`, `faria`, etc.).
- Não trate `gabriel` como Gabriel Kaka/Lobão.

## Nomes pendentes
`gabriel, custodio, dans, max` estão `pending`. Se o app tiver nomes melhores,
proponha ao responsável; não sobrescreva sem confirmação.

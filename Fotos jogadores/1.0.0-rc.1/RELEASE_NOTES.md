# Release Notes — peladapro-handoff 1.0.0-rc.1

**Status:** release-candidate (há nomes pendentes de confirmação humana).

## Conteúdo
- 18 cartas finais (PNG + WebP + thumbnail WebP), **fundo transparente real (RGBA)**.
- `cards-manifest.v1.json` com `ratingSlot` percentual (acima da bandeira do Brasil).
- `players-seed.v1.json` (seed mínimo, **sem** notas/posições de linha).
- `player-aliases.v1.json` (aliases para migração; ambíguos marcados).
- JSON Schemas, tipos TS, adapters (vanilla + React), demo estático.
- Skill e prompt para integração via Google Antigravity.
- `database/` (SQLite/JSON/SQL) como referência auxiliar.

## Escalas de nota
- Nota técnica do app: **1–5** (dinâmica, pode ter decimal).
- `legacyOverallRating` (0–99) é **histórico** e **não** deve ser convertido automaticamente.

## Pendências (impedem promover para stable)
- Confirmar nomes: `gabriel` (nome completo), `custodio` (acento?), `dans`, `max` (apelidos?).

## Garantias
- Cartas-fonte (`../figurinhas/cards`) e `assets/final_cards/native` **inalteradas**.
- Nenhuma nota inventada. Nenhuma chamada externa. Nenhum deploy.

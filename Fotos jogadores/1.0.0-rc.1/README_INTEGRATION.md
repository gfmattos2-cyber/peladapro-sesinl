# Pelada PRO — Pacote de Integração de Cards (1.0.0-rc.1)

Pacote **autossuficiente e framework-agnóstico** com as 18 cartas dos jogadores,
contratos de dados e exemplos de integração. **Não** assume framework, banco de
dados ou provedor de persistência do Pelada PRO. **Não** contém credenciais.

## O que é (e o que não é)
- **É** um conjunto de **ativos visuais** (PNG/WebP com transparência real) + um
  **manifesto** que descreve cada carta e o **slot da nota** (posição percentual).
- **Não é** uma integração pronta. Os exemplos (`adapters/`, `demo/`) mostram como
  renderizar; o app decide como persistir e calcular a nota.

## Regras de ouro
1. A **nota é dinâmica** no app — renderize por cima da carta, na posição do
   `ratingSlot`. **Nunca** embuta a nota na imagem-base.
2. **playerId é estável** (`config/roster.csv` → slug). Não muda quando o
   `displayName` muda. Use-o como chave de associação.
3. **Escalas não se convertem sozinhas**: a nota técnica do app é **1–5**; o campo
   histórico `legacyOverallRating` (0–99) **não** deve ser usado sem decisão explícita.
4. **Não duplicar jogadores** ao importar (`players-seed` + `player-aliases` para migração).
5. Nomes `gabriel`, `custodio`, `dans`, `max` estão **pendentes** de confirmação
   (`nameReviewStatus: "pending"`). Por isso o pacote é **release-candidate**.

## Estrutura
```
public/player-cards/v1/{png,webp,thumbnails}/<playerId>.*   -> copie para o /public do app
data/cards-manifest.v1.json     -> contrato PRIMÁRIO (assets + rating slot)
data/players-seed.v1.json       -> seed mínimo (sem nota, sem posição de linha)
data/player-aliases.v1.json     -> aliases só para MIGRAÇÃO (ambíguos marcados)
data/player-name-review.csv     -> 4 nomes a confirmar
data/rating-slot.v1.json        -> contrato do slot + modelo de nota (tudo null)
schemas/*.schema.json           -> JSON Schema (draft-07)
types/player-cards.ts           -> tipos TypeScript
adapters/vanilla/               -> componente JS/CSS sem dependências
adapters/react/                 -> exemplo React (opcional)
demo/                           -> demo estático (python -m http.server)
database/                       -> cards.sqlite + dataset_export.json + schema.sql (auxiliar)
antigravity/                    -> skill + prompt para o agente do Pelada PRO
```

## Integração mínima (web, sem framework)
1. Copie `public/player-cards/` para o `/public` do app.
2. Carregue `data/cards-manifest.v1.json`.
3. Para cada jogador, associe por `playerId` e renderize com o adapter:
```js
import { createPlayerCard } from "./adapters/vanilla/player-card.js";
const entry = manifest.players.find(p => p.playerId === player.id);
createPlayerCard({ container, player, card: entry, rating: technicalRating /* 1..5 ou null */ });
```
4. Quando a nota mudar, chame `setRating(novaNota)` — a imagem não é regenerada.

## Nota (rating)
- `technicalRating` (1–5, pode ter decimal) é **dado do app**.
- `cardRating.displayValue` mostra o `technicalRating` com **1 casa** (ex.: `4,3` em pt-BR).
- Ausente (`null`) → **não** renderize o elemento (espaço vazio; sem `0`, `-` ou `N/A`).
- O contrato JSON usa ponto (`4.3`); a camada visual mostra vírgula (`4,3`).

## Banco de dados
- `data/*.json` é o **contrato primário** para web.
- `database/cards.sqlite` e `schema.sql` são **auxiliares/referência**.
- **O app é a fonte de verdade** dos dados dinâmicos (nota, presença, estatística).
- Nenhuma base externa foi atualizada por este pacote.

Consulte `ANTIGRAVITY_INTEGRATION_PROMPT.md` (para o agente do Pelada PRO) e
`antigravity/.agents/skills/peladapro-card-integration/SKILL.md`.

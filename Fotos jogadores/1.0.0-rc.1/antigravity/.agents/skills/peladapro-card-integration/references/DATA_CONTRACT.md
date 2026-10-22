# Contrato de Dados

## cards-manifest.v1.json (PRIMÁRIO)
- Cabeçalho: `schemaVersion, assetVersion, releaseVersion, releaseStatus, generatedAt,
  templateVersion, ratingContractVersion`.
- `players[]`: `playerId` (estável, `^[a-z0-9-]+$`), `displayName`, `aliases[]`,
  `nameReviewStatus` (confirmed|pending), `sourceFile`, `countryCode`, `isGoalkeeper`,
  `positionGroup`, `assetStatus`, `card`, `ratingSlot`, `warnings[]`.
- `card`: `png, webp, thumbnail` (URLs relativas `/player-cards/v1/...`), `width, height,
  aspectRatio, hasAlpha, sha256Png, sha256Webp, sizeBytesPng, sizeBytesWebp`.
- `ratingSlot`: percentuais (`xPercent, yPercent, widthPercent, heightPercent`),
  `textAlign, fontSizePercent, displayMode="raw-one-decimal", sourceScaleMin=1,
  sourceScaleMax=5, decimalPlaces=1, locale="pt-BR"`.

## players-seed.v1.json (mínimo)
`players[]`: `id, name, cardId, countryCode, isGoalkeeper, position=null,
playerType=null, technicalRating=null, cardRating=null`. **Não** preencher aqui.

## player-aliases.v1.json (só migração)
`aliases[alias]`: `{playerId, status:"unique"}` ou `{status:"ambiguous", candidates:[...]}`.
Ambíguos **não** são resolvidos automaticamente. `gabriel` → `gabriel` (único).

## rating-slot.v1.json
`slot` (percentuais) + `ratingModel` com `technicalRating {value:null, scale{1,5}}`,
`cardRating {displayValue:null, displayMode, formulaVersion:null}`, `legacyOverallRating:null`.

## Regras
- `playerId` NUNCA muda com `displayName`.
- Escala 1–5 (app) ≠ 0–99 (legado). Sem conversão automática.
- JSON usa ponto (`4.3`); visual mostra vírgula (`4,3`).

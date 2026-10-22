/**
 * Contratos TypeScript do handoff Pelada PRO (sem dependências externas).
 * A nota é DINÂMICA no app; nunca é embutida na imagem-base.
 * Escalas NÃO são convertidas automaticamente (1–5 do app ≠ 0–99 legado).
 */

export type NameReviewStatus = "confirmed" | "pending";
export type ReleaseStatus = "release-candidate" | "stable";
export type PositionGroup = "goalkeeper" | "outfield";

export interface PlayerCardAsset {
  /** URL relativa: /player-cards/v1/png/<playerId>.png */
  png: string;
  webp: string;
  thumbnail: string;
  width: number;
  height: number;
  aspectRatio: number;
  hasAlpha: boolean;
  sha256Png: string;
  sha256Webp: string;
  sizeBytesPng: number;
  sizeBytesWebp: number;
}

/** Slot normalizado da nota (percentuais das dimensões da carta). */
export interface PlayerCardRatingSlot {
  xPercent: number;
  yPercent: number;
  widthPercent: number;
  heightPercent: number;
  textAlign: "left" | "center" | "right";
  fontSizePercent: number;
  fontWeight?: number | string;
  fontFamilyFallback?: string;
  textColor: string;
  textShadow?: string;
  maxCharacters?: number;
  /** "raw-one-decimal": exibe o technicalRating com 1 casa (ex.: 4,3). */
  displayMode: "raw-one-decimal";
  sourceScaleMin: number; // 1
  sourceScaleMax: number; // 5
  decimalPlaces: number;  // 1
  locale: string;         // "pt-BR"
}

export interface PlayerCardManifestEntry {
  playerId: string;       // estável; nunca muda com o displayName
  displayName: string;
  aliases: string[];
  nameReviewStatus: NameReviewStatus;
  sourceFile: string;
  countryCode: string;    // "BR"
  isGoalkeeper: boolean;
  positionGroup: PositionGroup;
  assetStatus: string;
  card: PlayerCardAsset;
  ratingSlot: PlayerCardRatingSlot;
  warnings: string[];
}

export interface PlayerCardManifest {
  schemaVersion: string;
  assetVersion: string;
  releaseVersion: string;
  releaseStatus: ReleaseStatus;
  generatedAt: string;
  templateVersion: string;
  ratingContractVersion: string;
  players: PlayerCardManifestEntry[];
}

/** Nota TÉCNICA — dado de negócio do Pelada PRO (escala 1–5, pode ter decimal). */
export interface TechnicalRating {
  value: number | null;
  scale: { min: number; max: number };
}

/** Representação VISUAL da nota (não converte para 0–99). */
export interface CardRating {
  displayValue: string | number | null;
  displayMode: "raw-one-decimal";
  formulaVersion: string | null;
}

export interface PlayerSeed {
  id: string;
  name: string;
  cardId: string;
  countryCode: string;
  isGoalkeeper: boolean;
  position: string | null;
  playerType: string | null;
  technicalRating: number | null; // preenchido pelo app; nunca aqui
  cardRating: number | null;
}

export type NameAlias =
  | { playerId: string; status: "unique" }
  | { status: "ambiguous"; candidates: string[] };

export interface RatingSnapshotPlayer {
  playerId: string;
  rating: number; // escala 1–5
}
export interface RatingSnapshot {
  schemaVersion: string;
  snapshotId: string;
  ratingScale: { min: number; max: number };
  players: RatingSnapshotPlayer[];
}

/** Formata a nota para exibição pt-BR (4.3 -> "4,3"). null -> não renderizar. */
export function formatCardRating(
  value: number | null | undefined,
  slot: Pick<PlayerCardRatingSlot, "decimalPlaces" | "locale">
): string | null {
  if (value === null || value === undefined || Number.isNaN(value)) return null;
  const s = value.toFixed(slot.decimalPlaces ?? 1);
  return (slot.locale ?? "pt-BR").toLowerCase().startsWith("pt") ? s.replace(".", ",") : s;
}

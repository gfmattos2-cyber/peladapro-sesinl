/**
 * Adapter de REFERÊNCIA (opcional) em React + TypeScript. Sem outras dependências.
 * O Pelada PRO NÃO precisa usar React — este é apenas um exemplo.
 * A nota é dinâmica; a imagem-base nunca é alterada.
 */
import React, { useEffect, useRef, useState } from "react";
import "./PlayerCard.css";

export interface RatingSlot {
  xPercent: number; yPercent: number; widthPercent: number; heightPercent: number;
  textAlign: "left" | "center" | "right";
  fontSizePercent: number; fontWeight?: number | string; fontFamilyFallback?: string;
  textColor?: string; textShadow?: string;
  decimalPlaces?: number; locale?: string;
}
export interface CardAsset {
  png: string; webp: string; thumbnail: string; width: number; height: number;
}
export interface PlayerLike { playerId?: string; id?: string; displayName?: string; name?: string; }

export function formatRating(value: number | null | undefined, slot: RatingSlot): string | null {
  if (value === null || value === undefined || Number.isNaN(value)) return null;
  const s = value.toFixed(slot.decimalPlaces ?? 1);
  return (slot.locale ?? "pt-BR").toLowerCase().startsWith("pt") ? s.replace(".", ",") : s;
}

export interface PlayerCardProps {
  player: PlayerLike;
  card: CardAsset;
  ratingSlot: RatingSlot;
  rating?: number | null;
  showRating?: boolean;
  assetBaseUrl?: string;
  preferWebp?: boolean;
}

export const PlayerCard: React.FC<PlayerCardProps> = ({
  player, card, ratingSlot: slot, rating = null, showRating = true,
  assetBaseUrl = "", preferWebp = true,
}) => {
  const ref = useRef<HTMLElement>(null);
  const [fontPx, setFontPx] = useState(0);
  const [src, setSrc] = useState(assetBaseUrl + (preferWebp ? card.webp : card.png));

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setFontPx((slot.fontSizePercent || 0.07) * el.clientHeight));
    ro.observe(el);
    return () => ro.disconnect();
  }, [slot.fontSizePercent]);

  const label = showRating ? formatRating(rating, slot) : null;
  const displayName = player.displayName || player.name || player.playerId || player.id || "";

  return (
    <figure
      ref={ref as React.RefObject<HTMLElement>}
      className="ppro-card"
      role="img"
      aria-label={`Carta de ${displayName}`}
      tabIndex={0}
      style={{ aspectRatio: `${card.width} / ${card.height}` }}
    >
      <img
        className="ppro-card__img"
        src={src}
        alt=""
        loading="lazy"
        decoding="async"
        onError={() => { if (src.endsWith(".webp")) setSrc(assetBaseUrl + card.png); }}
      />
      {label !== null && (
        <div
          className="ppro-card__rating"
          aria-label={`Nota ${label}`}
          style={{
            left: `${slot.xPercent * 100}%`,
            top: `${slot.yPercent * 100}%`,
            width: `${slot.widthPercent * 100}%`,
            height: `${slot.heightPercent * 100}%`,
            justifyContent: slot.textAlign === "left" ? "flex-start"
              : slot.textAlign === "right" ? "flex-end" : "center",
            fontSize: fontPx ? `${fontPx}px` : undefined,
            color: slot.textColor,
            textShadow: slot.textShadow,
            fontWeight: slot.fontWeight as React.CSSProperties["fontWeight"],
            fontFamily: slot.fontFamilyFallback,
          }}
        >
          {label}
        </div>
      )}
    </figure>
  );
};

export default PlayerCard;

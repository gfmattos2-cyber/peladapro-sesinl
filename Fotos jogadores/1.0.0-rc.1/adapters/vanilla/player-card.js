/**
 * Adapter framework-agnóstico do card Pelada PRO (sem dependências).
 * NÃO modifica a imagem-base. Posiciona a nota dinamicamente via percentuais.
 *
 * createPlayerCard({ container, player, card, rating, showRating, assetBaseUrl, preferWebp })
 *   - player: { playerId, displayName, ... }
 *   - card:   entrada do manifesto (card + ratingSlot) OU objeto com { card, ratingSlot }
 *   - rating: número 1..5 | null  (null => nota oculta; espaço fica vazio)
 */
export function formatRating(value, slot) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return null;
  const dp = (slot && slot.decimalPlaces != null) ? slot.decimalPlaces : 1;
  const s = Number(value).toFixed(dp);
  const locale = (slot && slot.locale) || "pt-BR";
  return locale.toLowerCase().startsWith("pt") ? s.replace(".", ",") : s;
}

export function createPlayerCard(opts) {
  const { container, player } = opts;
  const entry = opts.card && opts.card.card ? opts.card : null;
  const asset = entry ? entry.card : opts.card;
  const slot = (entry ? entry.ratingSlot : opts.ratingSlot) || opts.slot;
  const base = opts.assetBaseUrl || "";
  const showRating = opts.showRating !== false;
  const preferWebp = opts.preferWebp !== false;

  const fig = document.createElement("figure");
  fig.className = "ppro-card";
  fig.style.aspectRatio = `${asset.width} / ${asset.height}`;
  fig.tabIndex = 0;
  fig.setAttribute("role", "img");
  fig.setAttribute("aria-label", `Carta de ${player.displayName || player.name}`);

  const img = document.createElement("img");
  img.className = "ppro-card__img";
  img.decoding = "async";
  img.loading = "lazy";
  img.alt = "";
  img.src = base + (preferWebp ? asset.webp : asset.png);
  // fallback PNG se o WebP falhar
  img.addEventListener("error", () => { if (img.src.endsWith(".webp")) img.src = base + asset.png; });
  fig.appendChild(img);

  const rating = document.createElement("div");
  rating.className = "ppro-card__rating";
  rating.style.left = pct(slot.xPercent);
  rating.style.top = pct(slot.yPercent);
  rating.style.width = pct(slot.widthPercent);
  rating.style.height = pct(slot.heightPercent);
  rating.style.justifyContent = alignToJustify(slot.textAlign);
  if (slot.textColor) rating.style.color = slot.textColor;
  if (slot.textShadow) rating.style.textShadow = slot.textShadow;
  if (slot.fontWeight) rating.style.fontWeight = slot.fontWeight;
  if (slot.fontFamilyFallback) rating.style.fontFamily = slot.fontFamilyFallback;
  fig.appendChild(rating);

  function setRating(value) {
    const text = showRating ? formatRating(value, slot) : null;
    if (text == null) {
      rating.textContent = "";
      rating.removeAttribute("aria-label");
      rating.hidden = true;            // espaço fica vazio (sem 0, traço ou N/A)
    } else {
      rating.hidden = false;
      rating.textContent = text;
      rating.setAttribute("aria-label", `Nota ${text}`);
    }
  }

  // responsividade: font-size proporcional à altura do card
  const ro = new ResizeObserver(() => {
    const h = fig.clientHeight || 0;
    rating.style.fontSize = `${(slot.fontSizePercent || 0.07) * h}px`;
  });
  ro.observe(fig);

  if (container) { container.innerHTML = ""; container.appendChild(fig); }
  setRating(opts.rating != null ? opts.rating : null);

  return { element: fig, setRating, destroy: () => ro.disconnect() };
}

function pct(v) { return `${(v * 100).toFixed(4)}%`; }
function alignToJustify(a) {
  return a === "left" ? "flex-start" : a === "right" ? "flex-end" : "center";
}

import { createPlayerCard } from "../adapters/vanilla/player-card.js";

const ASSET_BASE = "../public";
const MANIFEST_URL = "../data/cards-manifest.v1.json";

const $ = (id) => document.getElementById(id);
let manifest = null;
let current = null;

async function boot() {
  try {
    const res = await fetch(MANIFEST_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status} ao carregar o manifesto`);
    manifest = await res.json();
  } catch (e) {
    $("err").textContent =
      "Falha ao carregar o manifesto. Sirva o pacote com 'python -m http.server' e abra /demo/. " + e.message;
    return;
  }
  const players = manifest.players;
  $("count").textContent = players.length;

  const sel = $("player");
  players.forEach((p) => {
    const o = document.createElement("option");
    o.value = p.playerId;
    o.textContent = `${p.displayName}${p.isGoalkeeper ? " (GK)" : ""}` +
      (p.nameReviewStatus === "pending" ? " — nome pendente" : "");
    sel.appendChild(o);
  });

  buildGrid(players);
  sel.addEventListener("change", render);
  $("rating").addEventListener("input", render);
  $("show").addEventListener("change", render);
  $("webp").addEventListener("change", render);
  $("bg").addEventListener("change", applyBg);
  render();
  applyBg();
}

function selected() {
  const id = $("player").value;
  return manifest.players.find((p) => p.playerId === id) || manifest.players[0];
}

function render() {
  const p = selected();
  const ratingRaw = $("rating").value;
  const ratingNum = ratingRaw === "" ? null : Number(ratingRaw);
  const err = $("err");
  err.textContent = "";
  if (ratingNum !== null && (Number.isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5)) {
    err.textContent = "Nota deve estar entre 1,0 e 5,0.";
  }
  if (current) current.destroy();
  current = createPlayerCard({
    container: $("card-host"),
    player: p,
    card: p, // entrada do manifesto já contém card + ratingSlot
    rating: err.textContent ? null : ratingNum,
    showRating: $("show").checked,
    assetBaseUrl: ASSET_BASE,
    preferWebp: $("webp").checked,
  });
  $("meta-name").textContent = p.displayName;
  const dl = $("meta");
  dl.innerHTML = "";
  const rows = {
    playerId: p.playerId, goleiro: p.isGoalkeeper, grupo: p.positionGroup,
    "nome revisão": p.nameReviewStatus, alpha: p.card.hasAlpha,
    dimensões: `${p.card.width}×${p.card.height}`, png: p.card.png, webp: p.card.webp,
  };
  for (const [k, v] of Object.entries(rows)) {
    dl.insertAdjacentHTML("beforeend", `<dt>${k}</dt><dd>${v}</dd>`);
  }
  $("slot").textContent = JSON.stringify(p.ratingSlot, null, 2);
}

function applyBg() {
  const v = $("bg").value;
  const host = $("card-host");
  if (v === "checker") {
    host.style.background =
      "conic-gradient(#ddd 90deg,#fff 90deg 180deg,#ddd 180deg 270deg,#fff 270deg) 0 0/24px 24px";
  } else {
    host.style.background = v;
  }
}

function buildGrid(players) {
  const grid = $("grid");
  players.forEach((p) => {
    const cell = document.createElement("div");
    cell.className = "cell";
    createPlayerCard({
      container: cell, player: p, card: p, rating: 4.3,
      assetBaseUrl: ASSET_BASE, preferWebp: true,
    });
    const cap = document.createElement("span");
    cap.textContent = p.displayName;
    cell.appendChild(cap);
    grid.appendChild(cell);
  });
}

boot();

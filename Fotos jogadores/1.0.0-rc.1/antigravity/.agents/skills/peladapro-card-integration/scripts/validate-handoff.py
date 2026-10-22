#!/usr/bin/env python3
"""Validador autossuficiente do pacote peladapro-handoff (stdlib; Pillow opcional).

Uso: python validate-handoff.py <pasta-do-pacote-extraido>
Sai com código 0 se válido; 1 caso contrário. Não faz rede.
"""
import hashlib
import json
import sys
from pathlib import Path

EXPECTED = 18


def sha256(p: Path) -> str:
    h = hashlib.sha256()
    with open(p, "rb") as fh:
        for chunk in iter(lambda: fh.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def main(root: Path) -> int:
    issues = []
    ok = []

    def check(cond, msg_ok, msg_fail):
        (ok if cond else issues).append(msg_ok if cond else msg_fail)

    # assets 18 x 3
    for kind, ext in (("png", "png"), ("webp", "webp"), ("thumbnails", "webp")):
        d = root / "public" / "player-cards" / "v1" / kind
        n = len(list(d.glob(f"*.{ext}"))) if d.exists() else 0
        check(n == EXPECTED, f"{kind}: {n} arquivos", f"{kind}: {n} (esperado {EXPECTED})")

    # JSONs válidos
    manifest = None
    for name in ("cards-manifest.v1.json", "players-seed.v1.json",
                 "player-aliases.v1.json", "rating-slot.v1.json"):
        p = root / "data" / name
        try:
            data = json.loads(p.read_text(encoding="utf-8"))
            if name.startswith("cards-manifest"):
                manifest = data
            ok.append(f"JSON válido: {name}")
        except Exception as e:
            issues.append(f"JSON inválido: {name}: {e}")

    # manifesto: playerIds únicos + URLs existem
    if manifest:
        ids = [p["playerId"] for p in manifest["players"]]
        check(len(set(ids)) == len(ids) == EXPECTED, f"playerIds únicos: {len(ids)}",
              f"playerIds: {len(ids)} (únicos {len(set(ids))})")
        for pl in manifest["players"]:
            for key in ("png", "webp", "thumbnail"):
                rel = pl["card"][key].lstrip("/")
                fp = root / "public" / rel
                if not fp.exists():
                    issues.append(f"asset ausente: {rel}")

    # alpha (se Pillow disponível)
    try:
        from PIL import Image
        import numpy as np
        for p in (root / "public" / "player-cards" / "v1" / "png").glob("*.png"):
            a = np.array(Image.open(p).convert("RGBA"))[:, :, 3]
            if not (int(a.min()) == 0 and int(a.max()) == 255):
                issues.append(f"alpha inválido: {p.name}")
        ok.append("alpha verificado (Pillow)")
    except Exception:
        ok.append("alpha não verificado (Pillow ausente) — pulado")

    # checksums
    cs = root / "checksums.sha256"
    if cs.exists():
        bad = 0
        for line in cs.read_text(encoding="utf-8").splitlines():
            if not line.strip():
                continue
            h, rel = line.split("  ", 1)
            fp = root / rel
            if not fp.exists() or sha256(fp) != h:
                bad += 1
        check(bad == 0, "checksums coerentes", f"{bad} checksums divergentes")

    print("== VALIDATE HANDOFF ==")
    for m in ok:
        print("  ok  ", m)
    for m in issues:
        print("  FAIL", m)
    print("RESULTADO:", "PASS" if not issues else "FAIL")
    return 0 if not issues else 1


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("uso: python validate-handoff.py <pasta-do-pacote>")
        sys.exit(2)
    sys.exit(main(Path(sys.argv[1])))

# Overlay da Nota (dinâmico)

A nota aparece **acima da bandeira do Brasil**, no canto superior esquerdo, sobre a
área dourada — **sem** invadir rosto, bandeira, linhas ou borda. É renderizada por
CSS/canvas **por cima** da carta; a imagem-base nunca muda.

## Posição (percentuais do `ratingSlot`)
```
left   = xPercent * larguraDoCard
top    = yPercent * alturaDoCard
width  = widthPercent * larguraDoCard
height = heightPercent * alturaDoCard
font-size = fontSizePercent * alturaDoCard   (responsivo)
```
Valores atuais: `x≈0.165, y≈0.16, w≈0.175, h≈0.095, fontSize≈0.07`. O topo mínimo
da bandeira observado é ~0.28, então o slot (bottom ≈ 0.255) fica acima dela.

## Formatação
- Escala **1–5**, **1 casa decimal**. pt-BR: vírgula (`4.3` → `4,3`).
- `null`/ausente → **não** renderizar (sem `0`, `-`, `N/A`). Espaço fica vazio.
- **Não** converter para 0–99.

## Exemplo (vanilla)
```js
createPlayerCard({ container, player, card: manifestEntry, rating: 4.3 });
// depois:
handle.setRating(3.9);   // atualiza sem regenerar a imagem
handle.setRating(null);  // oculta
```

## Acessibilidade
- `<img alt="">` (decorativa) + `figure[role=img][aria-label="Carta de <nome>"]`.
- Elemento da nota com `aria-label="Nota 4,3"`.

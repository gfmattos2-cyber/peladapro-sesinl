# CLAUDE.md — Instruções permanentes para futuras sessões

## Fases do projeto
- **FASE LEGADA A — geração das caricaturas** (HISTÓRICO): pipeline com Replicate
  InstantID + piloto de 3 atletas. **As caricaturas NÃO serão regeneradas.**
  Replicate e o piloto são históricos; mantidos só para referência.
- **FASE ATUAL B — gestão das cartas finais**: `import-final-cards`, `render-ratings`,
  `export-dataset` sobre as 18 figurinhas finais (fonte `../figurinhas/cards`).
- **FASE ATUAL C — integração Pelada PRO**: `build/validate/package-peladapro-handoff`
  e `render-rating-snapshot`. **O pacote de handoff é a nova saída de produção.**
  A nota do app é **dinâmica** (1–5), renderizada por cima da carta (nunca embutida).

O fluxo ativo é **final-cards + peladapro-handoff**. A escala 1–5 (app) **não** se
converte para 0–99 (legado) automaticamente.

Este projeto gera cartas de futebol a partir de fotos de atletas. Regras que
**nunca** podem ser violadas por qualquer sessão futura:

1. **Nunca** modificar, mover, renomear ou sobrescrever os arquivos originais em
   `../fotos atletas/` nem o `../template_card.jpg`. São somente leitura.
2. **Nunca** processar o lote completo (`batch`) sem aprovação humana válida em
   `config/pilot_approval.json` (`approved=true` + hashes coerentes com o run).
3. **Nunca** autoaprovar: o pipeline não cria `pilot_approval.json` aprovado nem
   marca `review_status=approved`.
4. **Nunca** tratar um retrato normalizado (foto real) como se fosse a caricatura
   gerada. Provas de layout ficam só em `07_layout_proofs` e têm `final_eligible=false`.
5. **Nunca** enviar as fotos dos atletas não-piloto para serviços externos. Somente
   os 3 pilotos (rodrigo, gerson melo, thiago faria), e somente os retratos normalizados.
6. **Fixar** a versão do modelo de geração no run (sem alias móvel) e registrá-la.
7. **Preservar** rastreabilidade: manifesto, logs, hashes e sidecars em cada etapa.
8. **Executar** `pytest` e `ruff` antes de declarar qualquer conclusão.
9. **Manter** a separação semântica das pastas de saída (entradas → intermediários →
   provas → candidatos → aprovados).
10. **Nunca** registrar o valor de `REPLICATE_API_TOKEN` em logs, relatórios ou código.
11. Detecção facial usa **OpenCV** (Haar/YuNet); `mediapipe` foi deixado de fora para
    não forçar downgrade de numpy 2.x. Se reintroduzir, isolar em venv próprio.
12. `opencv-python` deve permanecer em **4.11.x** (5.0.x removeu `CascadeClassifier`).

Comando principal: `python -m src.main pilot`. Sem token → termina em `TOKEN_MISSING`.
Com token → gera candidatos e termina em `PILOT_REVIEW_REQUIRED`.

---

## Figurinhas finais (ativos aprovados) — regras permanentes

As caricaturas finais **já foram produzidas** e vivem em `../figurinhas/`. A partir daqui:

13. **Figurinhas são ativos aprovados.** `../figurinhas/` é fonte **imutável**:
    nunca editar, mover, renomear, sobrescrever ou comprimir de forma destrutiva.
    Toda transformação ocorre em cópias dentro de `card_pipeline/`.
14. **Nunca regenerar caricaturas** nem redesenhar rostos, mãos, uniformes, nomes ou poses.
15. **Nunca usar APIs externas / serviços pagos** nesta fase (sem Replicate, sem geração).
16. **Nunca inventar, estimar ou inferir notas** (nem por rosto, posição, comemoração,
    nome ou conhecimento externo). `overall_rating` só é preenchido manualmente pelo usuário.
17. **Nota é sempre camada NÃO destrutiva** (desenhada sobre uma cópia da carta native;
    o arquivo `assets/final_cards/native/<slug>.png` nunca é alterado).
18. **Elenco = `config/roster.csv`** (fonte de verdade editável; hoje **18 jogadores** —
    os 10 originais + custodio, dans, felipe-barrione, gabriel, gustavo-diorio, heyler,
    lucas, max). Não converter nomes automaticamente (Kaká/Gérson/Tiago/Novi/"Marcelo Goleiro").
    Fonte de imagens final = `../figurinhas/cards/` (18 PNGs). Fundo é normalizado para
    **transparente (RGBA)** de forma não destrutiva na importação; o arquivo-fonte nunca muda.
    Nomes `gabriel`/`custodio`/`dans`/`max` aguardam confirmação do usuário.
19. **Preservar Samuel × Thiago Novy:** Samuel = lente alaranjada + dedo para cima;
    Thiago Novy = cabelo comprido + barba + gesto ao próprio peito. Não inverter.
20. **Preservar a classificação dos goleiros** (bulau, gabriel-lobao, marcelo = GK, com luvas).
21. **`render-ratings` só roda com todas as notas válidas** (inteiro 0..99). `05_rated_cards`
    permanece vazia até haver notas. Nenhum ativo é auto-aprovado só porque o arquivo existe.

Comandos da fase de figurinhas: `import-final-cards`, `build-card-registry`,
`validate-final-cards`, `prepare-ratings`, `rating-layout-proof`, `render-ratings`,
`final-cards-report`. Gate atual: **RATINGS_INPUT_REQUIRED**.

22. **Migração para base externa (Google Antigravity):** usar `export-dataset`
    (SQLite/JSON/DDL portável, DB-agnóstico, sem rede). Esquema em `docs/DATA_MODEL.md`.
    **Confirmar o alvo externo com o usuário** antes de acoplar SDK/credenciais de um
    provedor. `slug` é a identidade estável entre tabelas.

## FASE C — Handoff Pelada PRO (regras)
23. `playerId` = slug (estável; nunca muda com o displayName). **Não duplicar jogadores.**
24. Nota **dinâmica** (1–5, 1 casa, vírgula pt-BR); ausente → não renderizar. **Nunca**
    embutir a nota na imagem-base; toda carta com nota é **ativo derivado** (snapshot).
25. **Nunca** converter 1–5 → 0–99. `legacyOverallRating` fica intocado.
26. Pacote é **release-candidate** enquanto houver nomes pendentes (gabriel/custodio/dans/max).
27. **Nunca** sobrescrever pacote de outra versão; build/zip são **reprodutíveis**
    (timestamps fixos). Sem deploy, sem credenciais, sem SDK de banco no pacote.
28. Templates estáticos do pacote ficam em `handoff_templates/`; o build os copia +
    gera assets/manifests/reports/checksums/zip de forma idempotente.

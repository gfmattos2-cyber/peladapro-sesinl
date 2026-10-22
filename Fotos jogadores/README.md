# Pipeline de Cartas de Futebol — SESI

Pipeline reprodutível que transforma fotografias de atletas em **cartas premium
douradas** (estilo videogame de futebol), preservando a identidade facial,
removendo o fundo, inserindo o retrato e o nome sobre o `template_card.jpg` e
mantendo uma **área reservada** para nota/atributos futuros.

## Fases do projeto
- **FASE LEGADA A — geração das caricaturas** (histórico): Replicate InstantID +
  piloto de 3 atletas. Documentada mais abaixo; **não** será reexecutada.
- **FASE ATUAL B — gestão das cartas finais**: 18 figurinhas em `../figurinhas/cards/`,
  importadas como ativos aprovados; notas dinâmicas via `render-ratings`; export via
  `export-dataset`.
- **FASE ATUAL C — integração Pelada PRO** (saída de produção): pacote de handoff
  framework-agnóstico em `output/peladapro_handoff/<versão>/` — ver
  [seção do handoff](#-handoff-pelada-pro-fase-c).

> As **caricaturas finais já foram produzidas** e importadas como ativos aprovados.
> A nota é **dinâmica** no app consumidor (escala 1–5); **não** se converte para
> a escala legada 0–99. Nenhuma caricatura será regenerada.

## 🟩 Handoff Pelada PRO (Fase C)
Pacote versionado para o app **Pelada PRO** (framework-agnóstico, sem credenciais):
```bash
python -m src.main build-peladapro-handoff       # gera output/peladapro_handoff/<versão>/
python -m src.main validate-peladapro-handoff    # valida (assets, schemas, alpha, checksums)
python -m src.main package-peladapro-handoff     # gera o ZIP reprodutível
python -m src.main render-rating-snapshot --input <snapshot.json>  # ativos DERIVADOS (opcional)
```
Flags: `--version`, `--dry-run`, `--overwrite` (só a mesma versão), `--verbose`, `--input`.
Conteúdo: 18 cartas (PNG/WebP/thumb com alpha), `cards-manifest.v1.json` (slot da nota
em %), `players-seed`, `player-aliases`, JSON Schemas, tipos TS, adapters (vanilla/react),
demo estático, skill+prompt Antigravity, database auxiliar, relatórios e checksums.
Detalhes de integração no próprio pacote (`README_INTEGRATION.md`).

---

## 🟦 Figurinhas Finais e Nota Geral (etapa atual)

### Localização e preservação
- **Fonte oficial imutável:** `../figurinhas/cards/` (**18 cards**, versão final 2026-07-08).
- Os originais **nunca** são movidos, renomeados, editados ou sobrescritos. Toda
  transformação ocorre em **cópias** dentro de `card_pipeline/`.
- `assets/final_cards/native/<slug>.png` = cópia com **fundo normalizado para transparente
  (RGBA)** de forma não destrutiva (o xadrez cinza "baked" do exterior é removido; a arte,
  rosto, nome, bandeira e logo ficam intactos). O arquivo-fonte permanece inalterado (SHA-256 registrado).

### Elenco oficial (18) e slugs canônicos — `config/roster.csv`
10 originais (`arthur-faria, bulau, gabriel-kaka, gabriel-lobao, gerson-melo, marcelo,
rodrigo, samuel, thiago-faria, thiago-novy`) + 8 novos (`custodio, dans, felipe-barrione,
gabriel, gustavo-diorio, heyler, lucas, max`). Editar em `config/roster.csv`. Nomes **não**
são alterados automaticamente; `gabriel/custodio/dans/max` aguardam confirmação do usuário.

### Goleiros
`bulau`, `gabriel-lobao`, `marcelo` → `position_group=goalkeeper`, `position_code=GK`.
As cartas dos três apresentam **luvas** (confirmado por auditoria visual + verificação
independente). Jogadores de linha: `outfield` / `position_code=""` (sem posição inventada).

### Correções de identidade (obrigatórias, confirmadas)
- **Samuel** = óculos de lente alaranjada + dedo apontando para cima.
- **Thiago Novy** = cabelo comprido + barba + gesto apontando para o próprio peito.

### Estrutura de assets e saída
```
assets/final_cards/native/<slug>.png       # cópia aprovada (nativa)
assets/final_cards/previews/<slug>.png      # miniatura
assets/final_cards/source_manifest.{json,csv}
config/figurinhas_mapping.csv               # reconciliação verificada (arquivo -> slug)
config/cards_registry.csv                   # registro dos ativos (status/review)
config/ratings.csv                          # notas (VAZIAS nesta etapa)
output/final_cards/
  01_inventory  02_native_previews  03_layout_debug  04_rating_proofs
  05_rated_cards (VAZIA até haver notas)  06_contact_sheets  reports/
```

### `cards_registry.csv`
Colunas: `source_file, canonical_name, slug, position_group, position_code,
is_goalkeeper, source_sha256, native_card_path, width, height, format,
identity_validated, name_text_validated, goalkeeper_gloves_validated, card_status,
review_status, notes`. `card_status ∈ {discovered, imported, invalid, duplicate,
missing, blocking_review}`. `review_status ∈ {not_reviewed, technically_validated,
human_review_required, approved_visual_asset}`.

### `ratings.csv` — como preencher a nota geral
Colunas: `slug, display_name, position_group, overall_rating, rating_status,
rating_source, notes`. Preencha **apenas** `overall_rating` com um **inteiro 0..99**.
Nada de decimais, texto, negativos ou vazios para quem será renderizado. Nenhuma
nota é inventada pelo sistema.

### Camada de nota NÃO destrutiva
A nota é desenhada **sobre uma cópia** da carta nativa (nunca a modifica),
posicionada na área inferior livre (`layout.json → rating_layer`), sem invadir
nome, logo ou borda. Posições/fonte/cor ficam em `layout.json`.

### Comandos (figurinhas + notas)
```bash
python -m src.main import-final-cards      # inventário + reconciliação + cópias + registry + previews
python -m src.main build-card-registry     # (re)gera cards_registry.csv (idempotente)
python -m src.main validate-final-cards     # QC + folhas de contato
python -m src.main prepare-ratings          # cria ratings.csv (notas vazias)
python -m src.main rating-layout-proof      # overlay de diagnóstico + prova 'XX' (04_rating_proofs)
python -m src.main render-ratings           # gera 05_rated_cards (FALHA se houver nota vazia)
python -m src.main final-cards-report       # FINAL_CARDS_IMPORT_REPORT.md
```
Flags: `--dry-run` (não escreve), `--overwrite`, `--athlete <slug>`, `--verbose`.

### Como gerar as cartas com nota (depois de preencher)
1. Edite `config/ratings.csv` (coluna `overall_rating`, inteiro 0..99).
2. `python -m src.main render-ratings` → cartas em `output/final_cards/05_rated_cards/`.
   O comando **bloqueia** enquanto houver qualquer nota vazia.

### Como corrigir uma carta-base
Substitua o arquivo em `../figurinhas/`, ajuste `config/figurinhas_mapping.csv` se
necessário e rode `import-final-cards --overwrite`. **Nunca** edite a arte
manualmente nem regenere caricaturas.

### Como regenerar apenas um atleta
`python -m src.main rating-layout-proof --athlete <slug>` (proof) e, com notas
preenchidas, `python -m src.main render-ratings --athlete <slug> --overwrite`.

### Rastreabilidade
Hashes SHA-256 de fonte e cópia (registro em `cards_registry.csv` e
`source_manifest`), QC em `output/final_cards/reports/final_cards_qc.{json,md}`,
e relatório `FINAL_CARDS_IMPORT_REPORT.md`.

### Migração para base de dados externa (preparação)
`python -m src.main export-dataset` gera uma base **portável e DB-agnóstica** em
`output/exports/`: `cards.sqlite` (SQLite da stdlib, com FKs e CHECK 0..99),
`dataset_export.json` (bundle único) e `schema.sql` (DDL). Fonte de verdade:
`cards_registry.csv`, `ratings.csv`, `source_manifest.json` e a verificação
independente. Esquema e guia de transposição (Postgres/BigQuery/Firestore/**Google
Antigravity**) em [`docs/DATA_MODEL.md`](docs/DATA_MODEL.md). O alvo externo exato
ainda **não** foi definido — nenhum serviço externo é chamado; notas vazias = `NULL`.

---

---

## 1. Objetivo

- Padronizar retratos (rosto centralizado, olhos alinhados, escala uniforme).
- Remover o fundo com modelos locais.
- Compor a carta respeitando zonas (retrato, nome, área futura, logotipo).
- Rastrear tudo (manifesto, logs, hashes, sidecars) e **nunca** tocar nos originais.
- Rodar um **piloto de 3 atletas** e **travar o lote** até aprovação humana.

## 2. Arquitetura / estrutura de pastas

```
card_pipeline/
├── config/            athletes.csv, layout.json, generator.json, style_prompt.txt,
│                      name_corrections.csv, pilot_approval.example.json, template_mask.png
├── models/            face_detection_yunet_2023mar.onnx (detector facial local)
├── src/               inventory, naming, hashing, face_detection, portrait_normalization,
│                      background_removal, template_mask, image_generator, card_composer,
│                      quality_control, contact_sheet, reporting, approval_gate, main
│                      └── providers/  base, replicate_instantid, pending_provider
├── tests/             52 testes (pytest)
└── output/
    ├── latest_run.txt
    └── runs/<run_id>/  01_inventory .. 10_approved_cards, prompts, logs, reports,
                        pilot_review.html
```

## 3. Pré-requisitos

- Windows + Python 3.12.
- `opencv-python==4.11.0.86` (a 5.0.x removeu `CascadeClassifier` — não usar).
- Detecção facial via **OpenCV YuNet** (primário) + Haar (fallback). `mediapipe`
  **não** é usado (forçaria downgrade de numpy 2.x / conflito de protobuf).

## 4. Instalação

```bash
cd card_pipeline
python -m venv .venv
.venv/Scripts/python -m pip install -r requirements.txt
```

O `rembg` baixa os modelos de segmentação (~176MB cada) na primeira execução;
a inferência roda **100% local**. O detector YuNet já está em `models/`.

## 5. Uso da virtual environment

Sempre chame o interpretador da venv: `.venv/Scripts/python -m src.main <comando>`.

## 6. Configuração do token (privacidade)

1. `cp .env.example .env`
2. preencha `REPLICATE_API_TOKEN=...` (o `.env` está no `.gitignore`).

O token **nunca** é impresso ou registrado. **Somente** os 3 retratos
normalizados dos pilotos são enviados ao Replicate — **nunca** os outros 7
atletas, nunca o lote inteiro "para testar".

## 7. Escolha/limites do gerador (`config/generator.json`)

- `owner/model` (padrão `zsxkib/instant-id`), `version` (fixada no run, sem alias móvel).
- Parâmetros conservadores de identidade (`identity_strength`, `ip_adapter_scale`,
  `controlnet_scale`) — priorizam semelhança facial.
- Tetos: **9 resultados concluídos** e **12 tentativas de API** por run.

## 8. Comandos (CLI)

```bash
python -m src.main audit                 # ambiente + inventário + relatórios
python -m src.main inventory             # gera athletes.csv + manifesto
python -m src.main build-template-mask   # máscara + overlays de layout
python -m src.main pilot                 # SEQUÊNCIA COMPLETA autorizada (3 pilotos)
python -m src.main batch                 # BLOQUEADO até aprovação humana
```

Flags globais: `--run-id`, `--dry-run`, `--resume`, `--overwrite`, `--verbose`.
No piloto atual, as etapas granulares (`inspect-faces`, `preprocess`, `generate`,
`segment`, `compose`, `qc`, `report`) são orquestradas dentro de `pilot`.

## 9. Fluxo do piloto

`inventory → build-template-mask → detecção/seleção de rosto → normalização →
geração (ou pending) → remoção de fundo (2 modelos) → composição (prova de
layout / carta candidata) → contact sheets → QC → manifesto → pilot_review.html`.

Cada atleta é tratado com erro individual: uma falha **não** interrompe os demais.

## 10. Candidatos e segmentação

- Com token: 3 candidatos/atleta (variando apenas a seed), com QC técnico e
  **recomendação provisória** (não é aprovação).
- Segmentação compara `u2net_human_seg` e `isnet-general-use` com previews sobre
  fundos claro/escuro/dourado e comparativo A/B. Recomendação **provisória**.

## 11. Resolução (importante)

- `preview_native` (468×654) e `cutout_native` (exterior transparente): dimensão nativa.
- `master_3x`: **interpolação LANCZOS 3×** — registrada como
  `true_high_resolution=false`. Impressão real exige template vetorial/raster maior.

## 12. Layout (`config/layout.json`)

Tudo em percentuais (0..1) da carta. Zonas validadas contra colisões. Ajuste
visual apenas aqui (não no código). Campos futuros já existem, **desativados**.

## 13. Manifesto e rastreabilidade

`reports/processing_manifest.{csv,json}` separa `processing_status` (técnico) de
`review_status` (humano). Hashes de template, máscara, layout, gerador e prompt.

## 14. Approval gate (liberar o lote)

1. Revise `pilot_review.html`.
2. Copie `pilot_approval.example.json` → `config/pilot_approval.json`.
3. Preencha `approved=true`, `run_id`, versões, hashes e o candidato de cada piloto.
4. `python -m src.main --run-id <run> batch`.

O pipeline **nunca** cria esse arquivo aprovado nem marca `approved`.

## 15. Retomada e sobrescrita

- `--resume`: retoma um run existente sem repetir chamadas concluídas.
- `--overwrite`: substitui artefatos **apenas do run especificado** (nunca de outro run).

## 16. Troubleshooting

- **`CascadeClassifier` ausente** → você está com opencv 5.x; instale `opencv-python==4.11.0.86`.
- **rembg lento na 1ª vez** → download único dos modelos; execuções seguintes são rápidas.
- **rosto errado / não detectado** → verifique `02_face_inspection/*_faces_annotated.png`;
  defina `target_face_index` em `athletes.csv`; envie foto frontal, sem oclusão.
- **nome errado/acentos** → edite `config/name_corrections.csv` (nunca inferimos do rosto).
- **TOKEN_MISSING** → configure `.env` para gerar caricaturas.

## 17. Como incluir nota geral e atributos no futuro

Ative os campos em `layout.json → future_rating_area.fields` e adicione as
coordenadas percentuais correspondentes. Hoje a área permanece **vazia**.

## 18. Processamento do lote após aprovação

Somente após `config/pilot_approval.json` válido, `batch` processa os demais
atletas (respeitando os mesmos limites de privacidade e rastreabilidade).

---

### Critérios de qualidade (resumo)

Rosto detectado e selecionado; olhos/escala dentro da faixa; transparência
válida; retrato contido na máscara; área futura e logotipo sem invasão; nome
dentro da largura; saídas nativa e 3× criadas; **nada aprovado automaticamente**.

/**
 * Lógica Principal do Aplicativo - Pelada PRO
 */

// Estado Inicial do Aplicativo
let state = {
    players: [],
    financeConfig: {
        courtCost: 150,
        pixKey: '',
        pixOwner: ''
    },
    drawnTeams: [],
    history: {},
    historyMetadata: { totalDraws: 0 },
    currentDrawSaved: false
};

// Manifesto e Mapeamento de Figurinhas/Cards
let manifestData = null;

const playerCardMapping = {
    '1': 'arthur-faria',       // Arthur
    '2': 'bulau',              // Bulau
    '3': 'custodio',           // Custódio
    '4': 'gustavo-diorio',     // Diório
    '5': 'felipe-barrione',    // Felipe
    '6': 'gabriel',            // Gabriel
    '7': 'gerson-melo',        // Gersinho
    '8': 'heyler',             // Heyler
    '10': 'gabriel-kaka',      // Kaka
    '11': 'lucas',             // Lucas
    '12': 'max',               // Max
    '13': 'dans',              // Nenem -> Dans (confirmado pelo usuário)
    '14': 'thiago-novy',       // Novy
    '15': 'rodrigo',           // Rodrigo
    '16': 'samuel',            // Samuel
    '17': 'thiago-faria',      // Thiago
    '19': 'gabriel-lobao',     // Lobão
    '20': 'marcelo',           // Marcelo
    '18': 'victor-junio'       // Vitão -> Victor Junio (confirmado pelo usuário)
};

function getPlayerCardEntry(playerId) {
    // Se for João Teles (id '9') ou Vitão (id '18'), retorna entrada mockada apontando para a foto inteira (que já é o card FUT com fundo transparente)
    if (playerId === '9') {
        return {
            playerId: "joao-teles",
            displayName: "João Teles",
            card: {
                webp: "/player-cards/v1/raw/joao-teles-trans.png",
                png: "/player-cards/v1/raw/joao-teles-trans.png",
                thumbnail: "/player-cards/v1/raw/joao-teles-trans.png"
            },
            ratingSlot: {
                xPercent: 0.165,
                yPercent: 0.16,
                widthPercent: 0.175,
                heightPercent: 0.095,
                textAlign: "center",
                fontWeight: 800,
                textColor: "#2a1e04",
                textShadow: "0 2px 4px rgba(246,234,208,0.65)"
            }
        };
    }
    if (playerId === '18') {
        return {
            playerId: "victor-junio",
            displayName: "Vitão",
            card: {
                webp: "/player-cards/v1/raw/victor-junio-trans.png",
                png: "/player-cards/v1/raw/victor-junio-trans.png",
                thumbnail: "/player-cards/v1/raw/victor-junio-trans.png"
            },
            ratingSlot: {
                xPercent: 0.165,
                yPercent: 0.16,
                widthPercent: 0.175,
                heightPercent: 0.095,
                textAlign: "center",
                fontWeight: 800,
                textColor: "#2a1e04",
                textShadow: "0 2px 4px rgba(246,234,208,0.65)"
            }
        };
    }

    if (!manifestData || !manifestData.players) return null;
    const cardId = playerCardMapping[playerId];
    if (!cardId) return null;
    return manifestData.players.find(p => p.playerId === cardId);
}

function getPlayerThumbnail(playerId) {
    const cardEntry = getPlayerCardEntry(playerId);
    if (cardEntry) {
        return `public${cardEntry.card.thumbnail}`;
    }
    return null;
}

async function loadManifest() {
    if (window.manifestData) {
        manifestData = window.manifestData;
        console.log("Manifesto de cartas carregado com sucesso a partir do script global!");
        return;
    }

    try {
        const response = await fetch('public/player-cards/v1/cards-manifest.v1.json');
        if (response.ok) {
            manifestData = await response.json();
            console.log("Manifesto de cartas carregado com sucesso via fetch!");
        }
    } catch (e) {
        console.warn("Não foi possível carregar o manifesto de cartas via fetch:", e);
    }
}

// Lista inicial de jogadores fornecida pelo usuário com notas e goleiros atualizados
// Lista inicial de jogadores fornecida pelo usuário com notas e goleiros atualizados para a escala 0-100 (FIFA/FUT)
const mockPlayers = [
    { id: '1', name: "Arthur", rating: 67, position: "Meio-Campo", type: "Mensalista", active: true, paid: false, goals: 0, assists: 0, yellowCards: 0, redCard: false },
    { id: '2', name: "Bulau", rating: 56, position: "Meio-Campo", type: "Mensalista", active: true, paid: false, goals: 0, assists: 0, yellowCards: 0, redCard: false },
    { id: '3', name: "Custódio", rating: 61, position: "Meio-Campo", type: "Mensalista", active: true, paid: false, goals: 0, assists: 0, yellowCards: 0, redCard: false },
    { id: '4', name: "Diório", rating: 75, position: "Meio-Campo", type: "Mensalista", active: true, paid: false, goals: 0, assists: 0, yellowCards: 0, redCard: false },
    { id: '5', name: "Felipe", rating: 88, position: "Meio-Campo", type: "Mensalista", active: true, paid: false, goals: 0, assists: 0, yellowCards: 0, redCard: false },
    { id: '6', name: "Gabriel Oliveira", rating: 67, position: "Meio-Campo", type: "Mensalista", active: true, paid: false, goals: 0, assists: 0, yellowCards: 0, redCard: false },
    { id: '7', name: "Gersinho", rating: 81, position: "Meio-Campo", type: "Mensalista", active: true, paid: false, goals: 0, assists: 0, yellowCards: 0, redCard: false },
    { id: '8', name: "Heyler", rating: 69, position: "Meio-Campo", type: "Mensalista", active: true, paid: false, goals: 0, assists: 0, yellowCards: 0, redCard: false },
    { id: '9', name: "João Teles", rating: 94, position: "Meio-Campo", type: "Mensalista", active: true, paid: false, goals: 0, assists: 0, yellowCards: 0, redCard: false },
    { id: '10', name: "Kaka", rating: 72, position: "Meio-Campo", type: "Mensalista", active: true, paid: false, goals: 0, assists: 0, yellowCards: 0, redCard: false },
    { id: '11', name: "Lucas", rating: 63, position: "Meio-Campo", type: "Mensalista", active: true, paid: false, goals: 0, assists: 0, yellowCards: 0, redCard: false },
    { id: '12', name: "Max", rating: 65, position: "Meio-Campo", type: "Mensalista", active: true, paid: false, goals: 0, assists: 0, yellowCards: 0, redCard: false },
    { id: '13', name: "Nenem", rating: 86, position: "Meio-Campo", type: "Mensalista", active: true, paid: false, goals: 0, assists: 0, yellowCards: 0, redCard: false },
    { id: '14', name: "Novy", rating: 65, position: "Meio-Campo", type: "Mensalista", active: true, paid: false, goals: 0, assists: 0, yellowCards: 0, redCard: false },
    { id: '15', name: "Rodrigo", rating: 76, position: "Meio-Campo", type: "Mensalista", active: true, paid: false, goals: 0, assists: 0, yellowCards: 0, redCard: false },
    { id: '16', name: "Samuel", rating: 75, position: "Meio-Campo", type: "Mensalista", active: true, paid: false, goals: 0, assists: 0, yellowCards: 0, redCard: false },
    { id: '17', name: "Thiago", rating: 72, position: "Meio-Campo", type: "Mensalista", active: true, paid: false, goals: 0, assists: 0, yellowCards: 0, redCard: false },
    { id: '18', name: "Vitão", rating: 57, position: "Meio-Campo", type: "Mensalista", active: true, paid: false, goals: 0, assists: 0, yellowCards: 0, redCard: false },
    { id: '19', name: "Lobão", rating: 74, position: "Goleiro", type: "Mensalista", active: true, paid: false, goals: 0, assists: 0, yellowCards: 0, redCard: false },
    { id: '20', name: "Marcelo", rating: 74, position: "Goleiro", type: "Mensalista", active: true, paid: false, goals: 0, assists: 0, yellowCards: 0, redCard: false },
    { id: '21', name: "Magal", rating: 68, position: "Meio-Campo", type: "Mensalista", active: true, paid: false, goals: 0, assists: 0, yellowCards: 0, redCard: false }
];

// Helper para obter a classe de crachá de nota (Ouro, Prata, Bronze) estilo FIFA
function getRatingBadgeClass(rating) {
    if (rating >= 80) return 'rating-gold';
    if (rating >= 60) return 'rating-silver';
    return 'rating-bronze';
}

// Carregar Dados do LocalStorage ou Inicializar Mock
function initData() {
    const storedPlayers = localStorage.getItem('pelada_players');
    const storedFinance = localStorage.getItem('pelada_finance');
    const storedTeams = localStorage.getItem('pelada_teams');
    const version = localStorage.getItem('pelada_version');
    const storedHistory = localStorage.getItem('pelada_history');
    const storedHistoryMeta = localStorage.getItem('pelada_history_metadata');
    const storedSavedStatus = localStorage.getItem('pelada_current_draw_saved');

    // Força a atualização para a nova lista se a versão no navegador não for v10 (novas notas)
    if (version !== 'v10') {
        state.players = [...mockPlayers];
        savePlayersToStorage();
        localStorage.setItem('pelada_version', 'v10');
        localStorage.removeItem('pelada_teams'); // Limpa sorteios antigos incompatíveis
        state.history = {};
        state.historyMetadata = { totalDraws: 0 };
        saveHistoryToStorage();
        state.currentDrawSaved = false;
        saveCurrentDrawSavedToStorage();
    } else {
        if (storedPlayers) {
            state.players = JSON.parse(storedPlayers);
        } else {
            state.players = [...mockPlayers];
            savePlayersToStorage();
        }

        if (storedHistory) {
            state.history = JSON.parse(storedHistory);
        } else {
            state.history = {};
            saveHistoryToStorage();
        }

        if (storedHistoryMeta) {
            state.historyMetadata = JSON.parse(storedHistoryMeta);
        } else {
            state.historyMetadata = { totalDraws: 0 };
            saveHistoryToStorage();
        }

        if (storedSavedStatus) {
            state.currentDrawSaved = JSON.parse(storedSavedStatus);
        } else {
            state.currentDrawSaved = false;
        }
    }

    if (storedFinance) {
        state.financeConfig = JSON.parse(storedFinance);
    } else {
        saveFinanceToStorage();
    }

    if (storedTeams) {
        state.drawnTeams = JSON.parse(storedTeams);
    }
}

function savePlayersToStorage() {
    localStorage.setItem('pelada_players', JSON.stringify(state.players));
}

function saveFinanceToStorage() {
    localStorage.setItem('pelada_finance', JSON.stringify(state.financeConfig));
}

function saveTeamsToStorage() {
    localStorage.setItem('pelada_teams', JSON.stringify(state.drawnTeams));
}

function saveHistoryToStorage() {
    localStorage.setItem('pelada_history', JSON.stringify(state.history));
    localStorage.setItem('pelada_history_metadata', JSON.stringify(state.historyMetadata));
}

function saveCurrentDrawSavedToStorage() {
    localStorage.setItem('pelada_current_draw_saved', JSON.stringify(state.currentDrawSaved));
}

// ==========================================================================
// CONTROLE DE NAVEGAÇÃO (ABAS)
// ==========================================================================
function initNavigation() {
    const navButtons = document.querySelectorAll('.nav-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.getAttribute('data-tab');

            navButtons.forEach(b => b.classList.remove('active'));
            tabContents.forEach(tab => tab.classList.remove('active'));

            btn.classList.add('active');
            const targetElement = document.getElementById(`tab-${targetTab}`);
            if (targetElement) {
                targetElement.classList.add('active');
            }

            // Atualiza visualizações específicas ao entrar na aba
            if (targetTab === 'jogadores') {
                renderPlayersTable();
                updateSummaryStats();
            } else if (targetTab === 'sorteio') {
                updateDrawSummary();
                renderDrawnTeams();
            } else if (targetTab === 'cartas') {
                renderGalleryCards();
            } else if (targetTab === 'estatisticas') {
                renderTotwTable();
                renderTotwPodium();
            }
        });
    });
}

// ==========================================================================
// ABA: GERENCIAMENTO DE JOGADORES
// ==========================================================================
function initPlayersTab() {
    const ratingRange = document.getElementById('player-rating');
    const ratingVal = document.getElementById('player-rating-val');
    const playerForm = document.getElementById('player-form');
    const btnConfirmAll = document.getElementById('btn-confirm-all');
    const btnUnconfirmAll = document.getElementById('btn-unconfirm-all');
    const searchInput = document.getElementById('search-player');
    const filterPosition = document.getElementById('filter-position');

    // Interatividade do slider de nota no formulário
    if (ratingRange && ratingVal) {
        ratingRange.addEventListener('input', (e) => {
            ratingVal.innerText = e.target.value;
        });
    }

    // Submissão do Formulário (Adicionar Jogador)
    playerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const nameInput = document.getElementById('player-name');
        const posSelect = document.getElementById('player-position');
        const typeSelect = document.getElementById('player-type');

        const newPlayer = {
            id: Date.now().toString(),
            name: nameInput.value.trim(),
            rating: parseInt(ratingRange.value),
            position: posSelect.value,
            type: typeSelect.value,
            active: true, // Adiciona já confirmado por padrão
            paid: false,
            goals: 0,
            assists: 0,
            yellowCards: 0,
            redCard: false
        };

        state.players.push(newPlayer);
        savePlayersToStorage();

        // Resetar formulário
        nameInput.value = '';
        ratingRange.value = 60;
        if (ratingVal) ratingVal.innerText = 60;
        
        // Atualizar UI
        renderPlayersTable();
        updateSummaryStats();
    });

    // Botões de confirmação em massa
    btnConfirmAll.addEventListener('click', () => {
        state.players.forEach(p => p.active = true);
        savePlayersToStorage();
        renderPlayersTable();
        updateSummaryStats();
    });

    btnUnconfirmAll.addEventListener('click', () => {
        state.players.forEach(p => p.active = false);
        savePlayersToStorage();
        renderPlayersTable();
        updateSummaryStats();
    });

    // Eventos de Busca e Filtro
    searchInput.addEventListener('input', renderPlayersTable);
    filterPosition.addEventListener('change', renderPlayersTable);
}

// Renderizar Tabela de Jogadores
function renderPlayersTable() {
    const tableBody = document.getElementById('player-table-body');
    const searchQuery = document.getElementById('search-player').value.toLowerCase();
    const posFilter = document.getElementById('filter-position').value;

    tableBody.innerHTML = '';

    // Filtrar jogadores conforme busca e filtros de posição
    const filteredPlayers = state.players.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchQuery);
        const matchesFilter = posFilter === 'todos' || p.position === posFilter;
        return matchesSearch && matchesFilter;
    });

    // Ordenar jogadores (Confirmados primeiro, depois por posição)
    filteredPlayers.sort((a, b) => {
        if (a.active !== b.active) {
            return a.active ? -1 : 1;
        }
        return a.name.localeCompare(b.name);
    });

    if (filteredPlayers.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-secondary); padding: 2rem;">Nenhum jogador encontrado.</td></tr>`;
        return;
    }

    filteredPlayers.forEach(player => {
        const tr = document.createElement('tr');
        if (!player.active) {
            tr.style.opacity = '0.6';
        }

        const ratingHTML = `<span class="badge rating-badge ${getRatingBadgeClass(player.rating)}">${player.rating}</span>`;

        const thumbnail = getPlayerThumbnail(player.id);
        const avatarHTML = thumbnail 
            ? `<img src="${thumbnail}" alt="${player.name}" style="width: 28px; height: 28px; border-radius: 50%; object-fit: cover; border: 1px solid rgba(255,255,255,0.15); margin-right: 0.5rem; vertical-align: middle;" onerror="this.style.display='none'">`
            : `<div style="width: 28px; height: 28px; border-radius: 50%; background: rgba(255,255,255,0.05); display: inline-flex; align-items: center; justify-content: center; border: 1px solid rgba(255,255,255,0.08); margin-right: 0.5rem; vertical-align: middle;"><i class="fa-solid fa-user" style="font-size: 0.75rem; color: rgba(255,255,255,0.35);"></i></div>`;

        let actionsCellHTML = '';
        if (state.isAdmin) {
            actionsCellHTML = `
                <td style="text-align: center;">
                    <div class="action-btns">
                        <button class="btn-icon edit-btn" data-id="${player.id}" title="Editar Nome/Tipo">
                            <i class="fa-solid fa-pen-to-square"></i>
                        </button>
                        <button class="btn-icon delete-btn" data-id="${player.id}" title="Excluir Jogador">
                            <i class="fa-solid fa-trash-can"></i>
                        </button>
                    </div>
                </td>
            `;
        }

        tr.innerHTML = `
            <td style="text-align: center;">
                <label class="checkbox-custom">
                    <input type="checkbox" ${player.active ? 'checked' : ''} class="toggle-presence" data-id="${player.id}" ${state.isAdmin ? '' : 'disabled'}>
                    <span class="checkmark"></span>
                </label>
            </td>
            <td style="vertical-align: middle; white-space: nowrap;">
                ${avatarHTML}
                <strong class="player-table-name" data-id="${player.id}" style="vertical-align: middle;">${player.name}</strong>
            </td>
            <td>
                <span class="badge badge-position ${player.position}">${player.position}</span>
            </td>
            <td>
                <span class="badge badge-type ${player.type}">${player.type}</span>
            </td>
            <td>
                ${ratingHTML}
            </td>
            ${actionsCellHTML}
        `;

        tableBody.appendChild(tr);
    });

    // Adicionar eventos aos elementos interativos criados dinamicamente
    addTableEventListeners();
}

function addTableEventListeners() {
    // Checkbox de Presença
    document.querySelectorAll('.toggle-presence').forEach(cb => {
        cb.addEventListener('change', (e) => {
            const pId = e.target.getAttribute('data-id');
            const player = state.players.find(p => p.id === pId);
            if (player) {
                player.active = e.target.checked;
                // Se foi desconfirmado, zera o status de pago dele no financeiro
                if (!player.active) {
                    player.paid = false;
                }
                savePlayersToStorage();
                updateSummaryStats();
                // Efeito visual na linha da tabela
                const tr = e.target.closest('tr');
                if (tr) {
                    tr.style.opacity = player.active ? '1' : '0.6';
                }
            }
        });
    });

    // (A edição rápida de notas foi removida da tabela, a alteração é feita pelo modal de edição)

    // Botão de Excluir
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const pId = btn.getAttribute('data-id');
            const player = state.players.find(p => p.id === pId);
            if (player) {
                if (confirm(`Tem certeza que deseja excluir o jogador "${player.name}"?`)) {
                    state.players = state.players.filter(p => p.id !== pId);
                    savePlayersToStorage();
                    renderPlayersTable();
                    updateSummaryStats();
                }
            }
        });
    });

    // Botão de Editar Nome/Tipo/Posição (Abre o Modal Customizado)
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const pId = btn.getAttribute('data-id');
            const player = state.players.find(p => p.id === pId);
            if (player) {
                openEditModal(player);
            }
        });
    });
}

// Atualizar o Painel de Resumo
function updateSummaryStats() {
    const total = state.players.length;
    const confirmed = state.players.filter(p => p.active).length;
    const goleiros = state.players.filter(p => p.active && p.position === 'Goleiro').length;

    document.getElementById('stat-total').innerText = total;
    document.getElementById('stat-confirmed').innerText = confirmed;
    document.getElementById('stat-goleiros').innerText = goleiros;
}


// ==========================================================================
// ABA: SORTEADOR DE TIMES
// ==========================================================================
function initSorteadorTab() {
    const btnDrawTeams = document.getElementById('btn-draw-teams');
    const btnRedraw = document.getElementById('btn-redraw');
    const btnCopyTeams = document.getElementById('btn-copy-teams');
    const btnConfirmDraw = document.getElementById('btn-confirm-draw');

    // Botão de Sortear
    btnDrawTeams.addEventListener('click', triggerDraw);
    btnRedraw.addEventListener('click', triggerDraw);

    // Botão de Copiar Escalação para o WhatsApp
    btnCopyTeams.addEventListener('click', copyTeamsToClipboard);

    // Botão de Confirmar Escalada (Gravar histórico)
    if (btnConfirmDraw) {
        btnConfirmDraw.addEventListener('click', commitCurrentDraw);
    }

    // Botão de Limpar Sorteio
    const btnClearDraw = document.getElementById('btn-clear-draw');
    if (btnClearDraw) {
        btnClearDraw.addEventListener('click', async () => {
            if (confirm("Deseja mesmo limpar o sorteio atual de times?")) {
                state.drawnTeams = [];
                state.currentDrawSaved = false;
                saveCurrentDrawSavedToStorage();
                saveTeamsToStorage();
                renderDrawnTeams();
                
                // Se for admin, remove os times da nuvem também
                if (state.isAdmin) {
                    await saveTeamsToCloud();
                }
            }
        });
    }
}

function updateDrawSummary() {
    const confirmed = state.players.filter(p => p.active);
    const summaryDiv = document.getElementById('draw-info-summary');
    
    if (confirmed.length === 0) {
        summaryDiv.className = "info-alert text-danger";
        summaryDiv.style.borderColor = "rgba(239, 68, 68, 0.2)";
        summaryDiv.style.backgroundColor = "rgba(239, 68, 68, 0.1)";
        summaryDiv.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> Nenhum jogador ativo confirmado! Vá para a aba "Jogadores" e confirme quem vai jogar.`;
    } else {
        const goleiros = confirmed.filter(p => p.position === 'Goleiro').length;
        const linha = confirmed.length - goleiros;
        summaryDiv.className = "info-alert";
        summaryDiv.style.borderColor = "rgba(59, 130, 246, 0.2)";
        summaryDiv.style.backgroundColor = "rgba(59, 130, 246, 0.1)";
        summaryDiv.innerHTML = `<i class="fa-solid fa-circle-info"></i> Temos <strong>${confirmed.length} jogadores ativos</strong> confirmados hoje (${goleiros} Goleiro(s) e ${linha} na Linha).`;
    }
}

function triggerDraw() {
    const activePlayers = state.players.filter(p => p.active);
    if (activePlayers.length < 2) {
        alert("Adicione e confirme pelo menos 2 jogadores para realizar o sorteio.");
        return;
    }

    const numTeams = parseInt(document.getElementById('num-teams').value) || 2;
    const playersPerTeam = parseInt(document.getElementById('players-per-team').value) || 5;
    const maxCapacity = numTeams * playersPerTeam;

    // Se o número de jogadores ativos exceder a capacidade configurada (times * jogadores por time)
    if (activePlayers.length > maxCapacity) {
        const container = document.getElementById('teams-output');
        container.innerHTML = `
            <div class="card glass text-danger" style="grid-column: span 2; border: 1px solid rgba(239, 68, 68, 0.3); background: rgba(239, 68, 68, 0.05); padding: 2.5rem; border-radius: 12px; text-align: center; width: 100%; max-width: 600px; margin: 2rem auto; box-shadow: 0 10px 30px rgba(239, 68, 68, 0.1);">
                <i class="fa-solid fa-triangle-exclamation" style="font-size: 3rem; margin-bottom: 1.25rem; color: #ef4444;"></i>
                <h3 style="color: #ef4444; font-weight: 700; margin-bottom: 0.75rem; font-size: 1.4rem;">Limite de Vagas Excedido</h3>
                <p style="font-size: 1rem; line-height: 1.6; color: var(--text-secondary); margin-bottom: 1rem;">
                    O número de <strong>jogadores ativos (${activePlayers.length})</strong> é maior do que a capacidade máxima configurada de <strong>${maxCapacity} jogadores</strong> (${numTeams} times de ${playersPerTeam} jogadores).
                </p>
                <p style="font-size: 0.85rem; color: var(--text-muted);">
                    Por favor, aumente o número de times, a quantidade de jogadores por time, ou desmarque a presença de alguns jogadores na aba de cadastro.
                </p>
            </div>
        `;
        const resultsContainer = document.getElementById('draw-results-container');
        resultsContainer.classList.remove('d-none');
        
        // Ocultar ações do sorteio que ficam inválidas neste estado de erro
        const btnConfirmDraw = document.getElementById('btn-confirm-draw');
        if (btnConfirmDraw) btnConfirmDraw.classList.add('d-none');
        const btnCopyTeams = document.getElementById('btn-copy-teams');
        if (btnCopyTeams) btnCopyTeams.classList.add('d-none');
        
        resultsContainer.scrollIntoView({ behavior: 'smooth' });
        return;
    }

    try {
        state.drawnTeams = drawTeams(
            state.players, 
            { mode: 'num-teams', value: numTeams },
            state.history,
            state.historyMetadata ? state.historyMetadata.totalDraws : 0
        );
        state.currentDrawSaved = false;
        saveCurrentDrawSavedToStorage();
        saveTeamsToStorage();
        renderDrawnTeams();

        // Mostrar container de resultados com efeito suave
        const resultsContainer = document.getElementById('draw-results-container');
        resultsContainer.classList.remove('d-none');
        resultsContainer.scrollIntoView({ behavior: 'smooth' });
    } catch (err) {
        alert(err.message);
    }
}

// Renderizar os Times na Grid (FUT Cards + Drag and Drop)
function renderDrawnTeams() {
    const container = document.getElementById('teams-output');
    container.innerHTML = '';

    if (!state.drawnTeams || state.drawnTeams.length === 0) {
        document.getElementById('draw-results-container').classList.add('d-none');
        return;
    }

    document.getElementById('draw-results-container').classList.remove('d-none');

    // Garante que os botões de ações fiquem visíveis após um sorteio válido
    const btnCopyTeams = document.getElementById('btn-copy-teams');
    if (btnCopyTeams) btnCopyTeams.classList.remove('d-none');
    const btnConfirmDraw = document.getElementById('btn-confirm-draw');
    if (btnConfirmDraw) btnConfirmDraw.classList.remove('d-none');

    state.drawnTeams.forEach(team => {
        const teamCard = document.createElement('div');
        teamCard.className = 'team-card';
        teamCard.setAttribute('data-team-id', team.id);

        // Aplica cores específicas para Time A (0), B (1) e C (2)
        if (team.id === 0) teamCard.classList.add('team-color-a');
        else if (team.id === 1) teamCard.classList.add('team-color-b');
        else if (team.id === 2) teamCard.classList.add('team-color-c');

        // Header do Time (Nome editável e Média)
        teamCard.innerHTML = `
            <div class="team-card-header">
                <input type="text" class="team-name-input" value="${team.name}" data-team-id="${team.id}" title="Clique para editar o nome do time">
                <span class="team-avg-badge"><i class="fa-solid fa-star"></i> Média: ${team.avgRating}</span>
            </div>
            <div class="team-players-list" data-team-id="${team.id}">
                <!-- Cartões de Jogadores -->
            </div>
        `;

        const playersListContainer = teamCard.querySelector('.team-players-list');

        if (team.players.length === 0) {
            playersListContainer.innerHTML = `<div style="color: var(--text-muted); font-size: 0.8rem; padding: 1.5rem 0; width:100%; text-align:center;">Arraste jogadores aqui...</div>`;
        } else {
            team.players.forEach(player => {
                const card = document.createElement('div');
                card.setAttribute('draggable', 'true');
                card.setAttribute('data-player-id', player.id);
                card.setAttribute('data-rating', player.rating);

                // Abreviação da posição
                let posAbbr = 'LIN';
                if (player.position === 'Goleiro') posAbbr = 'GOL';
                else if (player.position === 'Zagueiro') posAbbr = 'DF';
                else if (player.position === 'Meio-Campo') posAbbr = 'MC';
                else if (player.position === 'Atacante') posAbbr = 'ATA';

                const cardEntry = getPlayerCardEntry(player.id);
                if (cardEntry) {
                    card.className = 'fut-card has-image-card';
                    card.innerHTML = `
                        <div class="ppro-card">
                            <img class="ppro-card__img" src="public${cardEntry.card.webp}" alt="${player.name}" decoding="async" loading="lazy" onerror="this.src='public${cardEntry.card.png}'">
                            <div class="ppro-card__rating" style="
                                left: ${cardEntry.ratingSlot.xPercent * 100}%;
                                top: ${cardEntry.ratingSlot.yPercent * 100}%;
                                width: ${cardEntry.ratingSlot.widthPercent * 100}%;
                                height: ${cardEntry.ratingSlot.heightPercent * 100}%;
                                justify-content: ${cardEntry.ratingSlot.textAlign === 'left' ? 'flex-start' : cardEntry.ratingSlot.textAlign === 'right' ? 'flex-end' : 'center'};
                                color: ${cardEntry.ratingSlot.textColor || '#2a1e04'};
                                text-shadow: ${cardEntry.ratingSlot.textShadow || 'none'};
                                font-weight: ${cardEntry.ratingSlot.fontWeight || '800'};
                             ">${Math.round(player.rating)}</div>
                            
                            ${player.goalkeeperBadge ? `
                            <div class="ppro-card__gk-badge" style="position: absolute; top: -5px; right: -5px; z-index: 10;">
                                <span class="gol-badge ${player.goalkeeperBadge === 'Goleiro Fixo' ? 'fixed' : 'drawn'}" title="${player.goalkeeperBadge === 'Goleiro Fixo' ? 'Goleiro Fixo (Alterna entre A e B, isento de banco)' : 'Goleiro Sorteado (Sujeito a rodízio no banco)'}">${player.goalkeeperBadge === 'Goleiro Fixo' ? 'Fixo' : 'Sorteado'}</span>
                            </div>` : ''}
                        </div>
                    `;
                } else {
                    card.className = 'fut-card';
                    const justifyStyle = player.goalkeeperBadge ? '' : 'style="justify-content: center;"';
                    card.innerHTML = `
                        <div class="fut-badge-header" ${justifyStyle}>
                            <span class="fut-pos">${posAbbr}</span>
                            ${player.goalkeeperBadge ? `<span class="gol-badge ${player.goalkeeperBadge === 'Goleiro Fixo' ? 'fixed' : 'drawn'}" title="${player.goalkeeperBadge === 'Goleiro Fixo' ? 'Goleiro Fixo (Alterna entre A e B, isento de banco)' : 'Goleiro Sorteado (Sujeito a rodízio no banco)'}">${player.goalkeeperBadge === 'Goleiro Fixo' ? 'Fixo' : 'Sorteado'}</span>` : ''}
                        </div>
                        <div class="fut-avatar">
                            <i class="fa-solid fa-shirt"></i>
                        </div>
                        <div class="fut-name">${player.name.split(' ')[0]}</div>
                    `;
                }

                // Eventos de Drag & Drop para o Card
                card.addEventListener('dragstart', (e) => {
                    e.dataTransfer.setData('text/plain', player.id);
                    e.dataTransfer.setData('origin-team-id', team.id);
                    card.style.opacity = '0.4';
                });

                card.addEventListener('dragend', () => {
                    card.style.opacity = '1';
                });

                playersListContainer.appendChild(card);
            });
        }

        // Configurar Zona de Drop no container da lista de jogadores do time
        playersListContainer.addEventListener('dragover', (e) => {
            e.preventDefault();
            playersListContainer.style.backgroundColor = 'rgba(255,255,255,0.03)';
            playersListContainer.style.borderRadius = '10px';
        });

        playersListContainer.addEventListener('dragleave', () => {
            playersListContainer.style.backgroundColor = 'transparent';
        });

        playersListContainer.addEventListener('drop', (e) => {
            e.preventDefault();
            playersListContainer.style.backgroundColor = 'transparent';
            
            const pId = e.dataTransfer.getData('text/plain');
            const originTeamId = parseInt(e.dataTransfer.getData('origin-team-id'));
            const targetTeamId = parseInt(team.id);

            if (originTeamId === targetTeamId) return;

            // Mover jogador no estado
            const originTeam = state.drawnTeams.find(t => t.id === originTeamId);
            const targetTeam = state.drawnTeams.find(t => t.id === targetTeamId);
            
            if (originTeam && targetTeam) {
                const playerIndex = originTeam.players.findIndex(p => p.id === pId);
                if (playerIndex !== -1) {
                    const [player] = originTeam.players.splice(playerIndex, 1);
                    targetTeam.players.push(player);

                    // Recalcular médias das notas
                    [originTeam, targetTeam].forEach(t => {
                        if (t.players.length === 0) {
                            t.avgRating = 0;
                        } else {
                            const sum = t.players.reduce((s, p) => s + p.rating, 0);
                            t.avgRating = parseFloat((sum / t.players.length).toFixed(1));
                        }
                    });

                    saveTeamsToStorage();
                    renderDrawnTeams(); // Re-renderiza para atualizar a UI
                }
            }
        });

        container.appendChild(teamCard);
    });

    // Listener para renomear times
    document.querySelectorAll('.team-name-input').forEach(input => {
        input.addEventListener('change', (e) => {
            const teamId = parseInt(e.target.getAttribute('data-team-id'));
            const team = state.drawnTeams.find(t => t.id === teamId);
            if (team && e.target.value.trim() !== '') {
                team.name = e.target.value.trim();
                saveTeamsToStorage();
            }
        });
    });

    updateConfirmButtonUI();
}

// Copiar times formatados em texto para colar no WhatsApp
function copyTeamsToClipboard() {
    if (!state.drawnTeams || state.drawnTeams.length === 0) return;

    let text = `⚽ *PELADA PRO - TIMES DEFINIDOS* ⚽\n\n`;

    state.drawnTeams.forEach(team => {
        text += `*${team.name.toUpperCase()}* (Média: ${team.avgRating} ★)\n`;
        
        // Separa goleiros e linha para ficar bonita a escalação no WhatsApp
        const goleiros = team.players.filter(p => p.position === 'Goleiro');
        const linha = team.players.filter(p => p.position !== 'Goleiro');

        if (goleiros.length > 0) {
            goleiros.forEach(g => {
                text += `🧤 ${g.name}\n`;
            });
        }

        linha.forEach(l => {
            let posIcon = '🏃‍♂️';
            if (l.position === 'Zagueiro') posIcon = '🛡️';
            else if (l.position === 'Meio-Campo') posIcon = '🪄';
            else if (l.position === 'Atacante') posIcon = '⚡';

            text += `${posIcon} ${l.name}\n`;
        });

        text += `\n`;
    });

    text += `_Gerado por Pelada PRO_ 🤙`;

    navigator.clipboard.writeText(text)
        .then(() => {
            alert("Times copiados com sucesso! Agora é só colar no WhatsApp do grupo. 📲");
        })
        .catch(err => {
            console.error("Erro ao copiar: ", err);
            alert("Não foi possível copiar automaticamente. Selecione e copie o texto manualmente.");
        });
}


// A aba de Controle Financeiro foi descontinuada e substituída pela Galeria de Cards.


// ==========================================================================
// ABA: ESTATÍSTICAS E SÚMULA
// ==========================================================================
// ==========================================================================
// ABA: RANKING - TIME DA SEMANA
// ==========================================================================
// ==========================================================================
// ABA: RANKING - TIME DA SEMANA
// ==========================================================================
const BUCKET_URL = 'https://kvdb.io/peladapro_9fc2bfc2/wins';
const TEAMS_BUCKET_URL = 'https://kvdb.io/peladapro_9fc2bfc2/current_teams';

async function loadTeamsFromCloud() {
    try {
        const res = await fetch(TEAMS_BUCKET_URL);
        if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data)) {
                state.drawnTeams = data;
                saveTeamsToStorage();
                
                const resultsContainer = document.getElementById('draw-results-container');
                if (resultsContainer) {
                    if (state.drawnTeams.length > 0) {
                        resultsContainer.classList.remove('d-none');
                    } else {
                        resultsContainer.classList.add('d-none');
                    }
                }
                renderDrawnTeams();
                updateDrawSummary();
            }
        }
    } catch (e) {
        console.warn("[Pelada PRO] Não foi possível carregar os times da nuvem:", e);
    }
}

async function saveTeamsToCloud() {
    try {
        await fetch(TEAMS_BUCKET_URL, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(state.drawnTeams || [])
        });
    } catch (e) {
        console.error("[Pelada PRO] Erro ao salvar os times na nuvem:", e);
    }
}

async function loadTotwFromCloud() {
    try {
        const res = await fetch(BUCKET_URL);
        if (res.ok) {
            const data = await res.json();
            if (data && typeof data === 'object') {
                state.players.forEach(p => {
                    if (data[p.id] !== undefined) {
                        p.totwWins = data[p.id];
                    } else {
                        p.totwWins = p.totwWins || 0;
                    }
                });
                savePlayersToStorage();
                renderTotwTable();
                renderTotwPodium();
            }
        } else if (res.status === 404) {
            // Se o bucket ainda não existe, cria-o enviando os dados locais
            await saveTotwToCloud();
        }
    } catch (e) {
        console.warn("[Pelada PRO] Não foi possível sincronizar com a nuvem, usando dados locais:", e);
    }
}

async function saveTotwToCloud() {
    try {
        const data = {};
        state.players.forEach(p => {
            data[p.id] = p.totwWins || 0;
        });
        await fetch(BUCKET_URL, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
    } catch (e) {
        console.error("[Pelada PRO] Erro ao salvar na nuvem:", e);
    }
}

function updateAdminUI() {
    const btnLogin = document.getElementById('btn-admin-login');
    const btnLogout = document.getElementById('btn-admin-logout');
    const cardNovoJogador = document.getElementById('card-novo-jogador');
    const cardConfigSorteio = document.getElementById('card-config-sorteio');
    const btnConfirmDraw = document.getElementById('btn-confirm-draw');
    const btnRedraw = document.getElementById('btn-redraw');
    const btnCopyTeams = document.getElementById('btn-copy-teams');
    const btnResetTotw = document.getElementById('btn-reset-totw');

    // Elementos de lote de jogadores
    const btnConfirmAll = document.getElementById('btn-confirm-all');
    const btnUnconfirmAll = document.getElementById('btn-unconfirm-all');

    // Cabeçalhos de ações nas tabelas
    const headerActions = document.getElementById('totw-actions-header');
    const headerPlayerActions = document.getElementById('player-actions-header');

    if (state.isAdmin) {
        if (btnLogin) btnLogin.classList.add('d-none');
        if (btnLogout) btnLogout.classList.remove('d-none');
        if (cardNovoJogador) cardNovoJogador.classList.remove('d-none');
        if (cardConfigSorteio) cardConfigSorteio.classList.remove('d-none');
        
        if (btnConfirmDraw) {
            if (state.drawnTeams && state.drawnTeams.length > 0) {
                btnConfirmDraw.classList.remove('d-none');
            } else {
                btnConfirmDraw.classList.add('d-none');
            }
        }
        if (btnRedraw) btnRedraw.classList.remove('d-none');
        if (btnCopyTeams) btnCopyTeams.classList.remove('d-none');
        if (btnResetTotw) btnResetTotw.classList.remove('d-none');
        if (btnConfirmAll) btnConfirmAll.classList.remove('d-none');
        if (btnUnconfirmAll) btnUnconfirmAll.classList.remove('d-none');

        if (headerActions) headerActions.classList.remove('d-none');
        if (headerPlayerActions) headerPlayerActions.classList.remove('d-none');
    } else {
        if (btnLogin) btnLogin.classList.remove('d-none');
        if (btnLogout) btnLogout.classList.add('d-none');
        if (cardNovoJogador) cardNovoJogador.classList.add('d-none');
        if (cardConfigSorteio) cardConfigSorteio.classList.add('d-none');
        if (btnConfirmDraw) btnConfirmDraw.classList.add('d-none');
        if (btnRedraw) btnRedraw.classList.add('d-none');
        if (btnCopyTeams) btnCopyTeams.classList.add('d-none');
        if (btnResetTotw) btnResetTotw.classList.add('d-none');
        if (btnConfirmAll) btnConfirmAll.classList.add('d-none');
        if (btnUnconfirmAll) btnUnconfirmAll.classList.add('d-none');

        if (headerActions) headerActions.classList.add('d-none');
        if (headerPlayerActions) headerPlayerActions.classList.add('d-none');
    }
}

function renderGalleryCards() {
    const grid = document.getElementById('gallery-grid');
    if (!grid) return;
    grid.innerHTML = '';

    // Ordenar todos os jogadores por nota (decrescente)
    const sorted = [...state.players].sort((a, b) => b.rating - a.rating);

    if (sorted.length === 0) {
        grid.innerHTML = `<div style="text-align: center; color: var(--text-secondary); width: 100%; padding: 2rem;">Nenhum card disponível. Cadastre jogadores primeiro!</div>`;
        return;
    }

    sorted.forEach(player => {
        const card = document.createElement('div');
        card.className = 'fut-card';

        let posAbbr = 'LIN';
        if (player.position === 'Goleiro') posAbbr = 'GOL';
        else if (player.position === 'Zagueiro') posAbbr = 'DF';
        else if (player.position === 'Meio-Campo') posAbbr = 'MC';
        else if (player.position === 'Atacante') posAbbr = 'ATA';

        const cardEntry = getPlayerCardEntry(player.id);
        if (cardEntry) {
            card.classList.add('has-image-card');
            card.innerHTML = `
                <div class="ppro-card">
                    <img class="ppro-card__img" src="public${cardEntry.card.webp}" alt="${player.name}" onerror="this.src='public${cardEntry.card.png}'">
                    <div class="ppro-card__rating" style="
                        left: ${cardEntry.ratingSlot.xPercent * 100}%;
                        top: ${cardEntry.ratingSlot.yPercent * 100}%;
                        width: ${cardEntry.ratingSlot.widthPercent * 100}%;
                        height: ${cardEntry.ratingSlot.heightPercent * 100}%;
                        justify-content: ${cardEntry.ratingSlot.textAlign === 'left' ? 'flex-start' : cardEntry.ratingSlot.textAlign === 'right' ? 'flex-end' : 'center'};
                        color: ${cardEntry.ratingSlot.textColor || '#2a1e04'};
                        text-shadow: ${cardEntry.ratingSlot.textShadow || 'none'};
                        font-weight: ${cardEntry.ratingSlot.fontWeight || '800'};
                    ">${Math.round(player.rating)}</div>
                </div>
            `;
        } else {
            const badgeClass = getRatingBadgeClass(player.rating);
            card.classList.add(badgeClass);
            card.innerHTML = `
                <div class="fut-badge-header" style="justify-content: center;">
                    <span class="fut-pos">${posAbbr}</span>
                </div>
                <div class="fut-avatar">
                    <i class="fa-solid fa-shirt"></i>
                </div>
                <div class="fut-name">${player.name.split(' ')[0]}</div>
            `;
        }

        grid.appendChild(card);
    });
}

function initStatsTab() {
    const btnResetTotw = document.getElementById('btn-reset-totw');
    const btnLogin = document.getElementById('btn-admin-login');
    const btnLogout = document.getElementById('btn-admin-logout');

    if (btnResetTotw) {
        btnResetTotw.addEventListener('click', async () => {
            if (confirm("Tem certeza que deseja ZERAR o ranking do Time da Semana de todos os jogadores? Esta ação não pode ser desfeita.")) {
                state.players.forEach(p => {
                    p.totwWins = 0;
                });
                savePlayersToStorage();
                await saveTotwToCloud();
                renderTotwTable();
                renderTotwPodium();
                alert("Ranking redefinido com sucesso na nuvem!");
            }
        });
    }

    if (btnLogin && btnLogout) {
        // Checar estado inicial do admin
        const cachedAdmin = localStorage.getItem('pelada_is_admin') === 'true';
        state.isAdmin = cachedAdmin;
        updateAdminUI();

        btnLogin.addEventListener('click', () => {
            const password = prompt("Digite a senha do administrador para liberar a edição:");
            if (password === 'sesinl') { // Senha padrão solicitada
                state.isAdmin = true;
                localStorage.setItem('pelada_is_admin', 'true');
                updateAdminUI();
                renderTotwTable();
                renderPlayersTable(); // Re-renderiza a tabela de jogadores para mostrar opções
                alert("Modo de edição ativado! Painel de controle liberado.");
            } else if (password !== null) {
                alert("Senha incorreta!");
            }
        });

        btnLogout.addEventListener('click', () => {
            state.isAdmin = false;
            localStorage.setItem('pelada_is_admin', 'false');
            updateAdminUI();
            renderTotwTable();
            renderPlayersTable(); // Re-renderiza a tabela de jogadores para ocultar opções
            alert("Modo de edição desativado. Painel em modo leitura.");
        });
    }

    // Carrega do Cloud na inicialização da aba
    loadTotwFromCloud();
}

function renderTotwTable() {
    const tableBody = document.getElementById('totw-table-body');
    if (!tableBody) return;
    tableBody.innerHTML = '';

    // Exibe/oculta o cabeçalho das ações
    const headerActions = document.getElementById('totw-actions-header');
    if (headerActions) {
        if (state.isAdmin) {
            headerActions.classList.remove('d-none');
        } else {
            headerActions.classList.add('d-none');
        }
    }

    const sortedPlayers = [...state.players].sort((a, b) => {
        const winsA = a.totwWins || 0;
        const winsB = b.totwWins || 0;
        if (winsB !== winsA) return winsB - winsA;
        return a.name.localeCompare(b.name);
    });

    if (sortedPlayers.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="3" style="text-align: center; color: var(--text-secondary); padding: 2rem;">Nenhum jogador cadastrado. Adicione jogadores na aba "Jogadores".</td></tr>`;
        return;
    }

    sortedPlayers.forEach(player => {
        const tr = document.createElement('tr');
        const wins = player.totwWins || 0;

        const thumbnail = getPlayerThumbnail(player.id);
        const avatarHTML = thumbnail 
            ? `<img src="${thumbnail}" alt="${player.name}" style="width: 28px; height: 28px; border-radius: 50%; object-fit: cover; border: 1px solid rgba(255,255,255,0.15); margin-right: 0.5rem; float: left; margin-top: 2px;" onerror="this.style.display='none'">`
            : `<div style="width: 28px; height: 28px; border-radius: 50%; background: rgba(255,255,255,0.05); display: inline-flex; align-items: center; justify-content: center; border: 1px solid rgba(255,255,255,0.08); margin-right: 0.5rem; float: left; margin-top: 2px;"><i class="fa-solid fa-user" style="font-size: 0.75rem; color: rgba(255,255,255,0.35);"></i></div>`;

        let actionsHTML = '';
        if (state.isAdmin) {
            actionsHTML = `
                <td style="text-align: center;">
                    <div class="counter-input" style="gap: 0.75rem;">
                        <button class="counter-btn dec-totw" data-id="${player.id}" style="width: 32px; height: 32px; font-size: 1.1rem;">-1</button>
                        <button class="counter-btn inc-totw" data-id="${player.id}" style="width: 44px; height: 32px; font-size: 1.1rem; background-color: var(--primary); border-color: var(--primary); color: var(--bg-primary); font-weight: 800;">+1</button>
                    </div>
                </td>
            `;
        }

        tr.innerHTML = `
            <td>
                ${avatarHTML}
                <div style="overflow: hidden;">
                    <strong style="vertical-align: middle;">${player.name}</strong>
                    <div style="font-size:0.75rem; color:var(--text-secondary)">${player.position}</div>
                </div>
            </td>
            <td style="text-align: center;">
                <span class="counter-value" style="font-size: 1.2rem; font-weight: 700;">${wins}</span>
            </td>
            ${actionsHTML}
        `;

        if (state.isAdmin) {
            tr.querySelector('.inc-totw').addEventListener('click', async () => {
                player.totwWins = (player.totwWins || 0) + 1;
                savePlayersToStorage();
                renderTotwTable();
                renderTotwPodium();
                await saveTotwToCloud();
            });

            tr.querySelector('.dec-totw').addEventListener('click', async () => {
                if ((player.totwWins || 0) > 0) {
                    player.totwWins--;
                    savePlayersToStorage();
                    renderTotwTable();
                    renderTotwPodium();
                    await saveTotwToCloud();
                }
            });
        }

        tableBody.appendChild(tr);
    });
}

function renderTotwPodium() {
    const podiumEl = document.getElementById('totw-podium');
    if (!podiumEl) return;
    podiumEl.innerHTML = '';

    const sortedTotw = [...state.players]
        .filter(p => (p.totwWins || 0) > 0)
        .sort((a, b) => (b.totwWins || 0) - (a.totwWins || 0));

    if (sortedTotw.length === 0) {
        podiumEl.innerHTML = `<div style="text-align: center; color: var(--text-secondary); padding: 1rem 0;">Nenhum jogador eleito ainda.</div>`;
        return;
    }

    const top3 = sortedTotw.slice(0, 3);
    const classes = ['mvp', 'scorer', 'assist']; 
    const icons = ['fa-crown text-warning', 'fa-medal text-info', 'fa-award text-success'];

    top3.forEach((p, idx) => {
        const item = document.createElement('div');
        item.className = `podium-item ${classes[idx]}`;
        item.innerHTML = `
            <i class="fa-solid ${icons[idx]} podium-icon"></i>
            <span class="podium-name">${p.name}</span>
            <span class="podium-lbl">${p.totwWins} ${p.totwWins === 1 ? 'Vitória' : 'Vitórias'}</span>
        `;
        podiumEl.appendChild(item);
    });
}

// ==========================================================================
// MODAL DE EDIÇÃO DE JOGADOR
// ==========================================================================
function initEditModal() {
    const editForm = document.getElementById('edit-player-form');
    const editRatingRange = document.getElementById('edit-player-rating');
    const editRatingVal = document.getElementById('edit-player-rating-val');

    // Interatividade do range de nota no modal
    if (editRatingRange && editRatingVal) {
        editRatingRange.addEventListener('input', (e) => {
            editRatingVal.innerText = e.target.value;
        });
    }

    // Submeter formulário de edição
    editForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = document.getElementById('edit-player-id').value;
        const player = state.players.find(p => p.id === id);
        
        if (player) {
            const nameInput = document.getElementById('edit-player-name');
            const posSelect = document.getElementById('edit-player-position');
            const typeSelect = document.getElementById('edit-player-type');
            
            player.name = nameInput.value.trim();
            player.position = posSelect.value;
            player.type = typeSelect.value;
            player.rating = parseInt(editRatingRange.value);

            savePlayersToStorage();
            
            // Recalcular médias se os times já foram sorteados
            if (state.drawnTeams && state.drawnTeams.length > 0) {
                state.drawnTeams.forEach(team => {
                    const matchedPlayers = team.players.map(tp => {
                        const updated = state.players.find(p => p.id === tp.id);
                        return updated ? updated : tp;
                    });
                    team.players = matchedPlayers;
                    
                    if (team.players.length === 0) {
                        team.avgRating = 0;
                    } else {
                        const sum = team.players.reduce((s, p) => s + p.rating, 0);
                        team.avgRating = parseFloat((sum / team.players.length).toFixed(1));
                    }
                });
                saveTeamsToStorage();
            }

            renderPlayersTable();
            updateSummaryStats();
            closeEditModal();
        }
    });

    // Fechar Modal
    document.getElementById('btn-close-modal').addEventListener('click', closeEditModal);
    document.getElementById('btn-cancel-edit').addEventListener('click', closeEditModal);
    document.getElementById('edit-modal').addEventListener('click', (e) => {
        if (e.target.id === 'edit-modal') {
            closeEditModal();
        }
    });
}

function openEditModal(player) {
    document.getElementById('edit-player-id').value = player.id;
    document.getElementById('edit-player-name').value = player.name;
    document.getElementById('edit-player-position').value = player.position;
    document.getElementById('edit-player-type').value = player.type;
    
    const editRatingRange = document.getElementById('edit-player-rating');
    const editRatingVal = document.getElementById('edit-player-rating-val');
    if (editRatingRange && editRatingVal) {
        editRatingRange.value = player.rating;
        editRatingVal.innerText = player.rating;
    }

    document.getElementById('edit-modal').classList.remove('d-none');
}

function closeEditModal() {
    document.getElementById('edit-modal').classList.add('d-none');
}

// ==========================================================================
// INICIALIZAÇÃO GERAL DO APLICATIVO
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
    initData();
    initNavigation();
    initPlayersTab();
    initEditModal();
    initSorteadorTab();
    // A aba financeiro foi descontinuada
    initStatsTab();

    // Carregar manifesto de cartas e renderizar/atualizar elementos associados
    loadManifest().then(() => {
        renderPlayersTable();
        renderDrawnTeams();
        renderTotwTable();
        renderTotwPodium();
        renderGalleryCards();
    });

    // Render Inicial
    renderPlayersTable();
    updateSummaryStats();
    updateConfirmButtonUI();
    renderGalleryCards();
    updateAdminUI();

    // Sincronizar dados com a nuvem de forma assíncrona
    loadTeamsFromCloud();
    loadTotwFromCloud();
});

// ==========================================================================
// FUNÇÕES DE HISTÓRICO DE SORTEIO JUSTO
// ==========================================================================
function commitCurrentDraw() {
    if (!state.drawnTeams || state.drawnTeams.length === 0) {
        alert("Não há nenhum sorteio para confirmar.");
        return;
    }

    if (state.currentDrawSaved) {
        if (!confirm("Este sorteio já foi gravado no histórico. Deseja gravar novamente? (Isso atualizará os dados de rotatividade mais uma vez)")) {
            return;
        }
    }

    // Incrementar contagem geral de rodadas
    state.historyMetadata.totalDraws++;

    // Salvar estado para cada jogador
    state.drawnTeams.forEach(team => {
        const teamName = team.name.replace("Time ", ""); // "A", "B", "C"
        
        team.players.forEach(p => {
            if (!state.history[p.id]) {
                state.history[p.id] = {
                    playerId: p.id,
                    timesInC: 0,
                    timesInC_last3: [],
                    lastTeam: null,
                    teammateCounts: {},
                    totalDraws: 0
                };
            }

            const h = state.history[p.id];
            h.totalDraws++;
            h.lastTeam = teamName;
            h.timesInC += (teamName === 'C' ? 1 : 0);
            h.timesInC_last3.push(teamName === 'C' ? 1 : 0);
            if (h.timesInC_last3.length > 3) {
                h.timesInC_last3.shift();
            }

            // Atualiza teammateCounts
            team.players.forEach(other => {
                if (other.id === p.id) return;
                h.teammateCounts[other.id] = (h.teammateCounts[other.id] || 0) + 1;
            });
        });
    });

    state.currentDrawSaved = true;
    saveHistoryToStorage();
    saveCurrentDrawSavedToStorage();
    saveTeamsToStorage();
    
    updateConfirmButtonUI();
    
    // Sincroniza os times sorteados salvos com a nuvem
    saveTeamsToCloud();
    
    alert("Sorteio gravado com sucesso no histórico de presença! ⚽");
}

function resetHistory() {
    if (confirm("Tem certeza que deseja ZERAR todo o histórico de sorteios e presença? Essa ação redefinirá a rotatividade do banco e não pode ser desfeita.")) {
        state.history = {};
        state.historyMetadata = { totalDraws: 0 };
        state.currentDrawSaved = false;
        saveHistoryToStorage();
        saveCurrentDrawSavedToStorage();
        updateConfirmButtonUI();
        alert("Histórico de sorteios redefinido com sucesso!");
    }
}

// A definição de renderHistoryStats foi removida, mantendo o histórico nos dados do algoritmo

function updateConfirmButtonUI() {
    const btnConfirmDraw = document.getElementById('btn-confirm-draw');
    if (!btnConfirmDraw) return;

    if (!state.drawnTeams || state.drawnTeams.length === 0) {
        btnConfirmDraw.classList.add('d-none');
        return;
    }

    btnConfirmDraw.classList.remove('d-none');

    if (state.currentDrawSaved) {
        btnConfirmDraw.className = "btn btn-success btn-lg";
        btnConfirmDraw.innerHTML = `<i class="fa-solid fa-circle-check"></i> Escalada Gravada!`;
        btnConfirmDraw.style.backgroundColor = "#10b981";
        btnConfirmDraw.style.borderColor = "#10b981";
    } else {
        btnConfirmDraw.className = "btn btn-warning btn-lg";
        btnConfirmDraw.innerHTML = `<i class="fa-solid fa-floppy-disk"></i> Gravar no Histórico`;
        btnConfirmDraw.style.backgroundColor = "";
        btnConfirmDraw.style.borderColor = "";
    }
}

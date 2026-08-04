/**
 * Algoritmo de Balanceamento e Sorteio de Times - Pelada PRO
 */

const CONFIG = {
    RECENCY_WEIGHT: 0.6,
    MAX_SKILL_DIFF: 0.3,
    PAIR_PENALTY_WEIGHT: 1.5,
    NO_CONSECUTIVE_C: true,
    LOCAL_SEARCH_ITERATIONS: 200,
};

/**
 * Algoritmo Efraimidis-Spirakis de Sorteio Ponderado Sem Reposição
 * @param {Array} items - Itens com { id, weight }
 * @param {number} k - Quantidade de itens a selecionar
 * @returns {Array} - Array de IDs selecionados
 */
function weightedSampleWithoutReplacement(items, k) {
    const keyed = items.map(it => ({
        id: it.id,
        key: Math.pow(Math.random(), 1 / Math.max(it.weight, 0.0001))
    }));
    keyed.sort((a, b) => b.key - a.key);
    return keyed.slice(0, k).map(x => x.id);
}

/**
 * Realiza o sorteio equilibrando os times por nota, posições e histórico
 * @param {Array} players - Lista de todos os jogadores (objetos com nome, nota, posicao, etc)
 * @param {Object} config - Configurações do sorteio { mode: 'num-teams'|'players-per-team', value: number }
 * @param {Object} histories - Histórico de sorteios por jogador { playerId -> PlayerHistory }
 * @param {number} totalDraws - Quantidade total de rodadas já gravadas
 * @returns {Array} - Array de objetos representando os times sorteados
 */
function drawTeamsInternal(players, config, histories = {}, totalDraws = 0) {
    // 1. Filtrar apenas os jogadores confirmados (ativos)
    const activePlayers = players.filter(p => p.active);
    
    if (activePlayers.length < 2) {
        throw new Error("Adicione e confirme pelo menos 2 jogadores para realizar o sorteio.");
    }

    // 2. Determinar o número de times
    let numTeams = 2;
    if (config.mode === 'num-teams') {
        numTeams = parseInt(config.value);
    } else {
        const playersPerTeam = parseInt(config.value);
        numTeams = Math.max(2, Math.round(activePlayers.length / playersPerTeam));
    }

    // Evitar que haja mais times do que jogadores
    if (numTeams > activePlayers.length) {
        numTeams = activePlayers.length;
    }

    // 3. Inicializar os times e tamanhos alvos
    const N = activePlayers.length;
    const targetSizes = Array.from({ length: numTeams }, (_, i) => 
        Math.floor(N / numTeams) + (i < (N % numTeams) ? 1 : 0)
    );

    const teams = Array.from({ length: numTeams }, (_, i) => ({
        id: i,
        name: `Time ${String.fromCharCode(65 + i)}`,
        players: [],
        avgRating: 0
    }));

    // Garantir histórico de cada jogador ativo (se não existir, inicia novo)
    const secureHistories = {};
    activePlayers.forEach(p => {
        if (histories && histories[p.id]) {
            secureHistories[p.id] = histories[p.id];
        } else {
            secureHistories[p.id] = {
                playerId: p.id,
                timesInC: 0,
                timesInC_last3: [],
                lastTeam: null,
                teammateCounts: {},
                totalDraws: 0
            };
        }
    });

    // 4. Separar goleiros e linha
    const goleiros = activePlayers.filter(p => p.position === 'Goleiro');
    const linha = activePlayers.filter(p => p.position !== 'Goleiro');

    // Limpar badges antigas de goleiro nos objetos mutados para renderização
    activePlayers.forEach(p => delete p.goalkeeperBadge);

    // 5. Função de embaralhar (Fisher-Yates) para garantir aleatoriedade
    function shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    shuffle(goleiros);
    shuffle(linha);

    // FASE 1 — Goleiros
    let goleirosA_B = [];
    let goleirosC = [];

    // Se tiver 2 ou menos goleiros, eles não vão para o Time C
    if (goleiros.length <= 2 && numTeams >= 2) {
        // Distribuir entre A e B de forma alternada usando histórico lastTeam
        const gol1 = goleiros[0];
        const gol2 = goleiros[1];

        if (gol1 && gol2) {
            const gol1_h = secureHistories[gol1.id];
            const gol2_h = secureHistories[gol2.id];

            if (gol1_h.lastTeam === 'A' || gol2_h.lastTeam === 'B') {
                teams[0].players.push(gol2);
                teams[1].players.push(gol1);
                gol2.goalkeeperBadge = "Goleiro Fixo";
                gol1.goalkeeperBadge = "Goleiro Fixo";
            } else {
                teams[0].players.push(gol1);
                teams[1].players.push(gol2);
                gol1.goalkeeperBadge = "Goleiro Fixo";
                gol2.goalkeeperBadge = "Goleiro Fixo";
            }
        } else if (gol1) {
            teams[0].players.push(gol1);
            gol1.goalkeeperBadge = "Goleiro Fixo";
        }
    } else if (goleiros.length > 2 && numTeams >= 2) {
        // 3+ Goleiros: Os que excederem as vagas de A e B vão para o Time C (banco de goleiros)
        const numGoleirosEmC = goleiros.length - 2;

        const pesosGoleiros = goleiros.map(g => {
            const h = secureHistories[g.id];
            const mediaGeral = totalDraws * numGoleirosEmC / goleiros.length;
            const deficitLongoPrazo = mediaGeral - h.timesInC;
            const avgLast3 = h.timesInC_last3.length > 0 ? (h.timesInC_last3.reduce((a, b) => a + b, 0) / h.timesInC_last3.length) : 0;
            const deficitRecente = 1 - avgLast3;
            
            let score = (1 - CONFIG.RECENCY_WEIGHT) * deficitLongoPrazo + CONFIG.RECENCY_WEIGHT * deficitRecente;
            let weight = Math.exp(score);
            
            if (CONFIG.NO_CONSECUTIVE_C && h.lastTeam === 'C') {
                weight *= 0.05;
            }
            return { id: g.id, weight, player: g };
        });

        const goleirosC_ids = weightedSampleWithoutReplacement(pesosGoleiros, numGoleirosEmC);
        
        goleiros.forEach(g => {
            if (goleirosC_ids.includes(g.id)) {
                goleirosC.push(g);
                g.goalkeeperBadge = "Goleiro Sorteado";
            } else {
                goleirosA_B.push(g);
                g.goalkeeperBadge = "Goleiro Sorteado";
            }
        });

        shuffle(goleirosA_B);
        if (goleirosA_B[0]) teams[0].players.push(goleirosA_B[0]);
        if (goleirosA_B[1]) teams[1].players.push(goleirosA_B[1]);
        
        goleirosC.forEach(g => {
            if (teams[2]) {
                teams[2].players.push(g);
            }
        });
    } else {
        // Caso simples de 1 time ou sem regras de goleiro
        goleiros.forEach((gol, index) => {
            const teamIndex = index % numTeams;
            teams[teamIndex].players.push(gol);
            gol.goalkeeperBadge = "Goleiro Fixo";
        });
    }

    // FASE 2 — Sorteio do Time C (Linha)
    // Quantas vagas de linha restam no Time C (ou no último time do sorteio)
    const lastTeamIndex = numTeams - 1;
    const C_SIZE = targetSizes[lastTeamIndex] - teams[lastTeamIndex].players.length;
    let timeC_linha = [];
    let linhaRestante = [];

    if (C_SIZE > 0 && numTeams > 2) {
        const pesosLinha = linha.map(p => {
            const h = secureHistories[p.id];
            const mediaGeral = totalDraws * C_SIZE / linha.length;
            const deficitLongoPrazo = mediaGeral - h.timesInC;
            const avgLast3 = h.timesInC_last3.length > 0 ? (h.timesInC_last3.reduce((a, b) => a + b, 0) / h.timesInC_last3.length) : 0;
            const deficitRecente = 1 - avgLast3;

            let score = (1 - CONFIG.RECENCY_WEIGHT) * deficitLongoPrazo + CONFIG.RECENCY_WEIGHT * deficitRecente;
            let weight = Math.exp(score);

            if (CONFIG.NO_CONSECUTIVE_C && h.lastTeam === 'C') {
                weight *= 0.05;
            }
            return { id: p.id, weight, player: p };
        });

        const timeC_ids = weightedSampleWithoutReplacement(pesosLinha, C_SIZE);
        
        linha.forEach(p => {
            if (timeC_ids.includes(p.id)) {
                teams[lastTeamIndex].players.push(p);
                timeC_linha.push(p);
            } else {
                linhaRestante.push(p);
            }
        });
    } else {
        linhaRestante = [...linha];
    }

    // FASE 3 — Distribuir entre A e B (Hill Climbing)
    const targetA = targetSizes[0] - teams[0].players.length;
    const targetB = targetSizes[1] - teams[1].players.length;

    shuffle(linhaRestante);
    let bestA_line = linhaRestante.slice(0, targetA);
    let bestB_line = linhaRestante.slice(targetA);

    function getDuplasPenalidade(linePlayers) {
        let sum = 0;
        for (let i = 0; i < linePlayers.length; i++) {
            for (let j = i + 1; j < linePlayers.length; j++) {
                const h = secureHistories[linePlayers[i].id];
                const count = h.teammateCounts[linePlayers[j].id] || 0;
                sum += CONFIG.PAIR_PENALTY_WEIGHT * (count * count);
            }
        }
        return sum;
    }

    function custo(A_line, B_line) {
        const teamA_players = [...teams[0].players, ...A_line];
        const teamB_players = [...teams[1].players, ...B_line];

        if (teamA_players.length === 0 || teamB_players.length === 0) return 9999;

        const avgA = teamA_players.reduce((sum, p) => sum + p.rating, 0) / teamA_players.length;
        const avgB = teamB_players.reduce((sum, p) => sum + p.rating, 0) / teamB_players.length;

        const skillDiff = Math.abs(avgA - avgB) * 0.5;
        const duplasA = getDuplasPenalidade(A_line);
        const duplasB = getDuplasPenalidade(B_line);

        return skillDiff + duplasA + duplasB;
    }

    let bestCusto = custo(bestA_line, bestB_line);

    for (let iter = 0; iter < CONFIG.LOCAL_SEARCH_ITERATIONS; iter++) {
        if (bestA_line.length === 0 || bestB_line.length === 0) break;
        
        const idxA = Math.floor(Math.random() * bestA_line.length);
        const idxB = Math.floor(Math.random() * bestB_line.length);

        const tempA = [...bestA_line];
        const tempB = [...bestB_line];

        const playerA = tempA[idxA];
        tempA[idxA] = tempB[idxB];
        tempB[idxB] = playerA;

        const novoCusto = custo(tempA, tempB);

        if (novoCusto < bestCusto) {
            bestA_line = tempA;
            bestB_line = tempB;
            bestCusto = novoCusto;
        }
    }

    bestA_line.forEach(p => teams[0].players.push(p));
    bestB_line.forEach(p => teams[1].players.push(p));

    // 8. Calcular as médias de nota de cada time
    teams.forEach(team => {
        if (team.players.length === 0) {
            team.avgRating = 0;
            return;
        }
        const sum = team.players.reduce((acc, p) => acc + p.rating, 0);
        team.avgRating = parseFloat((sum / team.players.length).toFixed(1));
    });

    return teams;
}

/**
 * Invoca drawTeamsInternal em um loop de tentativa (máx 100 iterações)
 * para garantir que o desvio padrão das médias dos times não ultrapasse 3.50.
 */
function drawTeams(players, config, histories = {}, totalDraws = 0) {
    let bestTeams = null;
    let bestDelta = Infinity;
    let attempts = 0;

    function getTeamsDelta(teamsList) {
        if (teamsList.length <= 1) return 0;
        const averages = teamsList.map(t => {
            if (t.players.length === 0) return 0;
            return t.players.reduce((sum, p) => sum + p.rating, 0) / t.players.length;
        });
        const maxAvg = Math.max(...averages);
        const minAvg = Math.min(...averages);
        return maxAvg - minAvg;
    }

    while (attempts < 50) {
        const playersClone = JSON.parse(JSON.stringify(players));
        const teams = drawTeamsInternal(playersClone, config, histories, totalDraws);

        let delta = getTeamsDelta(teams);

        // Se a distribuição não está perfeita (Delta > 4.0), aplicamos swaps locais inteligentes
        if (delta > 4.0) {
            let swapAttempts = 0;
            while (swapAttempts < 1000) {
                const t1_idx = Math.floor(Math.random() * teams.length);
                const t2_idx = Math.floor(Math.random() * teams.length);
                if (t1_idx === t2_idx) {
                    swapAttempts++;
                    continue;
                }

                const t1 = teams[t1_idx];
                const t2 = teams[t2_idx];

                const line1 = t1.players.filter(p => p.position !== 'Goleiro');
                const line2 = t2.players.filter(p => p.position !== 'Goleiro');

                if (line1.length === 0 || line2.length === 0) {
                    swapAttempts++;
                    continue;
                }

                const p1 = line1[Math.floor(Math.random() * line1.length)];
                const p2 = line2[Math.floor(Math.random() * line2.length)];

                const p1_idx = t1.players.findIndex(p => p.id === p1.id);
                const p2_idx = t2.players.findIndex(p => p.id === p2.id);

                // Swap temporário
                t1.players[p1_idx] = p2;
                t2.players[p2_idx] = p1;

                const newDelta = getTeamsDelta(teams);

                if (newDelta < delta) {
                    delta = newDelta;
                    if (delta <= 4.0) {
                        break;
                    }
                } else {
                    // Desfazer swap se não melhorou o delta
                    t1.players[p1_idx] = p1;
                    t2.players[p2_idx] = p2;
                }
                swapAttempts++;
            }
        }

        // Se conseguimos atingir a meta (Delta <= 4.0), retornamos este sorteio
        if (delta <= 4.0) {
            teams.forEach(t => {
                if (t.players.length === 0) {
                    t.avgRating = 0;
                } else {
                    const sum = t.players.reduce((acc, p) => acc + p.rating, 0);
                    t.avgRating = parseFloat((sum / t.players.length).toFixed(1));
                }
            });
            return teams;
        }

        // Guarda o melhor resultado caso exceda as tentativas
        if (delta < bestDelta) {
            bestDelta = delta;
            bestTeams = teams;
        }

        attempts++;
    }

    console.warn(`[Pelada PRO] Delta <= 4.0 não atingido após 50 sorteios. Retornando o mais equilibrado (Delta: ${bestDelta.toFixed(1)}).`);
    
    bestTeams.forEach(t => {
        if (t.players.length === 0) {
            t.avgRating = 0;
        } else {
            const sum = t.players.reduce((acc, p) => acc + p.rating, 0);
            t.avgRating = parseFloat((sum / t.players.length).toFixed(1));
        }
    });
    return bestTeams;
}

// Exporta se estiver em ambiente Node/CommonJS (para testes futuros), senão anexa ao escopo global
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { drawTeams };
}

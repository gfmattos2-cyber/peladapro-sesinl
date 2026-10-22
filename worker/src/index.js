/**
 * Cloudflare Worker API para o Pelada Pro
 * Conectado ao Cloudflare D1 (SQLite na borda)
 */

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export default {
  async fetch(request, env) {
    // Tratamento de preflight CORS (OPTIONS)
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    try {
      // Rota GET: Buscar jogadores e times
      if (request.method === "GET") {
        const { results: rawPlayers } = await env.DB.prepare(
          "SELECT id, name, position, type, rating, active, totwWins FROM players ORDER BY rating DESC"
        ).all();

        const players = (rawPlayers || []).map((p) => ({
          ...p,
          active: p.active === 1 || p.active === true,
        }));

        const teamRow = await env.DB.prepare(
          "SELECT data FROM drawn_teams WHERE id = 1"
        ).first();

        let teams = [];
        if (teamRow && teamRow.data) {
          try {
            teams = JSON.parse(teamRow.data);
          } catch (e) {
            teams = [];
          }
        }

        return new Response(JSON.stringify({ players, teams }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Rota POST: Salvar jogadores ou times
      if (request.method === "POST") {
        let body = {};
        const rawText = await request.text();
        try {
          body = JSON.parse(rawText);
        } catch (e) {
          return new Response(
            JSON.stringify({ error: "Invalid JSON body: " + e.message, received: rawText }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const action = body.action;

        // Salvar lista de jogadores
        if (action === "savePlayers" || path.endsWith("/players")) {
          const players = body.players || [];
          if (Array.isArray(players) && players.length > 0) {
            const statements = [env.DB.prepare("DELETE FROM players")];
            for (const p of players) {
              statements.push(
                env.DB.prepare(
                  "INSERT INTO players (id, name, position, type, rating, active, totwWins) VALUES (?, ?, ?, ?, ?, ?, ?)"
                ).bind(
                  String(p.id),
                  String(p.name || ""),
                  String(p.position || "Meio-Campo"),
                  String(p.type || "Mensalista"),
                  Number(p.rating) || 60,
                  p.active ? 1 : 0,
                  Number(p.totwWins) || 0
                )
              );
            }
            await env.DB.batch(statements);
          } else if (Array.isArray(players) && players.length === 0) {
            await env.DB.prepare("DELETE FROM players").run();
          }

          return new Response(
            JSON.stringify({ status: "success", message: "Jogadores salvos com sucesso" }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Salvar times sorteados
        if (action === "saveTeams" || path.endsWith("/teams")) {
          const teams = body.teams || [];
          const jsonStr = JSON.stringify(teams);

          await env.DB.prepare(
            `INSERT INTO drawn_teams (id, data, updated_at) 
             VALUES (1, ?, CURRENT_TIMESTAMP) 
             ON CONFLICT(id) DO UPDATE SET data = excluded.data, updated_at = CURRENT_TIMESTAMP`
          )
            .bind(jsonStr)
            .run();

          return new Response(
            JSON.stringify({ status: "success", message: "Times salvos com sucesso" }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        return new Response(
          JSON.stringify({ error: "Ação não reconhecida" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response("Method not allowed", { status: 405, headers: corsHeaders });
    } catch (err) {
      return new Response(
        JSON.stringify({ error: err.message || "Internal server error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  },
};

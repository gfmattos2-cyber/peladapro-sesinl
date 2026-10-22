# Como Conectar o Sorteador ao Google Planilhas 📊

Para salvar todas as atualizações de presença, notas, novos jogadores e os times sorteados diretamente no seu Google Planilhas (para que todo o grupo possa ver em tempo real), siga este passo a passo rápido e gratuito.

---

## 🛠️ Passo 1: Preparar a Planilha
1. Abra o [Google Planilhas](https://sheets.google.com) e crie uma planilha em branco (ou use uma que você já tenha).
2. Na planilha, certifique-se de ter **2 abas (páginas)** com os nomes exatos:
   * **`Jogadores`** (com "J" maiúsculo)
   * **`Times`** (com "T" maiúsculo)
3. Na primeira linha da aba **`Jogadores`**, crie os cabeçalhos:
   `ID | Nome | Posição | Tipo | Nota | Confirmado | Vitórias` (opcional, pois o script criará isso se não existir, mas ajuda a visualizar).

---

## 💻 Passo 2: Adicionar o Código (Google Apps Script)
1. No menu superior da planilha, clique em **Extensões** ➔ **Apps Script**.
2. Apague qualquer código que estiver no editor e cole o código abaixo:

```javascript
function doGet(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheetPlayers = ss.getSheetByName("Jogadores");
  var sheetTeams = ss.getSheetByName("Times");
  
  var players = [];
  if (sheetPlayers) {
    var data = sheetPlayers.getDataRange().getValues();
    for (var i = 1; i < data.length; i++) {
      if (data[i][0] && data[i][1]) {
        players.push({
          id: data[i][0].toString(),
          name: data[i][1],
          position: data[i][2],
          type: data[i][3],
          rating: Number(data[i][4]),
          active: data[i][5] === true || data[i][5] === "true",
          totwWins: Number(data[i][6]) || 0
        });
      }
    }
  }
  
  var teams = [];
  if (sheetTeams) {
    var val = sheetTeams.getRange("A1").getValue();
    if (val) {
      try {
        teams = JSON.parse(val);
      } catch(e) {
        teams = [];
      }
    }
  }
  
  return ContentService.createTextOutput(JSON.stringify({ players: players, teams: teams }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  var data = JSON.parse(e.postData.contents);
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  if (data.action === "savePlayers") {
    var sheetPlayers = ss.getSheetByName("Jogadores") || ss.insertSheet("Jogadores");
    sheetPlayers.clear();
    sheetPlayers.appendRow(["ID", "Nome", "Posição", "Tipo", "Nota", "Confirmado", "Vitórias"]);
    data.players.forEach(function(p) {
      sheetPlayers.appendRow([p.id, p.name, p.position, p.type, p.rating, p.active, p.totwWins]);
    });
  } else if (data.action === "saveTeams") {
    var sheetTeams = ss.getSheetByName("Times") || ss.insertSheet("Times");
    sheetTeams.clear();
    sheetTeams.getRange("A1").setValue(JSON.stringify(data.teams));
  }
  
  return ContentService.createTextOutput(JSON.stringify({ status: "success" }))
    .setMimeType(ContentService.MimeType.JSON);
}
```

3. Clique no botão de **Salvar** (ícone de disquete) no topo do editor.

---

## 🚀 Passo 3: Implantar como Aplicativo da Web (Web App)
1. No canto superior direito da tela do Apps Script, clique em **Implantar** (Deploy) ➔ **Nova implantação** (New deployment).
2. Clique no ícone de engrenagem (ao lado de "Selecione o tipo") e escolha **Aplicativo da Web** (Web app).
3. Preencha as configurações exatamente como abaixo:
   * **Descrição**: `Pelada PRO Sync`
   * **Executar como**: **Eu** (sua conta de e-mail)
   * **Quem tem acesso**: **Qualquer pessoa** (isso é fundamental para que o site consiga ler/escrever dados)
4. Clique em **Implantar**.
5. Se o Google solicitar permissões de acesso, clique em **Autorizar acesso**, selecione sua conta e depois clique em **Avançado** ➔ **Acessar [Nome do seu script] (não seguro)** ➔ **Permitir**.
6. Copie o link gerado chamado **URL do aplicativo da Web** (ele termina com `/exec`).

---

## 🔗 Passo 4: Conectar ao Site
1. Abra o arquivo **`js/app.js`** do seu projeto.
2. Na linha **858**, cole a URL que você acabou de copiar no lugar da constante:

```javascript
const GOOGLE_SCRIPT_URL = 'SUA_URL_DO_WEB_APP_AQUI';
```

3. Suba o arquivo atualizado no GitHub!

Pronto! Agora todos os seus dados e o sorteio de times ficam guardados na sua planilha oficial do Google, 100% integrados em tempo real de forma totalmente gratuita!

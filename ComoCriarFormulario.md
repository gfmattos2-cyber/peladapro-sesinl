# Como Criar o Formulário de Avaliação Automaticamente no Google Drive

Como sou um assistente de código, não posso acessar a sua conta Google pessoal diretamente para criar o formulário por você (devido a restrições de login e segurança). No entanto, você pode criá-lo em **menos de 30 segundos** usando um script automatizado do próprio Google (Google Apps Script).

Siga o passo a passo abaixo:

---

### 📋 Passo a Passo

1. Acesse o site **[script.google.com](https://script.google.com/)** (entre com sua conta Google, se necessário).
2. Clique no botão **"Novo projeto"** (ou "New Project") no canto superior esquerdo.
3. Apague todo o código que estiver na tela e cole o código abaixo:

```javascript
function criarFormularioPelada() {
  // Cria o formulário
  var form = FormApp.create('Avaliação de Jogadores - Pelada PRO');
  
  form.setDescription('Dê uma nota de 0 a 10 para o nível técnico de cada jogador da nossa pelada. A votação é 100% anônima!')
      .setAllowResponseEdits(false)
      .setCollectEmail(false)             // Garante o anonimato (não coleta e-mails)
      .setLimitOneResponsePerUser(false);  // Se quiser limitar a 1 voto por pessoa, altere para true (exigirá login do Google)
  
  // Lista dos seus 19 jogadores
  var jogadores = [
    "Marcelo",
    "Gabriel Lobão",
    "Gersinho",
    "Heyler",
    "Novy",
    "Nenem",
    "Kaka",
    "Custódio",
    "Diório",
    "Max",
    "João Teles",
    "Samuel",
    "Felipe",
    "Lucas",
    "Gabriel",
    "Thiago",
    "Bulau",
    "Rodrigo",
    "Vitão"
  ];
  
  // Cria uma pergunta de escala linear (0 a 10) para cada jogador
  for (var i = 0; i < jogadores.length; i++) {
    var item = form.addScaleItem();
    item.setTitle(jogadores[i])
        .setHelpText('Avalie o nível técnico de ' + jogadores[i])
        .setBounds(0, 10)
        .setLabels('Perna de Pau (0)', 'Craque (10)')
        .setRequired(true); // Obriga a votar em todos
  }
  
  // Exibe os links no console
  Logger.log('--- FORMULÁRIO CRIADO COM SUCESSO! ---');
  Logger.log('Link para VOCÊ ver as respostas e editar: ' + form.getEditUrl());
  Logger.log('Link para ENVIAR no grupo de WhatsApp: ' + form.getPublishedUrl());
}
```

4. Clique no ícone de **Salvar** (um disquete no menu superior).
5. Clique no botão **"Executar"** (ícone de Play ▶️).
6. O Google pedirá uma rápida autorização na primeira vez (clique em *Revisar permissões*, escolha sua conta, clique em *Avançado* e depois em *Acessar Projeto sem nome (não seguro)* para permitir que o script crie o arquivo no seu Google Drive).
7. Na parte inferior da tela, em **"Registro de execução"** (Execution log), aparecerão os links prontos:
   - O link para você gerenciar o formulário.
   - O link público para **copiar e enviar no grupo do WhatsApp**!

---

### 🔒 Anonimato Garantido
O código está configurado com `.setCollectEmail(false)`. Isso garante que o Google Forms **não** registrará quem votou em quem e nem pegará os e-mails dos votantes, deixando as respostas 100% confidenciais.

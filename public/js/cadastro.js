/* ==========================================================================
   cadastro.js  |  só de cadastro.html
   Depende de: dados.js (tabelas fixas) e app.js (guardarMensagem). Envia o cadastro para a API.
   Ligações com o HTML (ids): form_cadastro, input_nome, input_email, input_senha,
   p_erro_cadastro e as caixas div_opcoes_estilo / div_opcoes_tempo / div_opcoes_sentido
   (onde os botões de escolha são criados por este arquivo).
   ========================================================================== */

/* cria os botões de escolha (radio) dentro de "destino" a partir de dois vetores */
function montarOpcoes(destino, nomeCampo, ids, nomes) {
  let html = '<div class="chips" role="radiogroup">';
  for (let i = 0; i < ids.length; i++) {
    html += '<label class="chip"><input type="radio" name="' + nomeCampo + '" value="' + ids[i] + '"><span>' + nomes[i] + '</span></label>';
  }
  html += '</div>';
  destino.innerHTML = html;
}

/* botão "Criar conta": valida cada campo e, se estiver tudo certo, faz o INSERT */
function cadastrar() {
  let nome = input_nome.value.trim();
  let email = input_email.value.trim().toLowerCase();
  let senha = input_senha.value;
  let estilo = form_cadastro.estilo.value;
  let tempo = form_cadastro.tempo.value;
  let sentido = form_cadastro.sentido.value;

  // e-mail válido: tem @ e ponto, não tem espaço, não começa com @ nem termina com ponto
  let emailValido = email.includes('@') && email.includes('.') && !email.includes(' ') && !email.startsWith('@') && !email.endsWith('.');

  let erro = '';
  if (nome.length < 2) {
    erro = 'Digite seu nome.';
  } else if (emailValido == false) {
    erro = 'Digite um e-mail válido.';
  } else if (senha.length < 6) {
    erro = 'A senha precisa ter pelo menos 6 caracteres.';
  } else if (estilo == '') {
    erro = 'Escolha o seu estilo.';
  } else if (tempo == '') {
    erro = 'Conte qual é o seu contato com a dança.';
  } else if (sentido == '') {
    erro = 'Escolha o que a dança representa para você.';
  }

  p_erro_cadastro.innerHTML = erro;

  if (erro == '') {
    // POST /usuarios/cadastrar -> a API faz o INSERT em usuario e perfil_usuario no MySQL
    fetch('/usuarios/cadastrar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nomeServer: nome,
        emailServer: email,
        senhaServer: senha,
        estiloServer: estilo,
        tempoServer: tempo,
        sentidoServer: sentido
      })
    }).then(function (resposta) {
      if (resposta.ok) {
        form_cadastro.reset();
        guardarMensagem('Conta criada! Entre para ver o painel.');
        sessionStorage.EMAIL_CADASTRADO = email;   // o login já preenche o e-mail
        location.href = 'login.html';
      } else {
        resposta.text().then(function (texto) {
          p_erro_cadastro.textContent = texto;
        });
      }
    }).catch(function (erroFetch) {
      console.log(erroFetch);
      p_erro_cadastro.innerHTML = 'Não foi possível falar com o servidor. Ele está ligado?';
    });
  }
}

/* ---------- INÍCIO ---------- */
montarOpcoes(div_opcoes_estilo, 'estilo', estilo_id, estilo_nome);
montarOpcoes(div_opcoes_tempo, 'tempo', tempo_id, tempo_nome);
montarOpcoes(div_opcoes_sentido, 'sentido', sentido_id, sentido_nome);
iniciarPagina('cadastro');

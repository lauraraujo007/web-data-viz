
/* ENERGIAS: nome, estilo que combina e frase (vetores com a mesma posição) */
let vibe_nome = ['Leveza', 'Atitude', 'Fluidez', 'Performance'];
let vibe_estilo = ['ballet', 'hiphop', 'contemporaneo', 'kpop'];
let vibe_frase = [
  'O dia pede postura, alongamento e controle corporal',
  'O corpo pede peso, presença e conexão',
  'O momento pede movimentos leves, entrega e liberdade',
  'A vibe pede expressão facial, sincronia e energia de palco'
];

/* ---------- ENERGIA DO DIA ---------- */
function desenharEnergias() {
  let html = '';
  for (let i = 0; i < vibe_nome.length; i++) {
    html += '<button class="vc" onclick="escolherEnergia(' + i + ')" aria-pressed="' + (vibe_estilo[i] == estiloAtual) + '">' + vibe_nome[i] + '</button>';
  }
  div_energias.innerHTML = html;
}

function escolherEnergia(i) {
  trocarEstilo(vibe_estilo[i]);
  let nomeEstilo = estilo_nome[estilo_id.indexOf(vibe_estilo[i])];
  p_sugestao.innerHTML = '<b>Hoje combina com ' + nomeEstilo + '.</b> ' + vibe_frase[i] + ' <a href="#dicas"> <br> Ver dicas em vídeo</a>';
}

/* troca o estilo (cor do site + vídeos). Usada pelas abas, cards e energias */
function trocarEstilo(id) {
  aplicarEstilo(id);
}

/* clicar num card de estilo escolhe o estilo e rola até os vídeos */
function escolherEstiloCard(id) {
  trocarEstilo(id);
  // NOVO: rola a página até a seção de vídeos (id="dicas")
  dicas.scrollIntoView();
}

/* ---------- VÍDEOS ----------
   Os vídeos ficam no index.html (um grupo por estilo, id="videos_<estilo>").
   Aqui só mostramos o grupo do estilo escolhido e escondemos os outros. */
function desenharVideos() {
  let k = estiloAtual;
  if (k == null) {
    k = 'ballet';
  }

  for (let i = 0; i < estilo_id.length; i++) {
    let aba = document.getElementById('aba_' + estilo_id[i]);
    let grupo = document.getElementById('videos_' + estilo_id[i]);
    aba.setAttribute('aria-selected', estilo_id[i] == k);
    grupo.hidden = estilo_id[i] != k;
  }
  p_dica_estilo.innerHTML = 'Dicas para quem quer treinar ' + estilo_nome[estilo_id.indexOf(k)] + '.';
}

/* v = número do vídeo (1 a 15, o mesmo idVideo da tabela video no banco) */
function marcarAssistido(v) {
  if (logado == -1) {
    mostrarAviso('Entre na sua conta para registrar suas atividades.');
  } else {
    fetch('/videos/assistir', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idUsuarioServer: logado, idVideoServer: v })
    }).then(function (resposta) {
      if (resposta.ok) {
        resposta.json().then(function (json) {
          if (json.novo) {
            mostrarAviso('Vídeo marcado como assistido.');
          } else {
            mostrarAviso('Este vídeo já estava marcado!');
          }
        });
      } else {
        mostrarAviso('Não foi possível registrar o vídeo.');
      }
    }).catch(function (erroFetch) {
      console.log(erroFetch);
      mostrarAviso('Não foi possível falar com o servidor.');
    });
  }
}

iniciarPagina('home');
desenharEnergias();
desenharVideos();

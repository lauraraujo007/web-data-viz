/* ==========================================================================
   dashboard.js  |  só de dashboard.html
   Depende de: dados.js (tabelas fixas e funções), app.js e da biblioteca Chart.js
   (carregada pelo <script> no <head> do HTML).

   CADA KPI E CADA GRÁFICO VEM DE UM SELECT. Os SELECTs com o mesmo número de
   comentário estão em banco/chumseon_space.sql (seção "SELECTs do dashboard").
   Os SELECTs rodam no MySQL (src/models/dashboardModel.js). Aqui chegam os
   resultados prontos, em JSON, pelo fetch.

   Ligações com o HTML (ids):
     titulo_painel / p_subtitulo ....... título e subtítulo
     div_periodo ....................... botões 7 dias / 30 dias
     btn_cronometro / div_cronometro ... cronômetro de ensaio
     p_meta_texto / barra_meta / p_meta_msg ... meta da semana
     kpi_minutos kpi_videos ... números pessoais
     canvas_ensaio canvas_videos ... gráficos pessoais
     kpi_usuarios kpi_estilo_top kpi_retomar ... números da comunidade
     canvas_estilos canvas_sentidos canvas_niveis ... gráficos da comunidade
   ========================================================================== */

let periodo = 7;          // filtro: 7 ou 30 dias
let META = 180;           // meta de minutos por semana (vem de perfil_usuario)
let cron_timer = null;    // cronômetro rodando? (null = parado)
let cron_inicio = 0;
let graficos = [];        // gráficos desenhados (para apagar antes de desenhar de novo)

let dc = null;   // dados da comunidade (GET /dashboard/comunidade)
let dp = null;   // dados pessoais (GET /dashboard/pessoal/:id/:periodo)

/* atualizarPainel() = busca os dados na API e refaz tudo.
   Roda ao abrir a página e a cada ação do usuário. */
function atualizarPainel() {
  fetch('/dashboard/comunidade').then(function (resposta) {
    if (!resposta.ok) {
      throw new Error('comunidade ' + resposta.status);
    }
    resposta.json().then(function (json) {
      dc = json;

      fetch('/dashboard/pessoal/' + logado + '/' + periodo).then(function (resposta2) {
        if (!resposta2.ok) {
          throw new Error('pessoal ' + resposta2.status);
        }
        resposta2.json().then(function (json2) {
          dp = json2;
          mostrarPainel();
        });
      }).catch(function (erroFetch) {
        console.log(erroFetch);
        mostrarAviso('Não foi possível carregar o seu painel.');
      });
    });
  }).catch(function (erroFetch) {
    console.log(erroFetch);
    mostrarAviso('Não foi possível carregar o painel. O servidor está ligado?');
  });
}

/* com os dados em dc e dp, preenche a tela */
function mostrarPainel() {
  META = dp.meta;
  pegarPrimeiroNome(sessionStorage.NOME_USUARIO);
  titulo_painel.innerHTML = 'Olá, ' + primeiroNome;
  p_subtitulo.innerHTML = 'Seu estilo: ' + estilo_nome[estilo_id.indexOf(estiloAtual)] + '. Cada ação sua muda este painel na hora.';

  atualizarKpisComunidade();
  atualizarPessoal();
  desenharGraficos();
}

/* ---------- KPIs DA COMUNIDADE (SELECTs 1, 2 e 3) ---------- */
function atualizarKpisComunidade() {
  // SELECT 1: quantos dançarinos cadastrados -> COUNT(*)
  kpi_usuarios.innerHTML = dc.totalUsuarios;

  // SELECT 2: estilo mais votado da semana -> GROUP BY estilo ORDER BY COUNT DESC LIMIT 1
  if (dc.estiloTop == null) {
    kpi_estilo_top.innerHTML = '-';
  } else {
    kpi_estilo_top.innerHTML = estilo_nome[estilo_id.indexOf(dc.estiloTop)];
  }

  // SELECT 3: % de quem já praticou na infância ("querem retomar")
  kpi_retomar.innerHTML = dc.percentualRetomar + '%';
}

/* ---------- NÚMEROS PESSOAIS, FILTRO E META (SELECTs 4, 5 e 7) ---------- */
function atualizarPessoal() {
  let minutosSemana = dp.minutosSemana;

  // SELECT 4 e 5: SUM(minutos) FROM ensaio  e  COUNT(*) FROM usuario_video
  kpi_minutos.innerHTML = dp.minutos + ' min';
  kpi_videos.innerHTML = dp.videos;

  // SELECT 7: meta da semana (minutos da semana x metaSemanalMin do perfil)
  p_meta_texto.innerHTML = minutosSemana + ' de ' + META + ' minutos nesta semana';
  let porcentagem = minutosSemana / META * 100;
  if (porcentagem > 100) {
    porcentagem = 100;
  }
  // NOVO: .style.width muda a largura da barra (a animação está no CSS)
  barra_meta.style.width = porcentagem + '%';
  if (minutosSemana >= META) {
    p_meta_msg.innerHTML = 'Meta batida. Sua linha está em dia!';
  } else {
    p_meta_msg.innerHTML = 'Faltam ' + (META - minutosSemana) + ' minutos para bater a meta.';
  }

  // sem nada no período? mostra a dica
  let temAtividade = false;
  if (dp.minutos > 0 || dp.videos > 0) {
    temAtividade = true;
  }
  p_vazio.hidden = temAtividade;

  // botões 7 dias / 30 dias (o que está escolhido fica destacado)
  div_periodo.innerHTML = '<button class="tab" onclick="mudarPeriodo(7)" aria-selected="' + (periodo == 7) + '">7 dias</button>' +
    '<button class="tab" onclick="mudarPeriodo(30)" aria-selected="' + (periodo == 30) + '">30 dias</button>';
}

function mudarPeriodo(dias) {
  periodo = dias;
  atualizarPainel();
}

/* ---------- GRÁFICOS ---------- */
function desenharGraficos() {
  if (window.Chart == undefined) {
    // sem internet o Chart.js não carrega
    p_erro_graficos.hidden = false;
  } else {
    p_erro_graficos.hidden = true;

    // apaga os gráficos antigos antes de desenhar os novos
    for (let i = 0; i < graficos.length; i++) {
      graficos[i].destroy();
    }
    graficos = [];

    // cores dos textos e linhas de acordo com o tema (iguais às do css/base.css)
    let corMuted = '#8e979d';
    let corTexto = '#c9cfd3';
    let corLinha = 'rgba(255,255,255,0.12)';
    if (document.documentElement.getAttribute('data-theme') == 'light') {
      corMuted = '#666d75';
      corTexto = '#363a40';
      corLinha = 'rgba(20,18,40,0.14)';
    }
    Chart.defaults.color = corMuted;
    Chart.defaults.font.family = 'Montserrat, sans-serif';

    desenharGraficosComunidade(corTexto, corLinha);
    desenharGraficosPessoais(corTexto, corLinha);
  }
}

/* gráficos da COMUNIDADE (SELECTs 8, 9 e 10) */
function desenharGraficosComunidade(corTexto, corLinha) {
  let grade = { color: corLinha };
  let semGrade = { display: false };

  // contagens vindas do MySQL: por estilo, por sentido e matriz tempo x estilo
  let porEstilo = [0, 0, 0, 0, 0];
  let porSentido = [0, 0, 0, 0];
  let porTempoEstilo = [[0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0]];
  for (let i = 0; i < dc.porEstilo.length; i++) {
    porEstilo[estilo_id.indexOf(dc.porEstilo[i].estilo)] = dc.porEstilo[i].total;
  }
  for (let i = 0; i < dc.porSentido.length; i++) {
    porSentido[sentido_id.indexOf(dc.porSentido[i].sentido)] = dc.porSentido[i].total;
  }
  for (let i = 0; i < dc.porTempoEstilo.length; i++) {
    let t = tempo_id.indexOf(dc.porTempoEstilo[i].tempo);
    let e = estilo_id.indexOf(dc.porTempoEstilo[i].estilo);
    porTempoEstilo[t][e] = dc.porTempoEstilo[i].total;
  }

  // SELECT 8: estilos favoritos (radar)
  converterCor(corAtual, 0.25);
  graficos.push(new Chart(canvas_estilos, {
    type: 'radar',
    data: {
      labels: estilo_nome,
      datasets: [{
        data: porEstilo,
        borderColor: corAtual,
        backgroundColor: corConvertida,
        pointBackgroundColor: corAtual,
        borderWidth: 2
      }]
    },
    options: {
      maintainAspectRatio: false,
      plugins: { legend: semGrade },
      scales: {
        r: {
          grid: grade,
          angleLines: grade,
          ticks: { display: false, backdropColor: 'transparent' },
          pointLabels: { color: corTexto, font: { size: 12 } }
        }
      }
    }
  }));

  // SELECT 9: o que a dança representa (barras na horizontal)
  graficos.push(new Chart(canvas_sentidos, {
    type: 'bar',
    data: {
      labels: sentido_nome,
      datasets: [{
        data: porSentido,
        backgroundColor: ['#ff5fa2', '#3fd6c0', '#ff6a4d', '#8b7bff'],
        borderRadius: 8
      }]
    },
    options: {
      indexAxis: 'y',
      maintainAspectRatio: false,
      plugins: { legend: semGrade },
      scales: {
        x: { grid: grade, ticks: { precision: 0 } },
        y: { grid: semGrade }
      }
    }
  }));

  // SELECT 10: nível de experiência por estilo (colunas empilhadas)
  let conjuntos = [];
  for (let e = 0; e < estilo_id.length; e++) {
    conjuntos.push({
      label: estilo_nome[e],
      backgroundColor: estilo_cor[e],
      borderRadius: 4,
      data: [porTempoEstilo[0][e], porTempoEstilo[1][e], porTempoEstilo[2][e]]
    });
  }
  graficos.push(new Chart(canvas_niveis, {
    type: 'bar',
    data: { labels: tempo_nome, datasets: conjuntos },
    options: {
      maintainAspectRatio: false,
      plugins: { legend: { labels: { color: corTexto, boxWidth: 12 } } },
      scales: {
        x: { stacked: true, grid: semGrade },
        y: { stacked: true, grid: grade, ticks: { precision: 0 } }
      }
    }
  }));
}

/* gráficos PESSOAIS (SELECTs 11 e 12) */
function desenharGraficosPessoais(corTexto, corLinha) {
  let grade = { color: corLinha };
  let semGrade = { display: false };

  // SELECT 11: minutos por dia (linha)
  calcularMinutosPorDia(periodo, dp.minutosPorDia);
  let raioPonto = 4;
  if (periodo > 7) {
    raioPonto = 0;
  }
  converterCor(corAtual, 0.18);
  graficos.push(new Chart(canvas_ensaio, {
    type: 'line',
    data: {
      labels: dias_rotulo,
      datasets: [{
        label: 'Minutos',
        data: dias_minutos,
        borderColor: corAtual,
        backgroundColor: corConvertida,
        fill: true,
        tension: 0.35,
        pointRadius: raioPonto,
        pointBackgroundColor: corAtual
      }]
    },
    options: {
      maintainAspectRatio: false,
      plugins: { legend: semGrade },
      scales: {
        x: { grid: semGrade, ticks: { maxTicksLimit: 8 } },
        y: { grid: grade, beginAtZero: true, ticks: { precision: 0 } }
      }
    }
  }));

  // SELECT 12: vídeos assistidos por estilo (rosca). Junta usuario_video com video
  let videosPorEstilo = [0, 0, 0, 0, 0];
  for (let a = 0; a < dp.videosPorEstilo.length; a++) {
    videosPorEstilo[estilo_id.indexOf(dp.videosPorEstilo[a].estilo)] = dp.videosPorEstilo[a].videos;
  }
  graficos.push(new Chart(canvas_videos, {
    type: 'doughnut',
    data: {
      labels: estilo_nome,
      datasets: [{ data: videosPorEstilo, backgroundColor: estilo_cor, borderWidth: 0 }]
    },
    options: {
      maintainAspectRatio: false,
      cutout: '62%',
      plugins: { legend: { position: 'bottom', labels: { color: corTexto, boxWidth: 12 } } }
    }
  }));
}

/* ---------- CRONÔMETRO DE ENSAIO ---------- */

/* roda a cada meio segundo e mostra mm:ss. O % (resto da divisão) separa os segundos */
function atualizarCronometro() {
  let segundos = Math.floor((Date.now() - cron_inicio) / 1000);
  let mm = Math.floor(segundos / 60);
  let ss = segundos % 60;
  if (mm < 10) {
    mm = '0' + mm;
  }
  if (ss < 10) {
    ss = '0' + ss;
  }
  div_cronometro.innerHTML = mm + ':' + ss;
}

/* botão "Começar ensaio" / "Terminar ensaio" */
function alternarCronometro() {
  if (cron_timer == null) {
    cron_inicio = Date.now();
    cron_timer = setInterval(atualizarCronometro, 500);
    btn_cronometro.innerHTML = 'Terminar ensaio';
    div_cronometro.className = 'timer run';
  } else {
    clearInterval(cron_timer);
    cron_timer = null;
    let minutos = Math.round((Date.now() - cron_inicio) / 60000);
    if (minutos < 1) {
      minutos = 1;
    }
    btn_cronometro.innerHTML = 'Começar ensaio';
    div_cronometro.className = 'timer';
    div_cronometro.innerHTML = '00:00';
    adicionarEnsaio(minutos, 'Ensaio registrado: ' + minutos + ' min.');
  }
}

/* POST /ensaios/registrar: INSERT em ensaio (cronômetro e botões +15 / +30) e atualiza o painel */
function adicionarEnsaio(minutos, mensagem) {
  fetch('/ensaios/registrar', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idUsuarioServer: logado, estiloServer: estiloAtual, minutosServer: minutos })
  }).then(function (resposta) {
    if (resposta.ok) {
      mostrarAviso(mensagem);
      atualizarPainel();
    } else {
      mostrarAviso('Não foi possível registrar o ensaio.');
    }
  }).catch(function (erroFetch) {
    console.log(erroFetch);
    mostrarAviso('Não foi possível falar com o servidor.');
  });
}

/* ---------- INÍCIO ---------- */
iniciarPagina('dashboard');
if (logado == -1) {
  // acesso restrito: sem login, volta para a página de login
  guardarMensagem('Entre na sua conta para ver o painel.');
  location.href = 'login.html';
} else {
  atualizarPainel();
}

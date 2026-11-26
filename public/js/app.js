
let paginaAtual = '';
let estiloAtual = null;
let corAtual = '#8b7bff';
let temporizadorAviso;
let pre_valor = 0;
let pre_timer;

function iniciarPagina(pagina) {
  paginaAtual = pagina;
  carregarTemaSalvo();
  identificarLogado();
  montarNavbar();
  // mostrarMensagemGuardada();

  if (logado != -1) {
    aplicarEstilo(sessionStorage.ESTILO_USUARIO);
  }

  if (pagina == 'home') {
    iniciarPreloader();
  } else {
    document.body.className = 'rdy';
  }
}

function aplicarTema(tema, guardar) {
  document.documentElement.setAttribute('data-theme', tema);
  // login.html e cadastro.html não têm o botão de tema, então só mexe nele se existir
  if (document.getElementById('btn_tema') != null) {
    if (tema == 'dark') {
      btn_tema.innerHTML = '☀';
      btn_tema.title = 'Tema claro';
    } else {
      btn_tema.innerHTML = '☾';
      btn_tema.title = 'Tema escuro';
    }
  }
  if (guardar) {
    localStorage.setItem('cs_theme', tema);
  }
}

function carregarTemaSalvo() {
  let salvo = localStorage.getItem('cs_theme');
  if (salvo != null) {
    aplicarTema(salvo, false);
  } else if (matchMedia('(prefers-color-scheme: light)').matches) {
    aplicarTema('light', false);
  } else {
    aplicarTema('dark', false);
  }
}

function trocarTema() {
  let atual = document.documentElement.getAttribute('data-theme');
  if (atual == 'dark') {
    aplicarTema('light', true);
  } else {
    aplicarTema('dark', true);
  }
  // os gráficos têm cores próprias, então o painel precisa desenhar de novo
  if (paginaAtual == 'dashboard') {
    atualizarPainel();
  }
}


function iniciarPreloader() {
  let jaViu = sessionStorage.getItem('cs_pre');
  if (jaViu == '1') {
    pre.hidden = true;
    document.body.className = 'rdy';
  } else {
    sessionStorage.setItem('cs_pre', '1');
    let intervalo = 30; 
    if (matchMedia('(prefers-reduced-motion:reduce)').matches) {
      intervalo = 3;
    }
    pre_timer = setInterval(avancarPreloader, intervalo);
  }
}


function avancarPreloader() {
  pre_valor++;
  pre_pct.innerHTML = pre_valor;
  pre_barra.style.transform = 'scaleX(' + pre_valor / 100 + ')';
  if (pre_valor >= 100) {
    clearInterval(pre_timer);
    pre.className = 'done';
    document.body.className = 'rdy';
    setTimeout(esconderPreloader, 800);
  }
}

function esconderPreloader() {
  pre.hidden = true;
}


/* ---------- AVISO (toast): mensagem rápida embaixo da tela ---------- */
function mostrarAviso(mensagem) {
  div_aviso.innerHTML = mensagem
  div_aviso.className = 'toast on'
  clearTimeout(temporizadorAviso)
  temporizadorAviso = setTimeout(esconderAviso, 3200)
}

function esconderAviso() {
  div_aviso.className = 'toast'
}


function guardarMensagem(mensagem) {
  sessionStorage.MENSAGEM_PROXIMA = mensagem
}

function mostrarMensagemGuardada() {
  let mensagem = sessionStorage.MENSAGEM_PROXIMA
  if (mensagem != undefined) {
    sessionStorage.removeItem('MENSAGEM_PROXIMA')
    setTimeout(mostrarAviso, 500, mensagem)
  }
}


function aplicarEstilo(id) {
  estiloAtual = id;
  corAtual = estilo_cor[estilo_id.indexOf(id)]
  document.documentElement.style.setProperty('--accent', corAtual)
  if (paginaAtual == 'home') {
    desenharEnergias()
    desenharVideos()
  }
}

/* ---------- NAVBAR ----------
   Os links ficam em vetores e um for monta o HTML. "Dashboard" só aparece para quem está logado. A página atual ganha a classe "on" (linha embaixo). */
let menu_link = ['index.html', 'index.html#estilos', 'index.html#dicas', 'dashboard.html', 'sobre.html'];
let menu_nome = ['Home', 'Estilos', 'Dicas', 'Dashboard', 'Sobre'];
let menu_pagina = ['home', '', '', 'dashboard', 'sobre'];

function montarNavbar() {
  // login.html e cadastro.html não têm navbar
  if (document.getElementById('div_links') == null) {
    return;
  }
  let links = '';
  for (let i = 0; i < menu_link.length; i++) {
    let mostrar = true;
    if (menu_pagina[i] == 'dashboard' && logado == -1) {
      mostrar = false;
    }
    if (mostrar) {
      let classe = '';
      if (menu_pagina[i] == paginaAtual) {
        classe = ' class="on"';
      }
      links += '<a href="' + menu_link[i] + '"' + classe + '>' + menu_nome[i] + '</a>';
    }
  }

  if (logado != -1) {
    div_links.innerHTML = links + '<a class="m" href="index.html" onclick="sair()">Sair</a>';
    span_acoes.innerHTML = '<a class="pill" href="index.html" onclick="sair()">Sair</a>';
  } else {
    div_links.innerHTML = links + '<a class="m" href="login.html">Entrar</a><a class="m" href="cadastro.html">Criar conta</a>';
    span_acoes.innerHTML = '<a href="login.html">Entrar</a><a class="pill" href="cadastro.html">Criar conta</a>';
  }
}


function sair() {
  sessionStorage.removeItem('ID_USUARIO');
  sessionStorage.removeItem('NOME_USUARIO');
  sessionStorage.removeItem('EMAIL_USUARIO');
  sessionStorage.removeItem('ESTILO_USUARIO');
  sessionStorage.removeItem('META_USUARIO');
  guardarMensagem('Você saiu da conta.');
}


function abrirMenu() {
  if (nav_principal.className == 'nav in') {
    nav_principal.className = 'nav in open';
    btn_menu.setAttribute('aria-expanded', 'true');
  } else {
    nav_principal.className = 'nav in';
    btn_menu.setAttribute('aria-expanded', 'false');
  }
}

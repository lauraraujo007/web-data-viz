/* ==========================================================================
   dados.js  |  as TABELAS FIXAS do site e funções de apoio
   Carregado em TODAS as páginas, antes do app.js.

   Agora os dados que crescem (usuários, ensaios, vídeos assistidos)
   ficam no MySQL e chegam pela API (fetch). Aqui sobraram só:
   - as tabelas de apoio (estilo, tempo_pratica, sentido),
     que o site usa para montar botões e gráficos;
   - "logado": o id do usuário no banco (-1 = ninguém logado);
   - funções pequenas de apoio (primeiro nome, cor, minutos por dia).
   ========================================================================== */

/* ---------- TABELAS DE APOIO (valores fixos) ---------- */

/* tabela estilo: id, nome e cor. A cor muda o site inteiro (variável --accent) */
let estilo_id = ['ballet', 'hiphop', 'contemporaneo', 'kpop', 'outro'];
let estilo_nome = ['Ballet clássico', 'Hip-hop e urbanas', 'Contemporâneo', 'K-pop', 'Outro'];
let estilo_cor = ['#8b7bff', '#ff6a4d', '#3fd6c0', '#ff5fa2', '#9aa3a9'];

/* tabela tempo_pratica: o contato da pessoa com a dança */
let tempo_id = ['curioso', 'infancia', 'pratica'];
let tempo_nome = ['Iniciante curioso', 'Já pratiquei na infância', 'Pratico atualmente'];

/* tabela sentido: o que a dança representa */
let sentido_id = ['emocao', 'saude', 'estresse', 'arte'];
let sentido_nome = ['Expressão emocional', 'Saúde e disciplina', 'Desconexão do estresse', 'Arte e estética'];

/* ---------- QUEM ESTÁ LOGADO ----------
   Ao entrar, o login.js guarda na sessão do navegador (sessionStorage):
   ID_USUARIO, NOME_USUARIO, EMAIL_USUARIO, ESTILO_USUARIO e META_USUARIO.
   logado = id do usuário no MySQL (ou -1 se ninguém entrou). */
let logado = -1;
let primeiroNome = '';   // resultado de pegarPrimeiroNome()
let corConvertida = '';  // resultado de converterCor()
let dias_rotulo = [];    // resultado de calcularMinutosPorDia()
let dias_minutos = [];   // resultado de calcularMinutosPorDia()

/* Ainda não vimos "return", então as funções que calculam algo guardam o
   resultado numa variável global (como no exemplo do contador). */

function identificarLogado() {
  logado = -1;
  let id = sessionStorage.ID_USUARIO;
  if (id != undefined) {
    logado = Number(id);
  }
}

/* Pega só o primeiro nome: anda letra por letra (while + [índice]) até achar o espaço */
function pegarPrimeiroNome(nomeCompleto) {
  primeiroNome = '';
  let i = 0;
  while (i < nomeCompleto.length && nomeCompleto[i] != ' ') {
    primeiroNome += nomeCompleto[i];
    i++;
  }
}

/* Monta os vetores do gráfico "Meu tempo de ensaio" para os últimos "qtdDias" dias.
   "lista" é o que a API devolveu (só os dias que têm ensaio): [{ dia: '2026-11-21', minutos: 35 }, ...]
   Dias sem ensaio entram com 0 minutos. */
function calcularMinutosPorDia(qtdDias, lista) {
  dias_rotulo = [];
  dias_minutos = [];

  // for decrescente: do dia mais antigo até hoje
  for (let i = qtdDias - 1; i >= 0; i--) {
    let dia = new Date(Date.now() - i * 86400000);
    let mes = dia.getMonth() + 1;
    let diaMes = dia.getDate();
    let chave = dia.getFullYear() + '-' + (mes < 10 ? '0' + mes : mes) + '-' + (diaMes < 10 ? '0' + diaMes : diaMes);

    let soma = 0;
    for (let e = 0; e < lista.length; e++) {
      if (lista[e].dia == chave) {
        soma += Number(lista[e].minutos);
      }
    }

    dias_rotulo.push(diaMes + '/' + mes);
    dias_minutos.push(soma);
  }
}

/* Transforma uma cor hexadecimal (#8b7bff) em rgba com transparência.
   Cada par de letras do hexa é um número na base 16 (parseInt(..., 16)).
   Resultado em corConvertida. */
function converterCor(hex, alfa) {
  let vermelho = parseInt(hex.slice(1, 3), 16);
  let verde = parseInt(hex.slice(3, 5), 16);
  let azul = parseInt(hex.slice(5, 7), 16);
  corConvertida = 'rgba(' + vermelho + ',' + verde + ',' + azul + ',' + alfa + ')';
}

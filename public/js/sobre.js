/* ==========================================================================
   sobre.js  |  só de sobre.html
   Monta a linha do tempo "Como o site foi construído" com um vetor e um for.
   Ligação com o HTML (id): div_etapas
   ========================================================================== */

let etapa_titulo = [
  'A ideia',
  'O design',
  'O banco de dados',
  'Os algoritmos',
  'O painel',
  'Os cálculos'
];
let etapa_texto = [
  '춤선 vira nome, cor e movimento: as linhas do corpo ao dançar.',
  'Fundo escuro, roxo como cor principal, linhas animadas e tema claro ou escuro.',
  'MySQL com usuários, estilos, vídeos e ensaios, ligados por relacionamentos 1:1, 1:N e N:N.',
  'JavaScript com variáveis, funções, condicionais, repetições e vetores para dar vida às páginas.',
  'KPIs e gráficos que nascem dos dados: cada número do painel vem de um SELECT.',
  'BPM, calorias, regularidade e binário: matemática aplicada ao ensaio.'
];

function desenharEtapas() {
  let html = '';
  for (let i = 0; i < etapa_titulo.length; i++) {
    html += '<li><span class="num">' + (i + 1) + '</span><div><h3>' + etapa_titulo[i] + '</h3><p>' + etapa_texto[i] + '</p></div></li>';
  }
  div_etapas.innerHTML = html;
}

/* ---------- INÍCIO ---------- */
iniciarPagina('sobre');
desenharEtapas();

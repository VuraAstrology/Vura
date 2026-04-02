const TEMAS = [
  {
    id: 'noite',
    nome: 'Vura',
    desc: 'Escuro profundo',
    attr: null,
    previewBg: '#0a1520',
    bars: ['#48A89A', '#1a3545', '#7ef5de'],
    cor: '#7ef5de'
  },
  {
    id: 'tempestade',
    nome: 'Tempestade Solar',
    desc: 'Energia intensa',
    attr: 'tempestade',
    previewBg: '#2A0C1E',
    bars: ['#910826', '#AC1950', '#FFFAED'],
    cor: '#F79DA6'
  },
  {
    id: 'orion',
    nome: 'Nebulosa de Orion',
    desc: 'Pastel suave',
    attr: 'orion',
    previewBg: '#eff7ff',
    bars: ['#A594FD', '#C092F1', '#000541'],
    cor: '#7F58F0'
  },
  {
    id: 'eclipse',
    nome: 'Eclipse Total',
    desc: 'Alto contraste',
    attr: 'eclipse',
    previewBg: '#000000',
    bars: ['#FFFFFF', '#C0C0C0', '#808080'],
    cor: '#FFFFFF'
  },
  {
    id: 'alvorada',
    nome: 'Tempestade de Inverno',
    desc: 'Claro frio',
    attr: 'alvorada',
    previewBg: '#AFD0EC',
    bars: ['#e6f0fc', '#013C63', '#6678d4'],
    cor: '#3886b4'
  }
];

let temaSelecionado = null;
let temaAtivo = null;

function getSalvo() {
  return localStorage.getItem('tema') || 'noite';
}

function aplicarNoHTML(id) {
  const tema = TEMAS.find(t => t.id === id);
  if (!tema) return;

  const html = document.documentElement;
  if (tema.attr) {
    html.setAttribute('data-theme', tema.attr);
  } else {
    html.removeAttribute('data-theme');
  }

  // atualiza botão do menu se já existir no DOM
  const label = document.getElementById('theme-label');
  const dot   = document.getElementById('theme-dot');
  if (label) label.textContent = tema.nome;
  if (dot)   dot.style.background = tema.cor;
}

function construirGrid() {
  const grid = document.getElementById('theme-grid');
  if (!grid) return;
  grid.innerHTML = '';

  TEMAS.forEach(t => {
    const card = document.createElement('div');
    card.className = 'theme-card' + (t.id === temaSelecionado ? ' selecionado' : '');
    card.onclick = () => {
      temaSelecionado = t.id;
      construirGrid();
    };
    card.innerHTML = `
      <div class="theme-card-check">✓</div>
      <div class="theme-card-preview" style="background:${t.previewBg}">
        ${t.bars.map(c => `<span style="background:${c}"></span>`).join('')}
      </div>
      <div class="theme-card-nome" style="color:${t.cor}">${t.nome}</div>
      <div class="theme-card-desc">${t.desc}</div>
    `;
    grid.appendChild(card);
  });
}

function abrirPainelTemas() {
  temaSelecionado = temaAtivo;
  construirGrid();
  const overlay = document.getElementById('theme-overlay');
  overlay.style.display = 'flex';
}

function fecharPainelTemas() {
  document.getElementById('theme-overlay').style.display = 'none';
}

function aplicarTema() {
  if (!temaSelecionado) return;
  temaAtivo = temaSelecionado;
  localStorage.setItem('tema', temaAtivo);
  aplicarNoHTML(temaAtivo);
  fecharPainelTemas();
}

// fecha ao clicar fora do painel
document.addEventListener('vura:nav-ready', () => {
  const overlay = document.getElementById('theme-overlay');

  if (overlay) {
    overlay.addEventListener('click', function (e) {
      if (e.target === this) fecharPainelTemas();
    });
  }
});

// aplica tema salvo imediatamente
(function init() {
  temaAtivo = getSalvo();
  temaSelecionado = temaAtivo;
  aplicarNoHTML(temaAtivo);

  // se o menu for injetado depois, atualiza o botão quando ele aparecer
  const observer = new MutationObserver(() => {
    const label = document.getElementById('theme-label');
    if (label) {
      aplicarNoHTML(temaAtivo);
      observer.disconnect();
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
})();
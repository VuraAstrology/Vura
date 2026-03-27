const TEMAS = [
  {
    id: 'noite',
    nome: 'Noite',
    desc: 'Escuro profundo',
    attr: null,
    previewBg: '#0a1520',
    bars: ['#48A89A', '#1a3545', '#7ef5de'],
    cor: '#7ef5de'
  },
  {
    id: 'aurora',
    nome: 'Aurora',
    desc: 'Roxo estelar',
    attr: 'aurora',
    previewBg: '#160f2e',
    bars: ['#9b7fe8', '#2a1a50', '#c4aaff'],
    cor: '#c4aaff'
  },
  {
    id: 'abissal',
    nome: 'Abissal',
    desc: 'Azul oceano',
    attr: 'abissal',
    previewBg: '#071a2e',
    bars: ['#4a8fc4', '#0d2a42', '#7ec8f5'],
    cor: '#7ec8f5'
  },
  {
    id: 'bruma',
    nome: 'Bruma',
    desc: 'Claro suave',
    attr: 'bruma',
    previewBg: '#ddeae6',
    bars: ['#2d6e62', '#b0d0c8', '#1a4a41'],
    cor: '#2d6e62'
  },
  {
    id: 'pergaminho',
    nome: 'Pergaminho',
    desc: 'Claro sépia',
    attr: 'pergaminho',
    previewBg: '#ebe4d4',
    bars: ['#7a5c2e', '#c8b898', '#4a3518'],
    cor: '#7a5c2e'
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
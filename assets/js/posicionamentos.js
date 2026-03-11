/* ═══════════════════════════════════════════════
    DATA & RENDERING
═══════════════════════════════════════════════ */

function getAstroParam() {
    return new URLSearchParams(window.location.search).get('astro') || null;
}

function setAstroParam(id) {
    const url = new URL(window.location);
    url.searchParams.set('astro', id);
    window.history.pushState({}, '', url);
}

function buildNavLinks(data) {
    // Popula os submenus do nav.js com os astros do JSON
    // nav.js já injetou o menu; os <ul> abaixo existem no DOM agora
    // nav.js usa um único <ul id="desktop-astros-menu"> para desktop e mobile
    const navMenu    = document.getElementById('desktop-astros-menu');
    const selectorEl = document.getElementById('astroSelector');

    if (navMenu)     navMenu.innerHTML    = '';
    if (selectorEl)  selectorEl.innerHTML = '';

    data.posicionamentos.forEach(p => {

        // ── Submenu do nav (desktop hover + mobile drawer) ──
        if (navMenu) {
            const li = document.createElement('li');
            const a  = document.createElement('a');
            a.href        = `?astro=${p.id}`;
            a.textContent = `${p.nome} ${p.simbolo}`;
            a.addEventListener('click', e => { e.preventDefault(); loadAstro(p.id, data); });
            li.appendChild(a);
            navMenu.appendChild(li);
        }

        // ── Pill selector ──
        if (selectorEl) {
            const pill = document.createElement('button');
            pill.className       = 'astro-pill';
            pill.dataset.astroId = p.id;
            pill.innerHTML       = `<span class="pill-symbol">${p.simbolo}</span>${p.nome}`;
            pill.addEventListener('click', () => loadAstro(p.id, data));
            selectorEl.appendChild(pill);
        }
    });
}

function loadAstro(id, data) {
    const pos     = data.posicionamentos.find(p => p.id === id);
    const content = document.getElementById('pageContent');

    // Atualiza pill ativa
    document.querySelectorAll('.astro-pill').forEach(p => {
        p.classList.toggle('active', p.dataset.astroId === id);
    });

    if (!pos) {
        document.title = 'Posicionamentos — Vura Astrology';
        document.getElementById('hero-glyph').textContent = '✦';
        document.getElementById('hero-title').textContent = 'Posicionamento não encontrado';
        content.innerHTML = `
            <div class="not-found">
                <div class="big-symbol">✦</div>
                <h2>Astro não encontrado</h2>
                <p>Escolha um posicionamento acima para explorar.</p>
            </div>`;
        return;
    }

    document.title = `${pos.nome} nos Signos — Vura Astrology`;
    document.getElementById('hero-glyph').textContent = `${pos.nome} ${pos.simbolo}`;
    document.getElementById('hero-title').textContent = `${pos.nome} no Mapa Astral`;

    setAstroParam(id);

    const signosHTML = pos.signos.map((s, i) => `
        <div class="sign-section" style="animation-delay:${(i * 0.05 + 0.05).toFixed(2)}s">
            <div class="sign-img-wrap">
                <img src="${s.imagem}" alt="${s.signo}" onerror="this.style.display='none'">
                <span class="sign-glyph">${s.simbolo}</span>
            </div>
            <div class="sign-body">
                <h2>${pos.nome} em ${s.signo} ${s.simbolo}</h2>
                <p>${s.texto}</p>
            </div>
        </div>
    `).join('');

    content.innerHTML = `
        <div class="intro-block">
            <h2>${pos.nome} ${pos.simbolo} — visão geral</h2>
            <p>${pos.introducao}</p>
        </div>
        ${signosHTML}
    `;

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ═══════════════════════════════════════════════
    INIT — fetch JSON e renderiza
═══════════════════════════════════════════════ */
async function init() {
    try {
        const res = await fetch('./assets/data/posicionamentos.json');
        if (!res.ok) throw new Error('JSON not found');
        const data = await res.json();

        buildNavLinks(data);

        const param = getAstroParam() || data.posicionamentos[0].id;
        loadAstro(param, data);

    } catch (err) {
        console.error(err);
        document.getElementById('pageContent').innerHTML = `
            <div class="not-found">
                <div class="big-symbol">⚠</div>
                <h2>Erro ao carregar dados</h2>
                <p>Verifique se o arquivo <code>data/posicionamentos.json</code> está no lugar certo.</p>
            </div>`;
    }
}

init();
/* ═══════════════════════════════════════════════
    HAMBURGER
═══════════════════════════════════════════════ */
const hamburger    = document.getElementById('hamburger');
const mobileDrawer = document.getElementById('mobileDrawer');

hamburger.addEventListener('click', () => {
    const isOpen = hamburger.classList.toggle('open');
    mobileDrawer.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', isOpen);
    mobileDrawer.setAttribute('aria-hidden', !isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
});
mobileDrawer.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('open');
        mobileDrawer.classList.remove('open');
        hamburger.setAttribute('aria-expanded', false);
        mobileDrawer.setAttribute('aria-hidden', true);
        document.body.style.overflow = '';
    });
});
document.querySelectorAll('.mobile-item[data-target]').forEach(item => {
    item.addEventListener('click', () => {
        const submenu = document.getElementById(item.dataset.target);
        const isOpen  = submenu.classList.toggle('open');
        item.classList.toggle('active', isOpen);
        document.querySelectorAll('.mobile-submenu').forEach(sm => {
            if (sm !== submenu && sm.classList.contains('open')) {
                sm.classList.remove('open');
                sm.previousElementSibling.classList.remove('active');
            }
        });
    });
});
document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && mobileDrawer.classList.contains('open')) {
        hamburger.classList.remove('open');
        mobileDrawer.classList.remove('open');
        hamburger.setAttribute('aria-expanded', false);
        mobileDrawer.setAttribute('aria-hidden', true);
        document.body.style.overflow = '';
    }
});

/* ═══════════════════════════════════════════════
    DATA & RENDERING
═══════════════════════════════════════════════ */

// Read ?astro= from URL, default to first entry
function getAstroParam() {
    return new URLSearchParams(window.location.search).get('astro') || null;
}

// Update URL without page reload
function setAstroParam(id) {
    const url = new URL(window.location);
    url.searchParams.set('astro', id);
    window.history.pushState({}, '', url);
}

// Build nav links from data
function buildNavLinks(data) {
    const desktopMenu  = document.getElementById('desktop-astros-menu');
    const mobileMenu   = document.getElementById('sub-astros');
    const selectorEl   = document.getElementById('astroSelector');

    desktopMenu.innerHTML = '';
    mobileMenu.innerHTML  = '';
    selectorEl.innerHTML  = '';

    data.posicionamentos.forEach(p => {
        // desktop submenu
        const li = document.createElement('li');
        const a  = document.createElement('a');
        a.href        = `?astro=${p.id}`;
        a.textContent = `${p.nome} ${p.simbolo}`;
        a.addEventListener('click', e => { e.preventDefault(); loadAstro(p.id, data); });
        li.appendChild(a);
        desktopMenu.appendChild(li);

        // mobile submenu
        const mli = document.createElement('li');
        const ma  = document.createElement('a');
        ma.href        = `?astro=${p.id}`;
        ma.textContent = `${p.nome} ${p.simbolo}`;
        ma.addEventListener('click', e => { e.preventDefault(); loadAstro(p.id, data); });
        mli.appendChild(ma);
        mobileMenu.appendChild(mli);

        // pill selector
        const pill = document.createElement('button');
        pill.className       = 'astro-pill';
        pill.dataset.astroId = p.id;
        pill.innerHTML       = `<span class="pill-symbol">${p.simbolo}</span>${p.nome}`;
        pill.addEventListener('click', () => loadAstro(p.id, data));
        selectorEl.appendChild(pill);
    });
}

// Render a single posicionamento
function loadAstro(id, data) {
    const pos = data.posicionamentos.find(p => p.id === id);
    const content = document.getElementById('pageContent');

    // update active pill
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

    // update hero + title
    document.title = `${pos.nome} nos Signos — Vura Astrology`;
    document.getElementById('hero-glyph').textContent = `${pos.nome} ${pos.simbolo}`;
    document.getElementById('hero-title').textContent = `${pos.nome} no Mapa Astral`;

    // update URL
    setAstroParam(id);

    // build content HTML
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

    // scroll to top of content smoothly
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ═══════════════════════════════════════════════
    INIT — fetch JSON then render
═══════════════════════════════════════════════ */
async function init() {
    try {
        const res  = await fetch('data/posicionamentos.json');
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
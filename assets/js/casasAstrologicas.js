/* ═══════════════════════════════════════════════
    casas.js — espelho de posicionamentos.js
    Lógica idêntica, adaptada para Casas Astrológicas
═══════════════════════════════════════════════ */

function getCasaParam() {
    return new URLSearchParams(window.location.search).get('casa') || null;
}

function setCasaParam(id) {
    const url = new URL(window.location);
    url.searchParams.set('casa', id);
    window.history.pushState({}, '', url);
}

function buildNavLinks(data) {
    const navMenu = document.getElementById('desktop-casas-menu'); // ajuste conforme seu nav.js
    const selectorEl = document.getElementById('opcaoSelector');

    if (navMenu) navMenu.innerHTML = '';
    if (selectorEl) selectorEl.innerHTML = '';

    data.casas.forEach(c => {

        // ── Submenu do nav ──
        if (navMenu) {
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = `?casa=${c.id}`;
            a.textContent = `${c.numero}ª Casa — ${c.nome}`;
            a.addEventListener('click', e => { e.preventDefault(); loadCasa(c.id, data); });
            li.appendChild(a);
            navMenu.appendChild(li);
        }

        // ── Pill selector ──
        if (selectorEl) {
            const pill = document.createElement('button');
            pill.className = 'opcao-pill';
            pill.dataset.casaId = c.id;
            pill.innerHTML = `<span class="pill-numero">${c.numero}ª</span>${c.nome}`;
            pill.addEventListener('click', () => loadCasa(c.id, data));
            selectorEl.appendChild(pill);
        }
    });
}

function loadCasa(id, data) {
    const casa = data.casas.find(c => c.id === id);
    const content = document.getElementById('conteudoDaPagina');

    // Atualiza pill ativa
    document.querySelectorAll('.opcao-pill').forEach(p => {
        p.classList.toggle('active', p.dataset.casaId === id);
    });

    if (!casa) {
        document.title = 'Casas Astrológicas — Vura Astrology';
        document.getElementById('icone-principal').textContent = '⌂';
        document.getElementById('titulo-principal').textContent = 'Casa não encontrada';
        content.innerHTML = `
            <div class="not-found">
                <div class="big-symbol">⌂</div>
                <h2>Casa não encontrada</h2>
                <p>Escolha uma casa acima para explorar.</p>
            </div>`;
        return;
    }

    document.title = `${casa.numero}ª Casa — ${casa.nome} — Vura Astrology`;
    document.getElementById('icone-principal').textContent = `${casa.numero}ª Casa`;
    document.getElementById('titulo-principal').textContent = `A Casa de ${casa.nome}`;

    setCasaParam(id);

    const signosHTML = casa.signos.map((s, i) => `
        <div class="sign-section" style="animation-delay:${(i * 0.05 + 0.05).toFixed(2)}s">
            <div class="sign-img-wrap">
                <img src="${s.imagem}" alt="${s.signo}" onerror="this.style.display='none'">
                <span class="sign-glyph">${s.simbolo}</span>
            </div>
            <div class="sign-body">
                <h2>${s.signo} ${s.simbolo} na ${casa.numero}ª Casa</h2>
                <p>${s.texto}</p>
            </div>
        </div>
    `).join('');

    content.innerHTML = `
        <div class="intro-block">
            <h2>${casa.numero}ª Casa — ${casa.nome} — visão geral</h2>
            <p>${casa.introducao}</p>
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
        const res = await fetch('./assets/data/casas.json');
        if (!res.ok) throw new Error('JSON not found');
        const data = await res.json();

        buildNavLinks(data);

        const param = getCasaParam() || data.casas[0].id;
        loadCasa(param, data);

    } catch (err) {
        console.error(err);
        document.getElementById('conteudoDaPagina').innerHTML = `
            <div class="not-found">
                <div class="big-symbol">⚠</div>
                <h2>Erro ao carregar dados</h2>
                <p>Verifique se o arquivo <code>data/casas.json</code> está no lugar certo.</p>
            </div>`;
    }
}

init();
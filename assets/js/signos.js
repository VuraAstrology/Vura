// ── SIGNO MAP ──
const signoMap = {
    'aries': { nome: 'Aries', imagem: 'aries.png' },
    'taurus': { nome: 'Touro', imagem: 'taurus.png' },
    'gemini': { nome: 'Gêmeos', imagem: 'gemini.png' },
    'cancer': { nome: 'Câncer', imagem: 'cancer.png' },
    'leo': { nome: 'Leão', imagem: 'leo.png' },
    'virgo': { nome: 'Virgem', imagem: 'virgo.png' },
    'libra': { nome: 'Libra', imagem: 'libra.png' },
    'escorpiao': { nome: 'Escorpiao', imagem: 'escorpiao.png' },
    'sagitario': { nome: 'Sagitario', imagem: 'sagitario.png' },
    'capricorn': { nome: 'Capricórnio', imagem: 'capricorn.png' },
    'aquarius': { nome: 'Aquário', imagem: 'aquarius.png' },
    'pisces': { nome: 'Peixes', imagem: 'pisces.png' }
};

// Imagem específica para cada seção
const sectionImages = {
    sun: 'sol.png',
    moon: 'lua.png',
    ascendente: 'ascendente.png'
};

const sections = [
    { jsonKey: 'sun', anchor: 'sol' },
    { jsonKey: 'moon', anchor: 'lua' },
    { jsonKey: 'ascendente', anchor: 'ascendente' }
];

// ── CARREGAR SIGNO ──
async function carregarSigno() {
    const params = new URLSearchParams(window.location.search);
    const signoParam = params.get('signo');
    const main = document.getElementById('conteudoDaPagina');

    if (!signoParam || !signoMap[signoParam]) {
        main.innerHTML = `
            <div class="not-found">
                <div class="big-symbol">✦</div>
                <h2>Signo não encontrado</h2>
                <p>Verifique a URL e tente novamente.</p>
            </div>`;
        return;
    }

    const { nome, imagem } = signoMap[signoParam];

    document.getElementById('titulo-principal').textContent = `Sol, Lua e Ascendente em ${nome}`;
    document.title = `${nome} — Vura Astrology`;

    try {
        const res = await fetch('./assets/data/signos.json');
        const data = await res.json();
        const signo = data.big_three.find(s => s.signo === nome);

        if (!signo) {
            main.innerHTML = `
                <div class="not-found">
                    <div class="big-symbol">?</div>
                    <h2>Dados não encontrados</h2>
                    <p>O conteúdo de ${nome} ainda não foi preenchido no JSON.</p>
                </div>`;
            return;
        }

        const bt = signo.explication_big_three;
        let html = '';

        // ── Intro block com imagem do signo ──
        html += `
            <div class="intro-block">
                <div class="intro-block-inner">
                    <img class="intro-signo-img" src="./assets/imagens/${imagem}" alt="${nome}">
                    <div class="intro-block-text">
                        <h2>O que é o Big Three?</h2>
                        <p>O Big Three (ou \"Os Três Grandes\") na astrologia refere-se aos três posicionamentos mais importantes em um mapa natal: SOL, LUA e ASCENDENTE. Juntos, eles formam a base da personalidade de um indivíduo, unindo a essência (SOL ⊙), as emoções (LUA ☾) e a forma como você se apresenta para o mundo (Ascendente).</p>
                        <p style="margin-top:10px">Sol (Signo Solar): Define seu interior, essência, ego e os propósitos principais da vida.</p>
                        <p>Lua (Signo Lunar): Rege suas emoções, mundo interior, necessidades de conforto e intuição.</p>
                        <p>Ascendente (Signo Ascendente): Indica a \"máscara social\" que você usa, como os outros te percebem, sua aparência física e sua abordagem inicial com o mundo.</p>
                        <p style="margin-top:10px; font-style:italic">Enquanto o signo solar é definido diretamente pelo dia do seu nascimento, a Lua depende do momento exato (e dia) e o Ascendente exige a hora e o local do nascimento de forma precisa. Compreender o Big Three oferece uma visão muito mais completa do que apenas o signo solar.</p>
                    </div>
                </div>
            </div>`;

        // ── Sol / Lua / Ascendente com imagem própria ──
        sections.forEach((sec, i) => {
            const block = signo[sec.jsonKey];
            const delay = (i + 1) * 0.12;
            const secImg = sectionImages[sec.jsonKey];
            html += `
                <section class="sign-section" id="${sec.anchor}" style="animation-delay:${delay}s">
                    <div class="sign-img-wrap">
                        <img src="./assets/imagens/${secImg}" alt="${sec.jsonKey}">
                    </div>
                    <div class="sign-body">
                        <h2>${block.titulo}</h2>
                        <p>${block.descricao || 'Conteúdo em breve.'}</p>
                    </div>
                </section>`;
        });

        main.innerHTML = html;

    } catch (err) {
        console.error('Erro ao carregar JSON:', err);
        main.innerHTML = `
            <div class="not-found">
                <div class="big-symbol">⚠</div>
                <h2>Erro ao carregar dados</h2>
                <p>Verifique o caminho do arquivo <code>signos.json</code>.</p>
            </div>`;
    }
}

carregarSigno();